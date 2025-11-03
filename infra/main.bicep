@description('Environment name for resource naming and tagging')
param environmentName string

@description('Azure location for all resources')
param location string = resourceGroup().location

@description('SQL Server administrator username')
param sqlAdminUsername string = 'dentaladmin'

@description('SQL Server administrator password')
@secure()
param sqlAdminPassword string

// Generate resource token for unique naming
var resourceToken = uniqueString(subscription().id, resourceGroup().id, location, environmentName)

// User-Assigned Managed Identity (required by AZD rules)
resource userAssignedIdentity 'Microsoft.ManagedIdentity/userAssignedIdentities@2023-01-31' = {
  name: 'azid${resourceToken}'
  location: location
  tags: {
    'azd-env-name': environmentName
  }
}

// SQL Server
resource sqlServer 'Microsoft.Sql/servers@2023-05-01-preview' = {
  name: 'azsql${resourceToken}'
  location: location
  tags: {
    'azd-env-name': environmentName
  }
  properties: {
    administratorLogin: sqlAdminUsername
    administratorLoginPassword: sqlAdminPassword
    version: '12.0'
    minimalTlsVersion: '1.2'
    publicNetworkAccess: 'Enabled'
  }
}

// SQL Database (Serverless FREE tier)
resource sqlDatabase 'Microsoft.Sql/servers/databases@2023-05-01-preview' = {
  parent: sqlServer
  name: 'azdb${resourceToken}'
  location: location
  tags: {
    'azd-env-name': environmentName
  }
  sku: {
    name: 'GP_S_Gen5'
    tier: 'GeneralPurpose'
    family: 'Gen5'
    capacity: 1
  }
  properties: {
    requestedBackupStorageRedundancy: 'Local'
    catalogCollation: 'SQL_Latin1_General_CP1_CI_AS'
    collation: 'SQL_Latin1_General_CP1_CI_AS'
    maxSizeBytes: 34359738368 // 32GB (free tier limit)
    requestedServiceObjectiveName: 'GP_S_Gen5_1'
    zoneRedundant: false
  }
}

// SQL Server Firewall Rule - Allow Azure Services
resource sqlFirewallRuleAzure 'Microsoft.Sql/servers/firewallRules@2023-05-01-preview' = {
  parent: sqlServer
  name: 'AllowAzureServices'
  properties: {
    startIpAddress: '0.0.0.0'
    endIpAddress: '0.0.0.0'
  }
}

// Key Vault
resource keyVault 'Microsoft.KeyVault/vaults@2023-07-01' = {
  name: 'azkv${resourceToken}'
  location: location
  tags: {
    'azd-env-name': environmentName
  }
  properties: {
    sku: {
      family: 'A'
      name: 'standard'
    }
    tenantId: subscription().tenantId
    enabledForDeployment: true
    enabledForTemplateDeployment: true
    enabledForDiskEncryption: false
    enableRbacAuthorization: false
    accessPolicies: [
      {
        objectId: userAssignedIdentity.properties.principalId
        tenantId: subscription().tenantId
        permissions: {
          keys: []
          secrets: ['get', 'list', 'set']
          certificates: []
        }
      }
    ]
    networkAcls: {
      defaultAction: 'Allow'
      bypass: 'AzureServices'
    }
  }
}

// SQL Connection String Secret
resource sqlConnectionStringSecret 'Microsoft.KeyVault/vaults/secrets@2023-07-01' = {
  parent: keyVault
  name: 'SqlConnectionString'
  properties: {
    value: 'Server=tcp:${sqlServer.properties.fullyQualifiedDomainName},1433;Initial Catalog=${sqlDatabase.name};Persist Security Info=False;User ID=${sqlAdminUsername};Password=${sqlAdminPassword};MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;'
  }
}

// AI Foundry Endpoint Secret
resource aiEndpointSecret 'Microsoft.KeyVault/vaults/secrets@2023-07-01' = {
  parent: keyVault
  name: 'AzureOpenAI-Endpoint'
  properties: {
    value: 'https://dentalai-foundry.services.ai.azure.com/'
  }
}

