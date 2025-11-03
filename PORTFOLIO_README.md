# DentalAI Assistant

> **Full-Stack Healthcare Practice Management System with AI Integration**

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![.NET](https://img.shields.io/badge/.NET-9.0-512BD4)](https://dotnet.microsoft.com/)
[![Angular](https://img.shields.io/badge/Angular-20.0-DD0031)](https://angular.io/)

## Overview

DentalAI Assistant is a modern healthcare practice management system that streamlines patient care through intelligent automation. Built with cutting-edge technologies and deployed on Azure, it demonstrates enterprise-level software engineering with a focus on healthcare workflows.

## ✨ Features

- 🏥 **Patient Management**: Complete CRUD operations for patient records
- 📝 **Clinical Notes**: Create and manage patient clinical documentation
- 🤖 **AI-Powered Summarization**: Automatically converts notes to SOAP format using Azure OpenAI
- 📄 **Referral Letters**: AI-generated professional referral letters
- 📅 **Appointment Scheduling**: Conflict detection and status tracking
- 🔐 **Secure Referrals**: Token-based access system for external providers
- ☁️ **Cloud-Native**: Fully deployed on Azure with Infrastructure as Code

## 🛠️ Tech Stack

### Backend

- .NET 9.0 (Minimal APIs)
- Entity Framework Core 9
- Azure OpenAI SDK 2.1.0
- Serilog for structured logging
- SQLite (dev) / Azure SQL (prod)

### Frontend

- Angular 20 (Zoneless)
- Angular Material
- TypeScript 5.8
- RxJS 7.8

### Infrastructure

- Azure App Service
- Azure Static Web Apps
- Azure SQL Database
- Azure AI Foundry (GPT-4)
- Azure Key Vault
- Bicep (IaC)

## 🚀 Quick Start

### Prerequisites

- .NET 9 SDK
- Node.js 22+
- Azure CLI (optional, for deployment)

### Run Locally

```bash
# Backend
cd backend/DentalAI.API
dotnet run
# API: https://localhost:5001

# Frontend (new terminal)
cd frontend
npm install && ng serve
# App: http://localhost:4200
```

## 📖 Documentation

- [Portfolio Showcase](./PORTFOLIO_SHOWCASE.md) - Comprehensive portfolio documentation
- [Azure Deployment Guide](./AZURE_DEPLOYMENT_GUIDE.md) - Cloud deployment instructions
- [Status & Progress](./STATUS.md) - Current project status

## 🏗️ Architecture

```
Angular 20 Frontend → .NET 9 API → Entity Framework → SQLite/SQL Server
                              ↓
                      Azure AI Foundry (GPT-4)
                              ↓
                      Azure Key Vault (Secrets)
```

## 🎯 Key Highlights

- **Modern Stack**: Latest .NET 9 and Angular 20 with zoneless architecture
- **AI Integration**: Production-ready OpenAI integration for clinical documentation
- **Cloud-Native**: Full Azure deployment with Infrastructure as Code
- **Healthcare Domain**: Understanding of SOAP documentation and clinical workflows
- **Production-Ready**: Error handling, logging, security, and scalability considerations

## 📸 Screenshots

_Add screenshots of:_

- Patient management interface
- AI-powered SOAP summary generation
- Referral letter generation
- Swagger API documentation

## 🔐 Security

- HTTPS-only communication
- Azure-managed identities
- Key Vault for secrets management
- CORS configuration
- Token-based referral access

## 📈 Performance

- Minimal API overhead
- Zoneless Angular change detection
- Optimized EF Core queries
- Serverless SQL auto-pause

## 🤝 Contributing

This is a portfolio project. For questions or feedback, please open an issue.

## 📄 License

MIT License - See LICENSE file for details

---

**Built with ❤️ using .NET, Angular, and Azure**
