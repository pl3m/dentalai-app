# Azure AI Foundry Setup Guide for DentalAI

## Quick Setup Steps

### 1. Create Azure AI Foundry Resource

1. Go to https://portal.azure.com
2. Click "Create a resource" or search for "Azure AI"
3. You'll see resource type options - select **"Azure AI Foundry"** (not "Azure AI Project")
4. Click "Create"
5. Fill in the Basics tab:
   - **Resource Group**:
     - Select **"Create new"**
     - Name: `rg-dentalai-dev` (or your choice)
   - **Name**: `dentalai-foundry` (or your preferred name)
   - **Region**: Choose a supported region (see "Region Selection" note below)
     - **Important**: Some subscriptions have region restrictions
     - If you get an error, try: East US, West US 2, or West Europe
     - Or check your subscription's allowed regions (see Troubleshooting section)
   - **Subscription**: Your Azure subscription
6. Configure additional settings:
   - **Pricing Tier**: Select appropriate tier
   - **Network inbound access**: **"All networks"** (for local development)
7. **Tags** (optional but recommended):
   - Navigate to the "Tags" tab (click "Next: Tags" or find Tags in the tabs)
   - In the Tags section, you'll see a table with columns: **Name**, **Value**, and **Resource**
   - For each tag, fill in three fields:
     - **Name** field: Enter `Project`
     - **Value** field: Enter `DentalAI`
     - **Resource** dropdown: Select which resources this tag applies to:
       - Check **"Azure AI Foundry"** (the main resource)
       - Check **"Azure AI Foundry project"** (future projects within Foundry)
       - Check **"Resource group"** (to tag the resource group)
       - Or use **"Select all"** to apply to all types
   - Click to add another tag row and repeat:
     - **Name**: `Environment`
     - **Value**: `Development`
     - **Resource**: Select all or specific resource types
   - Add one more tag:
     - **Name**: `Purpose`
     - **Value**: `AI-Summarization`
     - **Resource**: Select all or specific resource types
8. Click "Review + create" → "Create"
9. Wait 2-5 minutes for deployment

**Note**: Make sure to select **"Azure AI Foundry"** as the resource type, not "Azure AI Project". Azure AI Projects are created within an AI Foundry resource after the hub is created.

### 2. Get Your Credentials

1. Navigate to your Azure AI Foundry resource in the portal
2. Go to **"Keys and Endpoint"** (left menu)
3. Copy:
   - **Endpoint**: `https://your-resource-name.services.ai.azure.com/`
   - **Key 1** or **Key 2**: Copy either one (both work)

### 3. Deploy a Model

1. In your Azure AI Foundry resource, go to **"Models"** or **"Deployments"**
2. Click **"+ Create"** or **"Deploy model"**
3. Select a model:
   - Choose **GPT-4** or **GPT-4 Turbo** from the model catalog
   - **Deployment name**: `gpt-4` (or match what you use in config)
   - Click **"Create"**
4. Wait for deployment to complete (a few minutes)

### 4. Configure Your Application

Update `backend/DentalAI.API/appsettings.Development.json`:

```json
{
  "AzureOpenAI": {
    "Endpoint": "https://your-resource-name.services.ai.azure.com/",
    "ApiKey": "your-api-key-here",
    "DeploymentName": "gpt-4"
  }
}
```

**Replace:**

- `your-resource-name` → Your actual AI Foundry resource name
- `your-api-key-here` → Key 1 or Key 2 from step 2
- `gpt-4` → Your deployment name (must match exactly)

### 5. Restart Backend

After saving the config file:

```bash
# Stop the current backend (Ctrl+C or kill process)
# Then restart:
cd backend/DentalAI.API
dotnet run
```

## Verify It Works

1. Check backend logs for: `"AIService registered successfully with Azure OpenAI"`
2. In the frontend, try clicking "Generate SOAP Summary (AI)" on a note
3. You should see AI-generated content instead of an error!

## Important Notes

- **Endpoint Format**: AI Foundry uses `*.services.ai.azure.com/` (not `*.openai.azure.com/`)
- **Deployment Name**: Must match exactly between portal and config
- **Security**: Never commit API keys to Git! `appsettings.Development.json` should be in `.gitignore`
- **Costs**: Azure AI Foundry charges per token usage. Monitor costs in Azure Portal
- **Network Access**: "All networks" is fine for development. For production, consider restricting to specific IPs or using Private Endpoints
- **Tags**: Adding tags helps organize resources, track costs, and **select/filter resources** in the Azure Portal, PowerShell, and CLI. Recommended tags: `Project`, `Environment`, `Purpose`

## Troubleshooting

### Error: "Azure OpenAI is not configured"

- Check that endpoint and API key are not empty
- Verify endpoint URL ends with `/`
- Restart backend after changing config

### Error: "Deployment not found"

- Deployment name in config must match exactly
- Check that deployment is completed in Azure portal
- Wait a few minutes after creating deployment

### Error: 401 Unauthorized

- API key might be incorrect
- Try regenerating Key 1 or using Key 2

### Error: InvalidTemplateDeployment / RequestDisallowedByAzure

**Region Policy Restriction**

If you see an error like:

```
Resource 'dentalai-foundry' was disallowed by Azure: This policy maintains
a set of best available regions where your subscription can deploy resources.
```

**Your subscription has region restrictions.** Try these solutions:

#### Solution 1: Use an Allowed Region

Common allowed regions to try:

- **East US** (`eastus`)
- **West US 2** (`westus2`)
- **West Europe** (`westeurope`)
- **Central US** (`centralus`)

#### Solution 2: Find Your Allowed Regions

**Using Azure Portal:**

1. Go to **Subscriptions** in Azure Portal
2. Select your subscription
3. Go to **Policies** → Look for region restriction policies
4. Check **Allowed Locations** or **Allowed Regions** policy

**Using Azure CLI:**

```bash
# List subscription locations
az account list-locations --output table

# Check for region restrictions
az policy assignment list --scope /subscriptions/YOUR_SUBSCRIPTION_ID
```

**Using PowerShell:**

```powershell
Get-AzLocation | Select-Object Location, DisplayName
```

#### Solution 3: Contact Azure Support

- If you need a specific region that's restricted
- Request to add regions to your subscription's allowed list
- Go to Azure Portal → Help + Support → Create a support request

#### Quick Fix

Try recreating with a different region:

- In the create wizard, change the **Region** dropdown
- Try **East US** or **West US 2** first (commonly allowed)
- If those don't work, try **West Europe** or **Central US**

## Using Tags to Select Resources

Tags are powerful for resource management:

### In Azure Portal

- Use **Tags** filter to find all resources with `Project=DentalAI`
- Filter by `Environment=Development` to see only dev resources
- Search across subscriptions using tag filters

### In Azure CLI

```bash
# List all resources with specific tag
az resource list --tag Project=DentalAI

# List resources by environment
az resource list --tag Environment=Development
```

### In PowerShell

```powershell
# Find all resources with tags
Get-AzResource -Tag @{Project="DentalAI"; Environment="Development"}
```

### For Cost Management

- Group costs by `Project` tag in Cost Analysis
- Filter billing reports by `Environment`
- Track spending per project or team

## Next Steps

Once configured, you can:

- Generate SOAP summaries from clinical notes
- Create professional referral letters
- Consider experimenting with other models available in Foundry (Meta, Mistral, etc.)
- Use tags to manage all your Azure resources efficiently
