# DentalAI Assistant - Portfolio Showcase

> **A Full-Stack Healthcare Management System with AI-Powered Clinical Documentation**

[![.NET](https://img.shields.io/badge/.NET-9.0-512BD4?logo=dotnet)](https://dotnet.microsoft.com/)
[![Angular](https://img.shields.io/badge/Angular-20.0-DD0031?logo=angular)](https://angular.io/)
[![Azure](https://img.shields.io/badge/Azure-Cloud-0078D4?logo=microsoft-azure)](https://azure.microsoft.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript)](https://www.typescriptlang.org/)

## 🎯 Project Overview

**DentalAI Assistant** is a modern, cloud-native healthcare practice management application that streamlines patient care workflows through intelligent automation. Built with cutting-edge technologies and deployed on Azure, it demonstrates enterprise-level software engineering practices.

### Key Highlights

- 🤖 **AI-Powered Clinical Documentation**: Converts unstructured notes into SOAP format and generates professional referral letters
- ☁️ **Azure Cloud-Native**: Full infrastructure as code with Bicep, scalable App Services, and secure Key Vault integration
- ⚡ **Modern Tech Stack**: .NET 9 minimal APIs, Angular 20 (zoneless), Entity Framework Core 9
- 🔒 **Healthcare-Grade Security**: Secure token-based referrals, CORS protection, and Azure-managed identities
- 📱 **Responsive UI**: Material Design components with reactive forms and signal-based state management

---

## 🚀 Live Demo

### Option 1: Local Setup

```bash
# Backend
cd backend/DentalAI.API
dotnet run

# Frontend (new terminal)
cd frontend
npm install
ng serve
```

### Option 2: Azure Deployment

Follow the [AZURE_DEPLOYMENT_GUIDE.md](./AZURE_DEPLOYMENT_GUIDE.md) for cloud deployment.

**Access Points:**

- Frontend: `https://[static-web-app-url]`
- API: `https://[web-app-url]/swagger`
- Swagger UI: Interactive API documentation

---

## 🏗️ Architecture

### System Architecture

```
┌─────────────────┐
│   Angular 20    │  ← Zoneless Change Detection
│   Frontend      │     Signal-based State
│                 │     Material Design
└────────┬────────┘
         │ REST API
         │
┌────────▼────────┐
│   .NET 9 API    │  ← Minimal APIs
│   Minimal APIs  │     EF Core 9
│                 │     Serilog Logging
└────────┬────────┘
         │
    ┌────┴────┬──────────────┬──────────────┐
    │         │              │              │
┌───▼───┐ ┌──▼──────┐  ┌────▼──────┐  ┌───▼────┐
│SQLite │ │Azure AI │  │  Key      │  │ Azure  │
│(Dev)  │ │Foundry  │  │  Vault    │  │  SQL   │
│       │ │         │  │           │  │(Prod)  │
└───────┘ └─────────┘  └───────────┘  └────────┘
```

### Technology Stack

#### Backend

- **.NET 9.0** - Latest framework with minimal APIs
- **Entity Framework Core 9** - ORM with SQLite (dev) / SQL Server (prod)
- **Azure.AI.OpenAI 2.1.0** - GPT-4 integration for clinical AI
- **Serilog** - Structured logging
- **Swagger/OpenAPI** - API documentation

#### Frontend

- **Angular 20** - Latest version with zoneless change detection
- **Angular Material** - UI component library
- **RxJS 7.8** - Reactive programming
- **TypeScript 5.8** - Type-safe development

#### Infrastructure

- **Azure App Service** - Backend hosting (Linux)
- **Azure Static Web Apps** - Frontend hosting
- **Azure SQL Database** - Production database
- **Azure AI Foundry** - GPT-4 model hosting
- **Azure Key Vault** - Secrets management
- **Bicep** - Infrastructure as Code

---

## ✨ Key Features

### 1. Patient Management

- ✅ Full CRUD operations for patient records
- ✅ Search and filtering capabilities
- ✅ Patient detail views with all associated data
- ✅ Responsive data tables with Material Design

### 2. Clinical Notes & AI Integration

- ✅ Create, edit, and manage clinical notes
- ✅ **AI-Powered SOAP Summarization**: Converts unstructured clinical notes into standardized SOAP format (Subjective, Objective, Assessment, Plan)
- ✅ **AI-Generated Referral Letters**: Automatically generates professional referral letters to other healthcare providers
- ✅ Error handling with user-friendly fallbacks

### 3. Referral Management

- ✅ Secure token-based referral system
- ✅ Time-limited access tokens (6-month expiry)
- ✅ Read-only portal for external referrers
- ✅ Automatic token generation

### 4. Appointment Scheduling

- ✅ Create and manage appointments
- ✅ **Conflict Detection**: Prevents double-booking
- ✅ Appointment status tracking (Scheduled, Completed, Cancelled)
- ✅ Patient-appointment associations

### 5. Cloud Infrastructure

- ✅ Infrastructure as Code (Bicep templates)
- ✅ Azure-managed identities for secure access
- ✅ Key Vault integration for secrets
- ✅ Environment-based configuration
- ✅ CORS configuration for cross-origin requests

---

## 💻 Code Quality Highlights

### Backend Best Practices

- ✅ **Minimal APIs**: Modern .NET approach without MVC overhead
- ✅ **Dependency Injection**: Service-based architecture
- ✅ **Structured Logging**: Serilog with proper log levels
- ✅ **Error Handling**: Comprehensive try-catch blocks with meaningful error messages
- ✅ **Async/Await**: Non-blocking I/O operations
- ✅ **Entity Framework**: Efficient queries with `AsNoTracking()` for read operations
- ✅ **DTOs**: Clean separation with request/response models

### Frontend Best Practices

- ✅ **Zoneless Architecture**: Angular 20's latest performance feature
- ✅ **Signal-Based State**: Reactive state management
- ✅ **OnPush Change Detection**: Optimized rendering
- ✅ **Reactive Forms**: Type-safe form handling
- ✅ **Service Layer**: Clean separation of concerns
- ✅ **TypeScript**: Full type safety

### Infrastructure Best Practices

- ✅ **IaC**: Infrastructure defined in Bicep templates
- ✅ **Security**: Managed identities, Key Vault, HTTPS-only
- ✅ **Scalability**: Serverless SQL, scalable App Services
- ✅ **Monitoring**: Structured logging ready for Application Insights

---

## 📊 Technical Metrics

### Performance

- **Backend**: Minimal API overhead, async operations
- **Frontend**: Zoneless change detection, OnPush strategy
- **Database**: Optimized queries with EF Core

### Security

- ✅ HTTPS-only communication
- ✅ CORS configuration
- ✅ Azure-managed identities
- ✅ Key Vault for secrets
- ✅ Token-based access control

### Scalability

- ✅ Serverless SQL Database (auto-pause capability)
- ✅ Scalable App Service plans
- ✅ Static Web App CDN integration

---

## 🎬 Demo Scenarios

### Scenario 1: Complete Patient Workflow

1. **Create a new patient** with demographic information
2. **Add a clinical note** describing patient symptoms
3. **Generate SOAP summary** using AI (showcasing AI integration)
4. **Create a referral** to another provider
5. **Generate referral letter** using AI from the SOAP summary
6. **Schedule an appointment** with conflict checking

### Scenario 2: AI Capabilities Showcase

1. Input raw clinical notes: _"Patient reports severe tooth pain, unable to sleep. Examination shows deep caries in tooth #30, percussion positive. X-ray shows periapical radiolucency."_
2. Generate SOAP summary - watch AI structure the information
3. Generate referral letter - demonstrate professional letter generation

### Scenario 3: Technical Architecture

1. Show Swagger UI (`/swagger`) - API documentation
2. Demonstrate REST endpoints with different HTTP methods
3. Show database relationships (Patient → Notes → Referrals → Appointments)
4. Display Azure infrastructure resources

---

## 📸 Screenshots Guide

**Recommended Screenshots for Portfolio:**

1. **Patient List View**

   - Shows the main dashboard with patient table
   - Highlight Material Design components

2. **Patient Detail with AI Features**

   - Show note creation interface
   - Highlight "Generate SOAP Summary" and "Generate Referrer Letter" buttons
   - Show before/after AI transformation

3. **Swagger API Documentation**

   - Demonstrate comprehensive API documentation
   - Show endpoint examples

4. **Azure Portal Resources**

   - Screenshot of deployed resources
   - Key Vault configuration
   - App Service logs

5. **Code Examples**
   - AIService.cs - AI integration implementation
   - Program.cs - Minimal API setup
   - Bicep template - Infrastructure as Code

---

## 🔧 Setup Instructions

### Prerequisites

- .NET 9 SDK
- Node.js 22+
- Azure CLI (for deployment)
- Azure subscription (for cloud features)

### Local Development

```bash
# Clone repository
git clone <repository-url>
cd dentalapp

# Backend setup
cd backend/DentalAI.API
dotnet restore
dotnet run
# API available at https://localhost:5001

# Frontend setup (new terminal)
cd frontend
npm install
ng serve
# App available at http://localhost:4200
```

### Azure Deployment

```bash
# Install Azure Developer CLI
azd init
azd provision
azd deploy
```

See [AZURE_DEPLOYMENT_GUIDE.md](./AZURE_DEPLOYMENT_GUIDE.md) for detailed instructions.

---

## 📚 Additional Documentation

- [STATUS.md](./STATUS.md) - Project status and completion tracking
- [AZURE_DEPLOYMENT_GUIDE.md](./AZURE_DEPLOYMENT_GUIDE.md) - Cloud deployment guide
- [AZURE_AI_FOUNDRY_SETUP.md](./AZURE_AI_FOUNDRY_SETUP.md) - AI service configuration
- [QUICK_START.md](./QUICK_START.md) - Quick start guide

---

## 🎯 Learning Outcomes

This project demonstrates expertise in:

1. **Full-Stack Development**: End-to-end application development
2. **Cloud Architecture**: Azure cloud services and infrastructure
3. **AI Integration**: OpenAI/LLM integration in production applications
4. **Modern Frameworks**: Latest versions of .NET and Angular
5. **DevOps**: Infrastructure as Code, CI/CD readiness
6. **Healthcare Domain**: Understanding of clinical workflows and SOAP documentation
7. **Security Best Practices**: Authentication, secrets management, secure APIs
8. **API Design**: RESTful APIs with OpenAPI documentation

---

## 🌟 Standout Features for Portfolio

### Why This Project Stands Out

1. **Real-World Application**: Solves actual healthcare workflow problems
2. **Cutting-Edge Tech**: Uses latest framework versions (.NET 9, Angular 20)
3. **AI Integration**: Demonstrates modern AI/LLM usage in practical scenarios
4. **Cloud-Native**: Full Azure deployment with IaC
5. **Production-Ready**: Error handling, logging, security considerations
6. **Clean Architecture**: Separation of concerns, service layer pattern
7. **Comprehensive Documentation**: Well-documented code and deployment guides

---

## 📝 For Your Portfolio

### Project Title

**DentalAI Assistant - Healthcare Practice Management System**

### Short Description (1-2 sentences)

_A full-stack healthcare application built with .NET 9 and Angular 20, featuring AI-powered clinical documentation that converts notes to SOAP format and generates referral letters. Deployed on Azure with Infrastructure as Code._

### Technologies Used

- Backend: .NET 9, Entity Framework Core 9, Azure OpenAI SDK
- Frontend: Angular 20, TypeScript, Angular Material
- Cloud: Azure App Service, Azure SQL, Azure AI Foundry, Azure Key Vault
- Infrastructure: Bicep, Azure CLI

### Key Achievements

- ✅ Implemented AI-powered clinical note summarization using Azure OpenAI
- ✅ Built responsive frontend with Angular 20's zoneless architecture
- ✅ Deployed scalable cloud infrastructure using Infrastructure as Code
- ✅ Designed secure token-based referral system
- ✅ Created comprehensive REST API with Swagger documentation

---

## 🚀 Future Enhancements (Roadmap)

- [ ] JWT authentication and role-based access control
- [ ] Appointment calendar UI component
- [ ] Real-time notifications
- [ ] Advanced search and filtering
- [ ] Patient portal for self-service
- [ ] Analytics dashboard
- [ ] CI/CD pipeline with GitHub Actions
- [ ] Unit and integration tests

---

## 📧 Contact & Links

- **Repository**: [GitHub URL]
- **Live Demo**: [Azure Static Web App URL]
- **API Documentation**: [Swagger UI URL]

---

_Last Updated: November 2025_
