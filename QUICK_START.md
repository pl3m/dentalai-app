# Quick Start for New Agent Sessions

## What to Say

"Read STATUS.md and continue with the current focus area"

Or be more specific:
- "Read STATUS.md and help me complete Azure AI Foundry setup"
- "Read STATUS.md and implement the Scheduling UI"
- "Read STATUS.md and help with [specific task]"

## Project Overview (30-second read)

**DentalAI Assistant** - Cloud-native dental practice management app

- **Backend:** .NET 9 Web API with minimal APIs
- **Frontend:** Angular 20 (zoneless) with signals
- **Current Status:** AI endpoints implemented, Azure AI Foundry resource created, model deployment in progress
- **Location:** `/backend/DentalAI.API/` and `/frontend/`

## Key Files to Know

- `STATUS.md` - Complete project status and next steps
- `AZURE_AI_FOUNDRY_SETUP.md` - Azure AI Foundry setup guide
- `.cursor/instructions.md` - Technology versions and patterns

## Current Focus

1. **Complete Azure AI Foundry Setup** (in progress)
   - Deploy GPT-4 model
   - Configure credentials
   - Test AI features

2. **Next Features:**
   - Scheduling UI with calendar
   - Auth & Security (JWT)

## Tech Stack

- Angular 20 (zoneless, signals, OnPush)
- .NET 9 (minimal APIs)
- EF Core 9
- Azure AI Foundry (OpenAI)
- SQLite (local) / Azure SQL (production)

## Quick Commands

```bash
# Backend: cd backend/DentalAI.API && dotnet run
# Frontend: cd frontend && ng serve
# Backend runs on: http://localhost:5212
# Frontend runs on: http://localhost:4200
```

