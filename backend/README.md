# UCU Reporta - Backend API

**Backend for the UCU Reporta civic reporting platform**

A FastAPI-based backend for managing civic incident reports in municipalities across Yucatán.

## 🏗️ Technology Stack

- **Python 3.10+**
- **FastAPI** - Modern web framework
- **SQLAlchemy** - ORM for database operations
- **SQLite** - Database (easily portable to PostgreSQL)
- **Pydantic** - Data validation
- **JWT** - Authentication (to be implemented in PROMPT 2)

## 📁 Project Structure

```
backend/
├── main.py                 # FastAPI application entry point
├── database.py            # Database configuration
├── models/                # SQLAlchemy ORM models
│   ├── user.py           # User model
│   └── report.py         # Report model
├── schemas/              # Pydantic validation schemas
│   ├── user.py          # User schemas
│   └── report.py        # Report schemas
├── routes/              # API endpoint routers
│   ├── users.py        # Auth endpoints (/auth)
│   ├── reports.py      # Report endpoints (/reports)
│   └── admin.py        # Admin endpoints (/admin)
├── auth/               # Authentication utilities
│   └── jwt_handler.py # JWT token handling
├── utils/             # Helper functions
│   ├── curp_validator.py # CURP format validation
│   └── priority_engine.py # Priority calculation
└── static/
    └── uploads/      # Photo uploads storage
```

## 🚀 Getting Started

### 1. Create a Virtual Environment

```bash
# Navigate to project root
cd "c:/Users/raulc/Downloads/SamurAI Reportes"

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Run the API

```bash
# From project root
uvicorn backend.main:app --reload

# The API will be available at:
# - http://localhost:8000
# - API Docs: http://localhost:8000/docs
# - ReDoc: http://localhost:8000/redoc
```

## 📊 Database

The application uses SQLite for development. The database file will be automatically created at:
```
database/ucudigital.db
```

### Models

#### User Model
- `id`: Primary key
- `name`: Full name
- `email`: Unique email (for login)
- `curp`: Unique CURP identifier
- `hashed_password`: Bcrypt-hashed password
- `role`: "citizen" or "admin"
- `created_at`, `updated_at`: Timestamps

#### Report Model
- `id`: Primary key
- `user_id`: Foreign key to User
- `category`: bache, alumbrado, basura, drenaje, vialidad
- `description`: Incident description
- `latitude`, `longitude`: GPS coordinates
- `photo_url`: Optional photo evidence
- `priority`: 1-5 (auto-calculated)
- `status`: pendiente, en_proceso, resuelto
- `created_at`, `updated_at`: Timestamps

## 🔌 API Endpoints

All endpoints are now fully implemented! 🎉

### Authentication (`/auth`)

#### Register New User
```bash
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Juan Pérez",
    "email": "juan@example.com",
    "curp": "PERJ850315HYNXNN09",
    "password": "password123"
  }'
```

#### Login
```bash
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "juan@example.com",
    "password": "password123"
  }'
```

Response includes `access_token` - save this for authenticated requests!

#### Get Current User Profile
```bash
curl -X GET http://localhost:8000/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Reports (`/reports`)

#### Create Report
```bash
curl -X POST http://localhost:8000/reports \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "category": "bache",
    "description": "Bache grande en la calle principal con riesgo de accidente",
    "latitude": 21.1619,
    "longitude": -86.8515
  }'
```

#### List Reports
```bash
# Citizen sees their own reports
curl -X GET http://localhost:8000/reports \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Filter by status
curl -X GET "http://localhost:8000/reports?status=pendiente" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Filter by category and priority
curl -X GET "http://localhost:8000/reports?category=bache&min_priority=3" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

#### Get Single Report
```bash
curl -X GET http://localhost:8000/reports/1 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

#### Upload Photo
```bash
curl -X POST http://localhost:8000/reports/1/upload-photo \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -F "photo=@/path/to/image.jpg"
```

#### Delete Report
```bash
curl -X DELETE http://localhost:8000/reports/1 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Admin (`/admin`)

**Note:** All admin endpoints require a user with `role="admin"`

#### Get Dashboard Summary
```bash
curl -X GET http://localhost:8000/admin/reports/summary \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE"
```

Returns:
- Total reports
- Resolved/pending/in-progress counts
- Average resolution time
- Count by category
- Count by status

#### Update Report Status
```bash
curl -X PATCH http://localhost:8000/admin/reports/1/status \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "en_proceso",
    "comment": "Equipo asignado, resolución en 24 horas"
  }'
```

## 🧪 Testing the API

Once running, visit `http://localhost:8000/docs` for interactive API documentation.

### Example: Check API Health

```bash
curl http://localhost:8000/health
```

Expected response:
```json
{
  "status": "healthy",
  "service": "UCU Reporta API"
}
```

## 🔧 Utilities

### CURP Validator
Validates Mexican CURP format using regex:
```python
from backend.utils import validate_curp

is_valid = validate_curp("ABCD123456HMNABC01")  # Returns True/False
```

### Priority Engine
Calculates report priority (1-5) based on category:
```python
from backend.utils import calculate_priority

priority = calculate_priority("drenaje", "Description here")  # Returns 4
```

## ✅ Implementation Status

**PROMPT 2 COMPLETE!** All features implemented:
- ✅ JWT authentication with Bearer tokens
- ✅ User registration and login with CURP validation
- ✅ Report CRUD operations with role-based access
- ✅ Photo upload functionality
- ✅ Admin dashboard endpoints with metrics
- ✅ Enhanced priority calculation with keyword detection
- ✅ Static file serving for uploaded images

**Ready for PROMPT 3:** Frontend implementation with React + Vite + Tailwind

## 🤝 Development Notes

- Database tables are created automatically on startup
- CORS is configured for `localhost:3000` (frontend)
- All models use SQLAlchemy ORM
- All endpoints use Pydantic for validation
- Code includes comprehensive docstrings

## 📄 License

Part of the UCU Reporta hackathon project for Yucatán municipalities.
