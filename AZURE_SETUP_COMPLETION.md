# Azure AI Foundry Setup Completion Guide

## Current Status

✅ **AI Foundry Resource Created:**
- Resource Name: `dentalai-foundry`
- Resource Group: `rg-dentalgroup-dev`
- Location: `westus2`
- Endpoint: `https://dentalai-foundry.cognitiveservices.azure.com/`
- Project: `dentalai-project` (within the Foundry)
- Status: Resource and project exist but **no models deployed yet**

⚠️ **Important:** Your Azure for Students subscription requires deploying models through the Azure Portal UI. Programmatic deployment is not available.

## Next Steps to Complete Setup

### Step 1: Deploy a Model via Azure Portal

1. **Navigate to Azure Portal:**
   - Go to https://portal.azure.com
   - Find your resource: `dentalai-foundry` in resource group `rg-dentalgroup-dev`

2. **Go to Your Azure AI Project:**
   - In the AI Foundry resource, go to **"Projects"** in the left menu
   - Click on **"dentalai-project"** (or whatever your project is named)

3. **Deploy a Model:**
   - Inside the project, go to **"Deployments"** or **"Models"** in the left menu
   - Click **"+ Create"** or **"Deploy model"**
   - **Model Selection (Recommended order):**
     1. **GPT-5-nano** (⭐ Excellent choice - newest, likely fastest and most cost-effective)
     2. **GPT-4o-mini** (Great balance of quality and cost)
     3. **GPT-35-turbo** (Reliable fallback, widely available)
     4. **O1-mini** (Excellent for structured outputs like SOAP format)
   - **Deployment name:** Use `gpt-4` to match your config (or update config if you use a different name)
   - Click **"Create"** and wait a few minutes for deployment

   **Why GPT-5-nano?**
   - Newest generation model (likely better than GPT-4o-mini)
   - "Nano" version = optimized for speed and cost-effectiveness
   - Great for structured text generation (SOAP summaries, referral letters)
   - Showing in your available models = likely accessible on your subscription
   - Best value proposition for student subscriptions
   
   **Alternative: GPT-4o-mini**
   - If GPT-5-nano isn't available, this is an excellent choice
   - Proven track record for medical text generation
   - Faster and more cost-effective than full GPT-4

### Step 2: Get Your Credentials

**Option A: Get from Foundry Resource (Recommended)**
1. **In Azure Portal, go to your `dentalai-foundry` resource** (the main resource, not the project)
2. **Click "Keys and Endpoint" in the left menu**

**Option B: Get from Project (if available)**
1. **In Azure Portal, go to your `dentalai-project`** (inside the Foundry resource)
2. **Look for "Keys and Endpoint" or connection settings**

**Copy these values (from either Option A or B):**
- **Endpoint:** Should be `https://dentalai-foundry.cognitiveservices.azure.com/` or `https://dentalai-foundry.services.ai.azure.com/`
- **Key 1** or **Key 2:** Copy either one (both work)

### Step 3: Update Configuration File

Update `backend/DentalAI.API/appsettings.Development.json` with your actual credentials:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Data Source=dentalai.db"
  },
  "Serilog": {
    "MinimumLevel": {
      "Default": "Debug",
      "Override": {
        "Microsoft": "Information",
        "Microsoft.AspNetCore": "Warning"
      }
    }
  },
  "AzureOpenAI": {
    "Endpoint": "https://dentalai-foundry.cognitiveservices.azure.com/",
    "ApiKey": "YOUR_API_KEY_HERE",
    "DeploymentName": "gpt-4"
  }
}
```

**Note:** If you deployed a different model (like `gpt-5-nano`, `gpt-4o-mini`, or `gpt-35-turbo`), you can either:
- Change the deployment name in Azure Portal to `gpt-4` to match this config, OR
- Update `DeploymentName` in the config file to match your actual deployment name

**Replace:**
- `YOUR_API_KEY_HERE` → The Key 1 or Key 2 from Step 2
- `gpt-4` → Your actual deployment name (if different)
- **Endpoint:** Use the exact endpoint from "Keys and Endpoint" page

**Important Note on Endpoint Format:**
- The endpoint might be either:
  - `https://dentalai-foundry.cognitiveservices.azure.com/` (Cognitive Services format)
  - `https://dentalai-foundry.services.ai.azure.com/` (AI Foundry format)
- Use whichever format Azure Portal shows in "Keys and Endpoint"
- Make sure it ends with `/`

### Step 4: Verify Configuration

1. **Restart the backend:**
   ```bash
   cd backend/DentalAI.API
   dotnet run
   ```

2. **Check logs for:**
   ```
   AIService registered successfully with Azure OpenAI
   ```

3. **Test AI Features:**
   - Start the frontend: `cd frontend && ng serve`
   - Navigate to a patient detail page
   - Create a note
   - Click "Generate SOAP Summary (AI)"
   - You should see AI-generated content!

## Troubleshooting

### Error: "Deployment not found"
- Check that deployment name in config matches the deployment name in Azure Portal exactly
- Wait a few minutes after creating deployment

### Error: "401 Unauthorized"
- API key might be incorrect - regenerate Key 1 or try Key 2
- Make sure endpoint ends with `/`

### Error: "Model not available" / Quota Issues
- Azure for Students subscriptions may have limited model access
- Try GPT-4o-mini or GPT-3.5-turbo instead
- You may need to request access through Azure support

### Endpoint Format Issues
- If you get endpoint errors, check the exact format in Azure Portal
- AI Foundry uses `*.services.ai.azure.com/` format
- Legacy Cognitive Services uses `*.cognitiveservices.azure.com/` format
- Both should work, but use the exact one from Azure Portal

## Alternative: Use Free Playground Models

If you can't deploy models due to quota restrictions, some models support "free playground" usage:
- Check the model catalog for models with `free_playground: true`
- These can be used for testing without deployment

## Summary

**Remaining Tasks:**
1. ✅ Resource created
2. ⏳ Deploy model via Azure Portal
3. ⏳ Get API key from "Keys and Endpoint"
4. ⏳ Update `appsettings.Development.json`
5. ⏳ Test AI features

**Estimated Time:** 5-10 minutes (after model deployment completes)

