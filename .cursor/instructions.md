# Project Instructions - DentalAI Assistant

## Technology Versions (LATEST STABLE)

- **Angular 20** (zoneless enabled) - using standalone components, signals, OnPush change detection
- **.NET 9** Web API with minimal APIs
- **Entity Framework Core 9** - latest patterns
- **Azure SDK latest stable** - App Service, SQL, Key Vault, App Insights, OpenAI
- **TypeScript 5.6+**
- **Node.js 22.x**

## Architecture Patterns

### Angular (Zoneless)

- Use **standalone components** exclusively (no NgModules)
- Use **signals** for state management (signal(), computed(), effect())
- **OnPush change detection** for all components
- Use `inject()` function for dependency injection (not constructor injection)
- Use `AsyncPipe` in templates for observables
- Use `markForCheck()` only when absolutely necessary
- NO NgZone usage (removed entirely)

### .NET 9

- **Minimal APIs** where appropriate
- **Entity Framework Core 9** with SQLite (local) and SQL Server (Azure)
- **Strong typing** - no `any` in TypeScript, no `dynamic` in C#
- **Dependency Injection** - register services in `Program.cs`
- **Serilog** for structured logging
- **Swagger** for API documentation

### AI Integration

- **Azure OpenAI Service** (primary) - use latest SDK
- Provider-agnostic interface (can swap providers if needed)
- Always log: model name, token usage, latency
- Cache deterministic results
- Never log full PHI in prompts (mask when needed)

## Database Strategy

- **Local Development**: SQLite (Data Source=dentalai.db)
- **Azure Production**: Azure SQL Database (Server=tcp:...)
- **EF Core Migrations**: Same migrations work for both (configure in Program.cs based on environment)

## Security Requirements

- **Azure Key Vault** for all secrets (connection strings, API keys)
- **JWT authentication** with role-based access (staff/admin)
- **Audit logging** for all PHI reads/writes (who, when, what)
- **TLS 1.3** in production
- **Input validation** - validate all user inputs server-side
- **No secrets in code or repo** - use User Secrets locally, Key Vault in Azure

## Azure Services

- **Azure Static Web Apps** - Angular frontend (FREE tier)
- **Azure App Service** - .NET API (F1 FREE tier for portfolio)
- **Azure SQL Database** - FREE tier (32GB)
- **Azure Key Vault** - secrets management
- **Application Insights** - monitoring and logging
- **Azure OpenAI Service** - AI features

## Development Workflow

- **Context7 MCP** - use for latest Angular/.NET/Azure patterns
- **Azure MCP** - use for resource management
- **GitHub Actions** - CI/CD for both frontend and backend
- **Local development** - run everything locally first
- **Test locally** before pushing to Azure

## Code Quality

- **ESLint + Prettier** for Angular
- **StyleCop** or similar for C# (optional but recommended)
- **No console.log** in production code - use proper logging
- **Meaningful commit messages** - conventional commits preferred
- **Pull requests** for all changes (even solo project)

## Requirements

- Always use **latest stable versions** - check npm/packages before adding dependencies
- Use **Context7** to verify latest patterns when implementing features
- Use **modern patterns only** - no deprecated Angular/.NET syntax
- **Document AI tool usage** in DEVELOPMENT.md (how Cursor/ChatGPT was used)
- If uncertain about a version/pattern, fetch latest docs via Context7 or official docs
