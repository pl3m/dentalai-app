# Azure Deployment Guide for DentalAI

This guide walks you through deploying your DentalAI application to Azure.

> **💡 FREE TIER OPTION:** See "Free Tier Deployment Strategy" section below for $0/month deployment options!

> **🚀 QUICK DEPLOYMENT:** Want to deploy everything with one command? See **[AZD_DEPLOYMENT.md](./AZD_DEPLOYMENT.md)** for Infrastructure as Code (IaC) deployment using Azure Developer CLI + Bicep!

## Architecture Overview

```
Azure Resources:
├── Azure SQL Database (Production database)
├── Azure App Service (Backend API - .NET 9)
├── Azure Static Web Apps (Frontend - Angular)
├── Azure AI Foundry (Already set up ✅)
├── Azure Key Vault (Secrets management)
└── Application Insights (Monitoring)
```

## Prerequisites

- Azure subscription with appropriate permissions
- Azure CLI installed (or use Azure Portal)
- .NET 9 SDK installed
- Node.js and Angular CLI installed
- Your AI Foundry resource already created (✅ Done)

---

## Step 1: Create Azure SQL Database

### Option A: Using Azure Portal

1. Go to Azure Portal → "Create a resource"
2. Search for "Azure SQL Database"
3. Click "Create"
4. **Basics:**
   - **Database name:** `dentalai-db`
   - **Server:** Create new server
     - **Server name:** `dentalai-sql-server` (must be globally unique)
     - **Location:** Same region as your other resources (West US 3)
     - **Admin login:** `dentaladmin` (or your choice)
     - **Password:** Create a strong password (save this!)
   - **Want to use SQL elastic pool?** No
   - **Compute + storage:**
     - ✅ **For FREE tier:** Select **Serverless** tier (FREE: 100K vCore seconds, 32GB storage/month)
     - Or Basic tier ($5/month) for always-on
5. **Networking:**
   - **Connectivity method:** Public endpoint (for now)
   - **Allow Azure services and resources to access this server:** Yes
   - **Add current client IP address:** Yes (for your local access)
6. **Security:** Default settings
7. **Tags:** Add your tags (Project=DentalAI, Environment=Production)
8. **Review + Create** → **Create**

### Option B: Using Azure CLI

```bash
# Login to Azure
az login

# Create resource group (if not exists)
az group create --name rg-dentalgroup-dev --location westus3

# Create SQL server
az sql server create \
  --name dentalai-sql-server \
  --resource-group rg-dentalgroup-dev \
  --location westus3 \
  --admin-user dentaladmin \
  --admin-password "YourStrongPassword123!"

# Create SQL database (Serverless FREE tier)
az sql db create \
  --resource-group rg-dentalgroup-dev \
  --server dentalai-sql-server \
  --name dentalai-db \
  --service-objective S0 \
  --compute-model Serverless \
  --auto-pause-delay 60 \
  --min-capacity 0.5 \
  --max-capacity 2

# Or use Basic tier ($5/month, always-on)
# --service-objective Basic
```

### Get Connection String

1. Go to your SQL database in Azure Portal
2. Click "Connection strings" in left menu
3. Copy the **ADO.NET** connection string
4. Replace `{your_password}` with your actual password
5. Save this for later steps

**Example format:**

```
Server=tcp:dentalai-sql-server.database.windows.net,1433;Initial Catalog=dentalai-db;Persist Security Info=False;User ID=dentaladmin;Password=YourPassword;MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;
```

---

## Step 2: Create Azure Key Vault

### Using Azure Portal

1. "Create a resource" → Search "Key Vault"
2. **Basics:**
   - **Name:** `dentalai-kv` (must be globally unique)
   - **Resource Group:** `rg-dentalgroup-dev`
   - **Region:** West US 3
3. **Access policy:**
   - Add your user account with permissions:
     - Key, Secret, Certificate: Get, List, Set
4. **Tags:** Add your tags
5. **Create**

### Store Secrets in Key Vault

After creation, go to Key Vault → **Secrets** → **+ Generate/Import**:

