# 🌉 Samadhan Setu

**AI-Powered Grievance Redressal Platform**

*Bridging Citizens and Government through AI*

![Status](https://img.shields.io/badge/Status-Hackathon%20Ready-green)
![Stack](https://img.shields.io/badge/Stack-FastAPI%20%2B%20Next.js-blue)

## 🎯 Overview

Samadhan Setu is an intelligent grievance redressal platform that uses AI to automatically classify citizen complaints, prioritize them based on urgency, and route them to the appropriate government departments for swift resolution.

### Key Features

- **AI-Powered Classification**: Hybrid AI (DistilBERT + Rules) for accurate categorization
- **Similarity Detection**: Prevents duplicate complaints using SBERT Semantic Search
- **🆕 AI Auto-Assignment**: Load-balanced team assignment with SLA-aware reassignment
- **🆕 AI Heatmap Analytics**: Issue density visualization by category and locality
- **Smart Prioritization**: Urgency detection based on keywords and context
- **Real-time Tracking**: Citizens can track their complaint status
- **Department Dashboard**: Officers can manage and resolve assigned complaints
- **Community Upvoting**: Public complaints can be upvoted to boost priority
- **Admin Analytics**: Comprehensive statistics and department management

## 🏗️ Architecture

```
├── AI-services/            # AI Microservices
│   ├── classification/     # Hybrid DistilBERT Classifier
│   └── similarity/         # SBERT Similarity Detection
│
├── backend/                 # FastAPI Python Backend
│   ├── app/
│   │   ├── services/       # AI Services (Auto-Assignment, Heatmap, Clustering)
│   │   ├── models/         # SQLAlchemy Models (+ Teams, TaskAssignments)
│   │   ├── routers/        # API Routes (+ Assignments, Analytics)
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

## 🧠 AI Services Modules

We have implemented **two advanced AI services** to make the platform intelligent and efficient:

### 1. Hybrid Classification Service
*   **Goal**: Automatically tag complaints (e.g., "Wire sparking" → "Electricity").
*   **Tech**: **DistilBERT (Zero-Shot)** + **Rule-Based Fallback**.
*   **Logic**:
    1.  Uses `distilbert-base-uncased-mnli` to understand context.
    2.  If confidence < 60%, falls back to keyword rules (Safety Net).
    3.  Ensures **High Accuracy** vs **High Reliability**.

### 2. Similarity Detection Service
*   **Goal**: Detect duplicate complaints in real-time to save officer time.
*   **Tech**: **SBERT (`all-MiniLM-L6-v2`)** + **Cosine Similarity**.
*   **Logic**:
    1.  Converts complaint text into 384-dimensional vector embeddings.
    2.  Compares with existing database embeddings.
    3.  Flags matches with > 75% semantic similarity (e.g., "Water leaking" ≈ "Burst pipe").

### 3. AI Auto-Assignment Service 🆕
*   **Goal**: Automatically assign complaints to optimal team based on workload.
*   **Tech**: Load-Scoring Algorithm + SLA Awareness.
*   **Logic**:
    ```
    Load Score = (active_tasks / capacity) + priority_weight + deadline_pressure
    ```
    1.  Calculates load score for each available team.
    2.  Assigns to team with lowest score that covers the ward.
    3.  Auto-reassigns if SLA breach risk detected.

### 4. AI Heatmap Analytics Service 🆕
*   **Goal**: Visualize issue density for proactive governance.
*   **Tech**: Aggregation + Semantic Clustering.
*   **Features**:
    *   Category-wise heatmaps (which issues are most common)
    *   Locality-wise heatmaps (which areas have most issues)
    *   Recurring issue detection (identify systemic problems)
    *   Time-trend analysis

### 5. Priority Scoring
```
Priority = Urgency Keywords + Category Severity + Community Upvotes
```

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14, Tailwind CSS, Lucide Icons |
| Backend | FastAPI, SQLAlchemy, Pydantic |
| Database | PostgreSQL |
| Auth | JWT with bcrypt hashing |
| AI (Classification) | **DistilBERT** (Hugging Face Transformers) |
| AI (Similarity) | **SBERT** (Sentence Transformers) |

## 🔮 Future Roadmap

- [ ] Mobile app (React Native)
- [ ] Voice complaint submission
- [x] DistilBERT classification model (Implemented)
- [x] Semantic Similarity Detection (Implemented)
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

### Assignments 🆕
- `GET /api/assignments/teams` - List all teams
- `GET /api/assignments/team/{id}` - Get team's assignments
- `POST /api/assignments/{id}/override` - Manual override
- `POST /api/assignments/check-reassignments` - Trigger AI check

### Analytics 🆕
- `GET /api/analytics/heatmap/category` - Category heatmap
- `GET /api/analytics/heatmap/locality` - Locality heatmap
- `GET /api/analytics/clusters` - Similar complaint clusters
- `GET /api/analytics/recurring-issues` - Recurring patterns
- `GET /api/analytics/summary` - Dashboard summary

## 👥 Team

**Team Strawhats** - ByteQuest 2025

---

