# Azure Developer CLI (AZD) + Bicep Deployment Guide

This guide shows you how to deploy your DentalAI app using Infrastructure as Code (IaC) with Azure Developer CLI and Bicep.

## Prerequisites

- ✅ Azure subscription
- ✅ Azure CLI installed (`az`)
- ✅ Azure Developer CLI installed (`azd`)
- ✅ .NET 9 SDK installed
- ✅ Node.js 22+ installed
- ✅ AI Foundry resource already created

## Quick Start

### 1. Login to Azure

```bash
azd auth login
```

Or use existing Azure CLI login:

```bash
az login
```

### 2. Set SQL Admin Password (Securely)

**Option A: Environment Variable (Current Session)**

```bash
# Set it in your terminal (only for current session)
export SQL_ADMIN_PASSWORD="YourStrongPassword123!"
```

**Option B: AZD Environment (Recommended - Stored Securely)**

```bash
# Store password securely in AZD environment (stored in .azure/ folder, gitignored)
azd env set SQL_ADMIN_PASSWORD "YourStrongPassword123!"

# Verify it's set
azd env get-values
```

> **⚠️ Important:** Never commit passwords to git! The `.azure/` folder is already in `.gitignore`.

### 3. Initialize Environment (First Time)

```bash
azd init
```

This will:

- Prompt for environment name (e.g., `dev`, `prod`)
- Prompt for Azure location (e.g., `westus3`)
- Create `.azure/` folder with environment config

### 4. Provision and Deploy Everything

```bash
azd up
```

This **one command** will:

1. ✅ Create resource group
2. ✅ Create SQL Server + Database (Serverless free tier)
3. ✅ Create Key Vault + store secrets
4. ✅ Create App Service Plan + Web App (Free F1 tier)
5. ✅ Create Static Web Apps (free tier)
6. ✅ Configure all connections, CORS, app settings
7. ✅ Build your backend (.NET)
8. ✅ Build your frontend (Angular)
9. ✅ Deploy both to Azure

### 5. Update AI Foundry Secrets

After deployment, you need to manually set your AI Foundry API key:

```bash
# Get your Key Vault name from outputs
az keyvault secret set \
  --vault-name <your-keyvault-name> \
  --name AzureOpenAI-ApiKey \
  --value "your-actual-api-key"
```

## Files Created

```
dentalapp/
├── azure.yaml              # Service definitions (backend + frontend)
├── infra/
│   ├── main.bicep          # All Azure resources (IaC)
│   └── main.parameters.json # Parameters
└── .azure/                 # Environment config (created by azd)
```

## Common Commands

```bash
# Deploy infrastructure + code
azd up

# Just deploy code (infrastructure already exists)
azd deploy

# View what will be deployed
azd show

# See live logs
azd monitor --live

# List environments
azd env list

# Show environment variables
azd env get-values

# Delete everything (careful!)
azd down
```

## What Gets Created

### Free Tier Resources

- **SQL Database**: Serverless (100K vCore seconds/month free)
- **App Service**: Free F1 tier
- **Static Web Apps**: Free tier
- **Key Vault**: Free tier (10K operations/month)

**Total Cost:** ~$1-5/month (just AI usage)

### Resource Names

Resources are automatically named with unique tokens:

- SQL Server: `azsql<token>`
- Database: `azdb<token>`
- Key Vault: `azkv<token>`
- App Service: `azapi<token>`
- Static Web App: `azswa<token>`

## Configuration

### Backend App Settings

Configured automatically via Bicep:

- `DefaultConnection` → Key Vault reference
- `AzureOpenAI__Endpoint` → Key Vault reference
- `AzureOpenAI__ApiKey` → Key Vault reference
- `AzureOpenAI__DeploymentName` → Key Vault reference
- `FrontendUrl` → Static Web App URL

### Frontend Configuration

You'll need to update `frontend/src/environments/environment.prod.ts`:

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://<your-app-service-name>.azurewebsites.net/api',
};
```

## Troubleshooting

### Deployment Fails

```bash
# Check deployment status
azd show

# View logs
azd monitor --live

# Try again
azd up
```

### Free Tier Quota Error

If you see: **"SubscriptionIsOverQuotaForSku"** or **"Current Limit (Free VMs): 0"**

Your subscription doesn't have free VM quota. Options:

**Option 1: Request Quota Increase (Free)**

1. Go to Azure Portal → **Subscriptions** → Your subscription
2. Click **Usage + quotas**
3. Search for **"App Service"** or **"Free"**
4. Click **Request increase**
5. Request 1 Free VM for App Service
6. Wait for approval (usually 24-48 hours)

**Option 2: Use Basic Tier Temporarily**
Update `infra/main.bicep` line 154-157:

```bicep
sku: {
  name: 'B1'
  tier: 'Basic'
  capacity: 1
}
```

This costs ~$13/month but works immediately.

**Option 3: Use Portal Instead**
Create App Service manually in Portal - sometimes Portal allows free tier when IaC doesn't.

### SQL Connection Issues

- Verify Key Vault has `SqlConnectionString` secret
- Check App Service managed identity has Key Vault access
- Verify SQL Server firewall allows Azure services

### CORS Errors

- Check `FrontendUrl` in App Service app settings matches Static Web App URL
- Verify CORS configuration in `main.bicep`

### Update Secrets

```bash
az keyvault secret set \
  --vault-name <keyvault-name> \
  --name <secret-name> \
  --value "<new-value>"
```

## Next Steps

1. **Update AI Foundry API Key** (see step 5 above)
2. **Run database migrations:**
   ```bash
   cd backend/DentalAI.API
   dotnet ef database update --connection "your-connection-string"
   ```
3. **Test the deployment:**
   - Backend: `https://<app-service-name>.azurewebsites.net/swagger`
   - Frontend: `https://<static-web-app-name>.azurestaticapps.net`

## Cleanup

To delete all resources:

```bash
azd down
```

This deletes the entire resource group and all resources.
