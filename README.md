# UCU Reporta 🏛️

**Plataforma de Reportes Ciudadanos para Municipios de Yucatán**

UCU Reporta is a modern civic reporting platform that enables citizens to report and track municipal issues like potholes, lighting problems, garbage collection, drainage issues, and road conditions.

## 🌟 Overview

This project consists of:
- **Backend**: FastAPI + SQLAlchemy + SQLite
- **Frontend**: React + Vite + Tailwind CSS (to be implemented in PROMPT 3)

## 🚀 Quick Start

### Backend Setup

```bash
# Create and activate virtual environment
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Run the backend
uvicorn backend.main:app --reload
```

The API will be available at:
- **API**: http://localhost:8000
- **Docs**: http://localhost:8000/docs

### Frontend Setup ✅

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

The frontend will be available at:
- **App**: http://localhost:3000

## 📁 Project Structure

```
SamurAI Reportes/
├── backend/              # FastAPI backend
│   ├── main.py          # Application entry point
│   ├── database.py      # Database configuration
│   ├── models/          # SQLAlchemy models
│   ├── schemas/         # Pydantic schemas
│   ├── routes/          # API endpoints
│   ├── auth/            # Authentication
│   ├── utils/           # Utilities
│   └── static/          # Static files and uploads
├── frontend/            # React frontend (PROMPT 3)
├── requirements.txt     # Python dependencies
└── README.md           # This file
```

## 🎯 Features

### ✅ Completed

**PROMPT 1** - Backend Base Structure
- ✅ FastAPI backend with clean architecture
- ✅ SQLAlchemy models (User, Report)
- ✅ Pydantic validation schemas
- ✅ Database configuration with SQLite

**PROMPT 2** - Authentication & Endpoints ✅
- ✅ JWT-based authentication with Bearer tokens
- ✅ User registration and login
- ✅ CURP format validation
- ✅ Report CRUD operations with role-based access
- ✅ Photo upload functionality
- ✅ Admin dashboard API with metrics
- ✅ Enhanced priority engine with keyword detection

**PROMPT 3** - Frontend Base ✅
- ✅ React + Vite project configured
- ✅ Tailwind CSS with "guinda" institutional theme
- ✅ Responsive navigation with mobile hamburger menu
- ✅ React Router with all routes
- ✅ API service with Axios + interceptors
- ✅ Framer Motion animations
- ✅ All placeholder pages created

**PROMPT 4** - Frontend Authentication ✅
- ✅ AuthContext for state management
- ✅ Full login functionality with backend integration
- ✅ Registration with CURP validation (client + server)
- ✅ ProtectedRoute component for route guards
- ✅ Role-based access control (citizen/admin)
- ✅ Session persistence with localStorage
- ✅ Automatic redirects based on role

**PROMPT 5** - Citizen Reporting Features ✅
- ✅ MapPicker component with Leaflet (interactive map)
- ✅ Full report creation form with validation
- ✅ Photo upload with preview and size validation
- ✅ Dashboard with real data from backend
- ✅ Charts with Recharts (pie + bar charts)
- ✅ Filters by status and category
- ✅ Report details modal
- ✅ Responsive design (desktop table + mobile cards)

**PROMPT 6** - Admin Dashboard ✅
- ✅ Complete KPIs (total, resolved, pending, in-progress, avg time)
- ✅ Interactive map with colored markers by status
- ✅ Popups on markers with report info
- ✅ Charts (pie chart by status + bar chart by category)
- ✅ Full reports table with admin actions
- ✅ Status management modal
- ✅ Real-time data from backend API
- ✅ Responsive design with animations

**PROMPT 7** - Final Polish & Production Ready ✅
- ✅ Professional landing page with hero section
- ✅ Error boundary for crash recovery
- ✅ Complete deployment documentation
- ✅ Security best practices documented
- ✅ Production-ready configuration
- ✅ CI/CD guidelines
- ✅ Monitoring and backup strategies
- ✅ Docker deployment option

## 🎉 Project Status: COMPLETE & PRODUCTION READY

All 7 PROMPTs have been successfully implemented. The platform is fully functional and ready for:
- ✅ Live demos
- ✅ User testing
- ✅ Production deployment
- ✅ Municipal adoption

## 🛠️ Technology Stack

### Backend
- Python 3.10+
- FastAPI
- SQLAlchemy
- SQLite (PostgreSQL-ready)
- Pydantic
- JWT Authentication

### Frontend (Coming)
- React 18
- Vite
- Tailwind CSS
- React Router
- Leaflet (maps)
- Recharts (analytics)
- Framer Motion (animations)

## 📊 Data Models

### User
- Email and CURP-based authentication
- Roles: citizen or admin
- Password hashing with bcrypt

### Report
- Categories: bache, alumbrado, basura, drenaje, vialidad
- GPS coordinates
- Priority (1-5, auto-calculated)
- Status: pendiente, en_proceso, resuelto
- Optional photo evidence

## 🌐 API Documentation

Once the backend is running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 👥 Team

Built for municipalities in Yucatán as part of a civic tech hackathon.

## 📝 License

This project is part of the UCU Reporta hackathon initiative.

---

**Current Status**: ALL 7 PROMPTS COMPLETE ✅  
**Backend**: ✅ Production-ready with auth, CRUD, admin endpoints & priority engine  
**Frontend**: ✅ Landing page, auth, citizen & admin dashboards with maps & charts  
**Documentation**: ✅ Demo guide, deployment guide, and full API docs  
**Platform Status**: 🚀 **100% COMPLETE & PRODUCTION READY**

### Quick Start
1. **Backend**: `uvicorn backend.main:app --reload`
2. **Frontend**: `npm run dev`
3. **Visit**: http://localhost:3000

### Documentation
- 📘 [Demo Guide](DEMO.md) - Complete walkthrough
- 🚀 [Deployment Guide](DEPLOYMENT.md) - Production deployment
- 📚 [Backend README](backend/README.md) - API documentation
- 🎨 [Frontend README](frontend/README.md) - Frontend details
