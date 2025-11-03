# DentalAI Assistant

> Full-Stack Healthcare Practice Management System with AI Integration

[![.NET](https://img.shields.io/badge/.NET-9.0-512BD4?logo=dotnet)](https://dotnet.microsoft.com/)
[![Angular](https://img.shields.io/badge/Angular-20.0-DD0031?logo=angular)](https://angular.io/)
[![Azure](https://img.shields.io/badge/Azure-Cloud-0078D4?logo=microsoft-azure)](https://azure.microsoft.com/)

A modern healthcare application featuring AI-powered clinical documentation, patient management, and appointment scheduling. Built with .NET 9, Angular 20, and deployed on Azure.

## 🚀 Quick Start

```bash
# Backend
cd backend/DentalAI.API
dotnet run
# API: https://localhost:5001/swagger

# Frontend (new terminal)
cd frontend
npm install && ng serve
# App: http://localhost:4200
```

## ✨ Key Features

- 🤖 **AI-Powered SOAP Summarization** - Converts clinical notes to structured format
- 📄 **Automated Referral Letters** - AI-generated professional letters
- 🏥 **Patient Management** - Complete CRUD operations
- 📅 **Appointment Scheduling** - Conflict detection and tracking
- ☁️ **Cloud-Native** - Azure deployment with Infrastructure as Code

## 🛠️ Tech Stack

**Backend:** .NET 9, EF Core 9, Azure OpenAI SDK, Serilog  
**Frontend:** Angular 20 (Zoneless), TypeScript, Angular Material  
**Cloud:** Azure App Service, SQL Database, AI Foundry, Key Vault, Bicep

## 📚 Documentation

- **[Portfolio Showcase](./PORTFOLIO_SHOWCASE.md)** - Comprehensive project documentation
- **[Project Description](./PROJECT_DESCRIPTION.md)** - For resumes and profiles
- **[Demo Script](./DEMO_SCRIPT.md)** - Presentation guide
- **[Azure Deployment](./AZURE_DEPLOYMENT_GUIDE.md)** - Cloud setup instructions
- **[Status](./STATUS.md)** - Current project status

## 🏗️ Architecture

```
Angular 20 Frontend → .NET 9 Minimal API → Entity Framework → SQLite/SQL Server
                                           ↓
                                   Azure AI Foundry (GPT-4)
```

## 📖 Learn More

For detailed information about features, architecture, and showcase materials, see [PORTFOLIO_SHOWCASE.md](./PORTFOLIO_SHOWCASE.md).

---

**Built with .NET, Angular, and Azure** | [View Portfolio Docs](./PORTFOLIO_SHOWCASE.md)