// AI Foundry API Key Secret (placeholder - you'll need to set this manually)
resource aiApiKeySecret 'Microsoft.KeyVault/vaults/secrets@2023-07-01' = {
  parent: keyVault
  name: 'AzureOpenAI-ApiKey'
  properties: {
    value: 'PLACEHOLDER_UPDATE_ME'
  }
}

// AI Deployment Name Secret
resource aiDeploymentSecret 'Microsoft.KeyVault/vaults/secrets@2023-07-01' = {
  parent: keyVault
  name: 'AzureOpenAI-DeploymentName'
  properties: {
    value: 'Phi-4-mini-instruct'
  }
}

// App Service Plan (Free F1 tier)
resource appServicePlan 'Microsoft.Web/serverfarms@2023-01-01' = {
  name: 'azplan${resourceToken}'
  location: location
  tags: {
    'azd-env-name': environmentName
  }
  sku: {
    name: 'F1'
    tier: 'Free'
    capacity: 1
  }
  kind: 'linux'
  properties: {
    reserved: true
  }
}

// App Service (Web App)
resource webApp 'Microsoft.Web/sites@2023-01-01' = {
  name: 'azapi${resourceToken}'
  location: location
  tags: {
    'azd-env-name': environmentName
    'azd-service-name': 'api'
  }
  identity: {
    type: 'UserAssigned'
    userAssignedIdentities: {
      '${userAssignedIdentity.id}': {}
    }
  }
  properties: {
    serverFarmId: appServicePlan.id
    siteConfig: {
      linuxFxVersion: 'DOTNETCORE|9.0'
      appSettings: [
        {
          name: 'AZURE_CLIENT_ID'
          value: userAssignedIdentity.properties.clientId
        }
        {
          name: 'ASPNETCORE_ENVIRONMENT'
          value: 'Production'
        }
        {
          name: 'AzureOpenAI__Endpoint'
          value: '@Microsoft.KeyVault(SecretUri=${keyVault.properties.vaultUri}secrets/AzureOpenAI-Endpoint/)'
        }
        {
          name: 'AzureOpenAI__ApiKey'
          value: '@Microsoft.KeyVault(SecretUri=${keyVault.properties.vaultUri}secrets/AzureOpenAI-ApiKey/)'
        }
        {
          name: 'AzureOpenAI__DeploymentName'
          value: '@Microsoft.KeyVault(SecretUri=${keyVault.properties.vaultUri}secrets/AzureOpenAI-DeploymentName/)'
        }
      ]
      connectionStrings: [
        {
          name: 'DefaultConnection'
          connectionString: '@Microsoft.KeyVault(SecretUri=${keyVault.properties.vaultUri}secrets/SqlConnectionString/)'
          type: 'Custom'
        }
      ]
      cors: {
        allowedOrigins: [
          'http://localhost:4200'
        ]
        supportCredentials: true
      }
      alwaysOn: false
    }
    httpsOnly: true
  }
}

// App Service Site Extension (required by AZD rules)
resource webAppSiteExtension 'Microsoft.Web/sites/siteextensions@2023-01-01' = {
  parent: webApp
  name: 'Microsoft.AspNetCore.Diagnostics'
}

// Static Web App (Free tier)
resource staticWebApp 'Microsoft.Web/staticSites@2023-01-01' = {
  name: 'azswa${resourceToken}'
  location: location
  tags: {
    'azd-env-name': environmentName
    'azd-service-name': 'frontend'
  }
  sku: {
    name: 'Free'
    tier: 'Free'
  }
  properties: {
    allowConfigFileUpdates: true
    stagingEnvironmentPolicy: 'Enabled'
    enterpriseGradeCdnStatus: 'Disabled'
  }
}

// Outputs (required by AZD)
output RESOURCE_GROUP_ID string = resourceGroup().id
output RESOURCE_GROUP_NAME string = resourceGroup().name

// Additional helpful outputs
output SQL_SERVER_NAME string = sqlServer.name
output SQL_DATABASE_NAME string = sqlDatabase.name
output KEY_VAULT_NAME string = keyVault.name
output WEB_APP_NAME string = webApp.name
output WEB_APP_URL string = 'https://${webApp.properties.defaultHostName}'
output STATIC_WEB_APP_URL string = 'https://${staticWebApp.properties.defaultHostname}'
