# 🌉 Samadhan Setu

**AI-Powered Grievance Redressal Platform**

*Bridging Citizens and Government through AI*

![Status](https://img.shields.io/badge/Status-Hackathon%20Ready-green)
![Stack](https://img.shields.io/badge/Stack-FastAPI%20%2B%20Next.js-blue)

## 🎯 Overview

Samadhan Setu is an intelligent grievance redressal platform that uses AI to automatically classify citizen complaints, prioritize them based on urgency, and route them to the appropriate government departments for swift resolution.

### Key Features

- **AI-Powered Classification**: Automatically detects complaint category using NLP
- **Smart Prioritization**: Urgency detection based on keywords and context
- **Real-time Tracking**: Citizens can track their complaint status
- **Department Dashboard**: Officers can manage and resolve assigned complaints
- **Community Upvoting**: Public complaints can be upvoted to boost priority
- **Admin Analytics**: Comprehensive statistics and department management

## 🏗️ Architecture

```
├── backend/                 # FastAPI Python Backend
│   ├── app/
│   │   ├── ai/             # AI/NLP Classification Module
│   │   ├── models/         # SQLAlchemy Database Models
│   │   ├── routers/        # API Route Handlers
│   │   ├── schemas/        # Pydantic Schemas
│   │   └── main.py         # FastAPI Application
│   └── seed_data.py        # Demo Data Seeder
│
├── frontend/               # Next.js React Frontend
│   └── src/
│       ├── app/           # App Router Pages
│       ├── components/    # Shared Components
│       └── lib/           # API Client & Auth
```

## 🚀 Quick Start

### Prerequisites

- Python 3.9+
- Node.js 18+
- npm
- PostgreSQL 14+ (running locally or use a hosted service)

### 1. Setup PostgreSQL Database

```bash
# Create database (using psql)
psql -U postgres
CREATE DATABASE samadhan_setu;
\q
```

Or set the DATABASE_URL environment variable:
```bash
set DATABASE_URL=postgresql://user:password@localhost:5432/samadhan_setu
```

### 2. Clone & Setup Backend

```bash
cd backend

# Create virtual environment (recommended)
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac

# Install dependencies
pip install -r requirements.txt

# Seed demo data
python seed_data.py

# Start backend server
uvicorn app.main:app --reload
```

Backend will run at: `http://localhost:8000`

API Docs: `http://localhost:8000/docs`

### 3. Setup Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will run at: `http://localhost:3000`

## 🔑 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| 👤 Citizen | citizen@demo.com | demo123 |
| 👮 Officer (Roads) | officer@roads.gov.in | demo123 |
| 👮 Officer (Water) | officer@water.gov.in | demo123 |
| 🔧 Admin | admin@samadhan.gov.in | demo123 |

## 📱 User Flows

### Citizen Flow
1. Login/Register as citizen
2. Lodge a grievance with description and location
3. AI automatically detects category and priority
4. Track complaint status in "My Status"
5. View and upvote community complaints

### Department Officer Flow
1. Login as department officer
2. View complaints sorted by priority
3. Update status (Pending → In Progress → Resolved)
4. Add remarks for transparency

### Admin Flow
1. Login as admin
2. View comprehensive statistics dashboard
3. Monitor category breakdown and priority distribution
4. Manage departments and SLA rules

## 🧠 AI Classification

The AI module uses rule-based keyword classification optimized for hackathon demo:

**Categories:**
- Roads & Transport
- Water Supply
- Electricity
- Sanitation & Waste
- Health & Safety

**Priority Scoring:**
```
Priority = Urgency Keywords + Category Severity + Community Upvotes
```

> Architecture is designed for easy upgrade to DistilBERT/BERT models in production.

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14, Tailwind CSS, Lucide Icons |
| Backend | FastAPI, SQLAlchemy, Pydantic |
| Database | SQLite (production-ready for PostgreSQL) |
| Auth | JWT with bcrypt hashing |
| AI/NLP | Rule-based classifier (ML-ready architecture) |

## 🔮 Future Roadmap

- [ ] Mobile app (React Native)
- [ ] Voice complaint submission
- [ ] DistilBERT classification model
- [ ] Government API integrations
- [ ] Multi-city support
- [ ] WhatsApp/SMS notifications

## 📄 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login with credentials
- `GET /api/auth/me` - Get current user profile

### Citizens
- `POST /api/complaints` - Submit new complaint
- `GET /api/complaints/my` - Get user's complaints
- `GET /api/complaints/public` - Community feed
- `POST /api/complaints/{id}/upvote` - Upvote complaint

### Department
- `GET /api/department/complaints` - Get assigned complaints
- `PUT /api/department/complaints/{id}/status` - Update status

### Admin
- `GET /api/admin/stats` - Dashboard statistics
- `GET /api/admin/departments` - List departments
- `POST /api/admin/mappings` - Create category mapping

## 👥 Team

**Team Strawhats** - ByteQuest 2025

---

*Built with ❤️ for Digital India*