**Secret 1: SQL Connection String**

- **Name:** `SqlConnectionString`
- **Value:** Your SQL connection string from Step 1

**Secret 2: AI Foundry Endpoint**

- **Name:** `AzureOpenAI-Endpoint`
- **Value:** `https://dentalai-foundry.services.ai.azure.com/`

**Secret 3: AI Foundry API Key**

- **Name:** `AzureOpenAI-ApiKey`
- **Value:** Your API key from AI Foundry

**Secret 4: AI Deployment Name**

- **Name:** `AzureOpenAI-DeploymentName`
- **Value:** `Phi-4-mini-instruct`

---

## Step 3: Deploy Backend (Azure App Service)

### Option A: Using Azure Portal

1. "Create a resource" → Search "Web App"
2. **Basics:**
   - **Name:** `dentalai-api` (must be globally unique)
   - **Publish:** Code
   - **Runtime stack:** .NET 9
   - **Operating System:** Linux (or Windows)
   - **Region:** West US 3
   - **App Service Plan:** Create new or use existing
     - **Name:** `dentalai-plan`
     - **Sku:** Basic B1 ($13/month) or Free F1 for testing
3. **Deployment:** None (we'll deploy manually or via CI/CD)
4. **Tags:** Add your tags
5. **Review + Create** → **Create**

### Option B: Using Azure CLI

```bash
# Create App Service plan
az appservice plan create \
  --name dentalai-plan \
  --resource-group rg-dentalgroup-dev \
  --location westus3 \
  --sku B1 \
  --is-linux

# Create Web App
az webapp create \
  --name dentalai-api \
  --resource-group rg-dentalgroup-dev \
  --plan dentalai-plan \
  --runtime "DOTNET|9.0"
```

### Configure App Service

1. Go to your App Service → **Configuration** → **Application settings**

2. **Add Connection String:**

   - **Name:** `DefaultConnection`
   - **Value:** `@Microsoft.KeyVault(SecretUri=https://dentalai-kv.vault.azure.net/secrets/SqlConnectionString/)`
   - **Type:** Custom

3. **Add Application Settings:**

   - `AzureOpenAI__Endpoint` = `@Microsoft.KeyVault(SecretUri=https://dentalai-kv.vault.azure.net/secrets/AzureOpenAI-Endpoint/)`
   - `AzureOpenAI__ApiKey` = `@Microsoft.KeyVault(SecretUri=https://dentalai-kv.vault.azure.net/secrets/AzureOpenAI-ApiKey/)`
   - `AzureOpenAI__DeploymentName` = `Phi-4-mini-instruct`
   - `ASPNETCORE_ENVIRONMENT` = `Production`

4. **Enable Managed Identity:**

   - Go to **Identity** → **System assigned** → **On** → **Save**
   - Go to Key Vault → **Access policies** → **+ Add Access Policy**
   - **Principal:** Select your App Service (dentalai-api)
   - **Secret permissions:** Get, List
   - **Save**

5. **CORS Configuration:**
   - Go to **CORS** in App Service
   - Add your frontend URL: `https://your-frontend-url.azurestaticapps.net` (we'll update after frontend deployment)
   - For now, add: `*` (allow all - change this after deployment)

### Deploy Backend Code

**Method 1: Using Azure CLI (Zip Deploy)**

```bash
cd backend/DentalAI.API

# Build the project
dotnet publish -c Release -o ./publish

# Create zip file
cd publish
zip -r ../app.zip .
cd ..

# Deploy to Azure
az webapp deployment source config-zip \
  --resource-group rg-dentalgroup-dev \
  --name dentalai-api \
  --src app.zip
```

**Method 2: Using Visual Studio / VS Code**

- Right-click project → **Publish** → **Azure** → Select your App Service → **Publish**

**Method 3: Using GitHub Actions (CI/CD)**

- See "Step 6: CI/CD Pipeline" below

### Run Database Migrations

After deployment, run EF Core migrations:

```bash
# Set connection string environment variable
export ConnectionStrings__DefaultConnection="YourConnectionString"

# Run migrations
cd backend/DentalAI.API
dotnet ef database update
```

Or use Azure App Service **SSH/Console**:

1. Go to App Service → **SSH** (or **Console**)
2. Navigate to `/home/site/wwwroot`
3. Run: `dotnet ef database update` (if EF tools installed)

**Better approach:** Create a startup script that runs migrations automatically.

---

## Step 4: Deploy Frontend (Azure Static Web Apps)

### Option A: Using Azure Portal

1. "Create a resource" → Search "Static Web App"
2. **Basics:**
   - **Name:** `dentalai-frontend`
   - **Resource Group:** `rg-dentalgroup-dev`
   - **Region:** West US 3
   - **Hosting Plan:** Free (or Standard for custom domains)
3. **Deployment details:**
   - **Source:** GitHub (recommended) or Other
   - Follow wizard to connect your GitHub repo
4. **Build details:**
   - **Build presets:** Custom
   - **App location:** `/frontend`
   - **Api location:** (leave empty)
   - **Output location:** `dist/frontend/browser`
5. **Tags:** Add your tags
6. **Review + Create** → **Create**

### Option B: Manual Deployment

1. Build the frontend:

   ```bash
   cd frontend
   npm install
   ng build --configuration production
   ```

2. Upload to Azure Storage + Static Website:
   - Create Storage Account
   - Enable Static Website hosting
   - Upload `dist/frontend/browser/*` files

### Update Frontend Environment

Update `frontend/src/environments/environment.prod.ts`:

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://dentalai-api.azurewebsites.net/api',
};
```

Replace `dentalai-api.azurewebsites.net` with your actual App Service URL.

---

## Step 5: Update CORS Configuration

After frontend is deployed, update backend CORS:

1. Go to App Service → **CORS**
2. Remove `*` (wildcard)
3. Add your frontend URL: `https://dentalai-frontend.azurestaticapps.net`
4. **Save**

Update `Program.cs` CORS configuration for production (optional - environment-specific):

```csharp
// In Program.cs, update CORS configuration
if (builder.Environment.IsProduction())
{
    options.AddPolicy("AllowAngular", policy =>
    {
        policy.WithOrigins("https://dentalai-frontend.azurestaticapps.net")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
}
```

---

## Step 6: Database Migrations

### Create Migration Script

Create a file `backend/DentalAI.API/scripts/deploy.sh`:

```bash
#!/bin/bash
# Run this after deploying to App Service
# Or use Azure App Service startup command

dotnet ef database update
```

Or configure in App Service:

- **Configuration** → **General settings** → **Startup command:**
  - `dotnet DentalAI.API.dll && dotnet ef database update`

### Initial Migration

Before first deployment:

```bash
cd backend/DentalAI.API
dotnet ef migrations add InitialCreate
dotnet ef migrations script -o migration.sql
```

Then run `migration.sql` against your Azure SQL Database.

---

## Step 7: Application Insights (Optional but Recommended)

1. "Create a resource" → Search "Application Insights"
2. **Basics:**
   - **Name:** `dentalai-insights`
   - **Resource Group:** `rg-dentalgroup-dev`
   - **Region:** West US 3
3. **Create**

### Connect to App Service

1. Go to App Service → **Application Insights**
2. **Enable Application Insights** → Select your insights resource
3. **Save**

This provides:

- Request tracking
- Performance monitoring
- Error logging
- Usage analytics

---

## Step 8: Security Enhancements

### 1. SQL Database Firewall

- Go to SQL Server → **Networking**
- **Public network access:** Allow Azure services only (recommended)
- Add App Service IP address to firewall rules

### 2. Private Endpoints (Advanced)

- Create Private Endpoint for SQL Database
- Create Private Endpoint for Key Vault
- More secure but requires VNet configuration

### 3. Enable HTTPS Only

- App Service → **Configuration** → **General settings**
- **HTTPS only:** On

---

## Step 9: Testing Deployment

1. **Backend API:**

   - Visit: `https://dentalai-api.azurewebsites.net/swagger`
   - Test endpoints

2. **Frontend:**

   - Visit: `https://dentalai-frontend.azurestaticapps.net`
   - Test patient creation
   - Test AI features

3. **Verify:**
   - Database connections work
   - AI services work (SOAP summaries, letters)
   - CORS is configured correctly

---

## Step 10: CI/CD Pipeline (GitHub Actions)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Azure

on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup .NET
        uses: actions/setup-dotnet@v3
        with:
          dotnet-version: '9.0.x'

      - name: Build
        run: dotnet build backend/DentalAI.API/DentalAI.API.csproj -c Release

      - name: Publish
        run: dotnet publish backend/DentalAI.API/DentalAI.API.csproj -c Release -o ./publish

      - name: Deploy to Azure
        uses: azure/webapps-deploy@v2
        with:
          app-name: dentalai-api
          publish-profile: ${{ secrets.AZURE_WEBAPP_PUBLISH_PROFILE }}
          package: ./publish

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '22'

      - name: Install dependencies
        run: |
          cd frontend
          npm install

      - name: Build
        run: |
          cd frontend
          npm run build -- --configuration production

      - name: Deploy to Azure Static Web Apps
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
          repo_token: ${{ secrets.GITHUB_TOKEN }}
          action: 'upload'
          app_location: 'frontend'
          output_location: 'dist/frontend/browser'
```

---

## Quick Deployment Checklist

- [ ] Azure SQL Database created
- [ ] Connection string saved
- [ ] Azure Key Vault created
- [ ] Secrets stored in Key Vault (SQL connection, AI credentials)
- [ ] Azure App Service created (backend)
- [ ] App Service configured (Key Vault references, CORS)
- [ ] Backend code deployed
- [ ] Database migrations run
- [ ] Azure Static Web Apps created (frontend)
- [ ] Frontend built and deployed
- [ ] CORS updated with frontend URL
- [ ] Application Insights configured (optional)
- [ ] Test end-to-end functionality
- [ ] Set up CI/CD pipeline (optional)

---

## 💰 Free Tier Deployment Strategy

If you want to deploy for **$0/month** (or very low cost), here are your options:

### Option 1: Azure for Students Free Credits

If you have Azure for Students subscription:

- **$100 free credit** (valid for 12 months)
- Many services are free for students
- Can deploy full stack within free tier limits

### Option 2: Free Tier Services Only

**Database:**

- ✅ **Azure SQL Database Serverless FREE Tier:**
  - **First 100,000 vCore seconds/month FREE** (lifetime)
  - **32GB storage FREE** per month
  - **32GB backup storage FREE** per month
  - Limit: 10 free databases per subscription
  - Perfect for development/small apps!
- ✅ **Alternative:** Use SQLite in Azure App Service (if you hit the free tier limit)

**Backend:**

- ✅ **Azure App Service Free (F1):**
  - Free forever (with limitations)
  - 1 GB storage
  - 60 minutes CPU/day
  - No custom domains (use \*.azurewebsites.net)
  - Great for development/testing

**Frontend:**

- ✅ **Azure Static Web Apps Free:**
  - Free forever
  - 100 GB bandwidth/month
  - Unlimited custom domains
  - Perfect for Angular apps

**Secrets:**

- ✅ **Azure Key Vault:**
  - First 10,000 operations/month free
  - Usually enough for small apps

**AI:**

- ⚠️ **Azure AI Foundry:**
  - No free tier
  - Pay-per-token (very low cost for testing: $1-5/month)

### Recommended Free Setup

1. **Database:** ✅ **Azure SQL Database Serverless (FREE tier)**
   - 100,000 vCore seconds/month free
   - 32GB storage + 32GB backup free
   - Auto-pauses when inactive (saves resources)
   - Resume automatically on first request
2. **Backend:** Azure App Service Free (F1)
3. **Frontend:** Azure Static Web Apps Free
4. **Secrets:** Azure Key Vault (free tier)
5. **AI:** Azure AI Foundry (pay-per-use, minimal cost)

**Total Cost:** ~$1-5/month (just AI usage) 🎉

> **Note:** Azure SQL Serverless auto-pauses after 1-6 hours of inactivity, then auto-resumes on first query (takes ~30-60 seconds).

### Quick Free Deployment Checklist

For **FREE deployment**, use these settings:

- [ ] **App Service:** Free (F1) tier
- [ ] **Static Web Apps:** Free tier
- [ ] **Database:** ✅ **Azure SQL Database Serverless (FREE tier)** - Use this instead of SQLite!
- [ ] **Key Vault:** Free tier (10K operations/month)
- [ ] **AI Foundry:** Pay-per-use (~$1-5/month)

**Note:** Azure SQL Serverless FREE tier gives you:

- 100,000 vCore seconds/month (plenty for small apps)
- 32GB storage free
- Auto-pauses when not in use (saves resources)
- Much better than SQLite for production!

### Limitations of Free Tier

**App Service Free (F1):**

- ❌ 60 minutes CPU/day limit
- ❌ App sleeps after 20 minutes of inactivity
- ❌ No custom SSL (use \*.azurewebsites.net)
- ❌ 1 GB storage limit
- ✅ Perfect for development/demos

**Workarounds:**

- Use **Always On** feature (requires Basic tier, $13/month)
- Or accept the cold start (first request takes longer after inactivity)

### Free Tier Deployment Steps

Follow the main deployment guide but:

1. **For App Service:**

   - Choose **Free (F1)** tier instead of Basic
   - Accept limitations

2. **For Database:**

   - Option A: Use PostgreSQL free tier (if available)
   - Option B: Keep SQLite (simple but limited)
   - Option C: Use Azure Cosmos DB free tier (different database)

3. **Everything else:** Same as paid tier

### Alternative: Self-Hosted Options

If Azure free tier doesn't work:

- **Render.com:** Free tier for both backend and frontend
- **Railway:** Free tier available
- **Fly.io:** Free tier for small apps
- **Vercel:** Free for frontend
- **Heroku:** Has free tier (limited)

---

## Cost Estimate (Monthly)

### 🆓 Free Tier Option

- ✅ App Service Free (F1): **$0**
- ✅ Static Web Apps Free: **$0**
- ✅ **Azure SQL Database Serverless (FREE tier):** **$0** (100K vCore seconds, 32GB storage/month free!)
- ✅ Key Vault (free tier): **$0**
- ⚠️ AI Foundry (pay-per-use): **~$1-5/month**
- **Total:** **~$1-5/month** 🎉

**Limitations:**

- App Service sleeps after inactivity (20 min), 60 min CPU/day
- SQL Serverless auto-pauses after 1-6 hours inactivity (30-60 sec resume time)
- No custom SSL on free tier

### 💰 Paid Options

**Development/Testing:**

- Azure SQL Database Basic: ~$5/month
- App Service Basic B1: ~$13/month
- Static Web Apps Free: $0
- Key Vault: $0 (free tier)
- AI Foundry (pay-as-you-go): ~$5-20/month (depending on usage)
- **Total:** ~$23-38/month

**Production:**

- Azure SQL Database Standard S0: ~$15/month
- App Service Standard S1: ~$73/month
- Static Web Apps Standard: ~$9/month
- Key Vault: $0.03/10K operations
- AI Foundry: Pay-per-token
- Application Insights: First 5GB free
- **Total:** ~$97+/month

---

## Troubleshooting

### Backend won't start

- Check Application Insights logs
- Verify Key Vault access policy
- Check connection string format

### Database connection fails

- Verify firewall rules allow App Service IP
- Check connection string in Key Vault
- Verify SQL Server is accessible

### CORS errors

- Verify frontend URL in CORS settings
- Check browser console for exact error
- Ensure credentials are included in requests

### AI features not working

- Verify secrets in Key Vault
- Check App Service logs
- Verify AI Foundry endpoint is accessible

---

## Next Steps

After deployment:

1. Set up monitoring alerts
2. Configure backup strategy for SQL Database
3. Set up staging environment
4. Implement authentication (JWT)
5. Add SSL certificates for custom domains
6. Configure auto-scaling for App Service
