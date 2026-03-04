# 🏠 ApartmentHub — Residential Apartment Rental Portal (RARP)

A full-stack web application for managing apartment rentals, built with **Angular 20**, **Python Flask**, **PostgreSQL**, and **Docker**.

> **Mini Project** | Full Stack Development | Angular 20 + Flask + PostgreSQL + Docker

---

## 📁 Project Structure

```
Residential_Apartments_Rental_Platform/
├── frontend/                  # Angular 20 (Standalone Components + Signals)
│   ├── src/
│   │   ├── app/
│   │   │   ├── pages/
│   │   │   │   ├── auth/        # Login, Register
│   │   │   │   ├── user/        # Dashboard, Units, Unit Detail, Bookings
│   │   │   │   └── admin/       # Dashboard, Towers, Units, Bookings, Tenants, Leases, Payments
│   │   │   ├── services/        # AuthService, ApiService (Angular 20)
│   │   │   ├── guards/          # authGuard, adminGuard, guestGuard (functional)
│   │   │   ├── interceptors/    # authInterceptor (functional, auto JWT)
│   │   │   ├── models/          # TypeScript interfaces
│   │   │   └── components/      # Shared Navbar
│   │   └── environments/        # Dev & Production config
│   ├── Dockerfile               # Node 22 → nginx
│   ├── nginx.conf               # Serves Angular + proxies /api
│   ├── tailwind.config.js       # Tailwind CSS 3
│   └── package.json             # Angular 20.x
│
├── backend/                   # Python Flask REST API
│   ├── app/
│   │   ├── models/              # SQLAlchemy ORM models
│   │   ├── routes/              # auth, units, bookings, admin, amenities
│   │   └── __init__.py          # Flask app factory
│   ├── run.py                   # Entry point + DB seeder
│   ├── requirements.txt
│   └── Dockerfile               # Python 3.11 slim
│
├── docker-compose.yml           # Orchestrates all 3 containers
├── README.md
└── .gitignore
```

---

## 🚀 Quick Start — Docker (Recommended)

> **Prerequisites:** [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running

### 1. Clone the repository
```bash
git clone https://github.com/SrinuThammisetyy/Residential_Apartments_Rental_Platform.git
cd Residential_Apartments_Rental_Platform
```

### 2. Start all services with one command
```bash
docker-compose up --build
```

> ⏳ First build takes **3–5 minutes** (downloads Node 22, Python 3.11, PostgreSQL 16, installs packages)

### 3. Open in browser
| Service    | URL                       |
|------------|---------------------------|
| 🌐 App     | http://localhost:4200      |
| 🔌 API     | http://localhost:5000/api  |
| 🗄️ Database | localhost:5432             |

### 4. Stop
```bash
docker-compose down

# To also delete database (reset all data):
docker-compose down -v
```

---

## 🔑 Demo Credentials

| Role  | Email                   | Password    | Portal        |
|-------|-------------------------|-------------|---------------|
| 👤 User  | user@apartment.com   | password123 | /dashboard    |
| 🔐 Admin | admin@apartment.com  | password123 | /admin        |

> Both use the same `/login` page — auto-redirects based on role.

---

## 🛠️ Tech Stack

| Layer        | Technology                    | Version   |
|--------------|-------------------------------|-----------|
| **Frontend** | Angular                       | **20.x**  |
| **UI**       | Tailwind CSS                  | 3.x       |
| **Language** | TypeScript                    | 5.6.x     |
| **Runtime**  | Node.js                       | 22.x      |
| **Backend**  | Python Flask                  | 3.0.x     |
| **Auth**     | Flask-JWT-Extended            | 4.6.x     |
| **Database** | PostgreSQL                    | 16        |
| **ORM**      | Flask-SQLAlchemy              | 3.1.x     |
| **Server**   | Nginx                         | Alpine    |
| **Container**| Docker & Docker Compose       | Latest    |

---

## ✨ Angular 20 Features Used

| Feature                       | Where Used                         |
|-------------------------------|------------------------------------|
| **Standalone Components**     | Every component — no NgModule      |
| **Signals** (`signal()`)      | All reactive state management      |
| **@if / @for control flow**   | All templates (no *ngIf / *ngFor)  |
| **inject() function**         | All dependency injection           |
| **Functional Guards**         | authGuard, adminGuard, guestGuard  |
| **Functional Interceptor**    | Auto JWT Bearer token injection    |
| **loadComponent() routing**   | Lazy loading every page            |
| **provideZoneChangeDetection**| app.config.ts (Angular 20 style)   |
| **computed() signals**        | isLoggedIn, isAdmin in AuthService |

---

## 📋 Core Features

### 👤 User Portal (`/dashboard`)
- ✅ Register & Login with JWT authentication
- ✅ Browse apartments with photo gallery and filters (tower, BHK, status, rent range)
- ✅ View unit details — amenities, photo gallery with lightbox, nearby places
- ✅ Request viewing appointments (bookings)
- ✅ Track booking status in real-time (Pending → Approved / Declined)
- ✅ Cancel pending bookings

### 🔐 Admin Portal (`/admin`)
- ✅ Dashboard with KPI stats — occupancy rate, revenue, pending alerts
- ✅ **Manage Towers** — Create, edit, delete towers
- ✅ **Manage Units** — Full CRUD with amenity assignment
- ✅ **Approve / Decline Bookings** — with notes sent to tenants
- ✅ **Manage Tenants** — View all registered users
- ✅ **Manage Leases** — Assign tenants to units with dates and deposit
- ✅ **Mock Payments** — View simulated rent payment records

---

## 🗄️ Database Schema

```
users          → id, email, password_hash, full_name, phone, role
towers         → id, name, address, floors
units          → id, tower_id, unit_number, floor, bedrooms, bathrooms, area_sqft, rent_monthly, status, description
amenities      → id, name, description, icon
unit_amenities → unit_id, amenity_id  (many-to-many junction)
bookings       → id, user_id, unit_id, status, visit_date, message, admin_note, created_at
leases         → id, user_id, unit_id, start_date, end_date, monthly_rent, deposit, status
payments       → id, lease_id, user_id, amount, payment_date, status, payment_method
```

---

## 🔌 API Endpoints

### Auth
| Method | Endpoint            | Description         |
|--------|---------------------|---------------------|
| POST   | /api/auth/login     | Login               |
| POST   | /api/auth/register  | Register            |
| GET    | /api/auth/me        | Get current user    |

### Units (Public)
| Method | Endpoint            | Description         |
|--------|---------------------|---------------------|
| GET    | /api/units/         | List units (filter) |
| GET    | /api/units/:id      | Unit detail         |
| GET    | /api/units/towers   | List towers         |

### Bookings (JWT required)
| Method | Endpoint                  | Description         |
|--------|---------------------------|---------------------|
| POST   | /api/bookings/            | Create booking      |
| GET    | /api/bookings/my          | My bookings         |
| PUT    | /api/bookings/:id/cancel  | Cancel booking      |

### Admin (Admin JWT required)
| Method | Endpoint                         | Description          |
|--------|----------------------------------|----------------------|
| GET    | /api/admin/stats                 | Dashboard KPIs       |
| CRUD   | /api/admin/towers                | Manage towers        |
| CRUD   | /api/admin/units                 | Manage units         |
| GET    | /api/admin/bookings              | All bookings         |
| PUT    | /api/admin/bookings/:id/approve  | Approve booking      |
| PUT    | /api/admin/bookings/:id/decline  | Decline booking      |
| GET    | /api/admin/tenants               | All tenants          |
| CRUD   | /api/admin/leases                | Manage leases        |
| GET    | /api/admin/payments              | Payment records      |

---

## 🐳 Docker Architecture

```
Browser (localhost:4200)
        │
  ┌─────▼──────────────────────────────────┐
  │          docker-compose network         │
  │                                         │
  │  [nginx:80] ← serves Angular 20 build  │
  │      │                                  │
  │      └─ /api/* → proxy_pass            │
  │                                         │
  │  [Flask:5000] ← REST API               │
  │      │                                  │
  │      └─ SQLAlchemy ORM                 │
  │                                         │
  │  [PostgreSQL:5432] ← persistent data   │
  └─────────────────────────────────────────┘
```

---

## 💻 Local Development (Without Docker)

### Backend

> Requirements: Python 3.11+, PostgreSQL 16+

```bash
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate       # Windows
source venv/bin/activate    # Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Setup PostgreSQL database
# Run in psql or pgAdmin:
#   CREATE USER apartment_user WITH PASSWORD 'apartment_pass';
#   CREATE DATABASE rarp_apartment OWNER apartment_user;
#   GRANT ALL ON SCHEMA public TO apartment_user;

# Start Flask (auto-creates tables + seeds demo data)
python run.py
```

Runs at: **http://localhost:5000**

### Frontend

> Requirements: Node.js 22+

```bash
cd frontend

# Install Angular 20 dependencies
npm install --legacy-peer-deps

# Start dev server (proxies /api to localhost:5000)
npm start
```

Runs at: **http://localhost:4200**

---

## 📦 Seed Data (Auto-loaded on first run)

| Data       | Count | Details                                          |
|------------|-------|--------------------------------------------------|
| Users      | 2     | 1 admin + 1 resident                            |
| Towers     | 3     | Tower A (Sunrise), B (Skyline), C (Horizon)     |
| Units      | 10    | Mix of 1/2/3/4 BHK across all floors            |
| Amenities  | 8     | Pool, Gym, Parking, WiFi, Security, Laundry...  |

---

## 📝 Notes

- **Angular 20** uses standalone components, Signals, @if/@for syntax, and functional guards/interceptors — no NgModule anywhere in this project.
- **Mock Payments** — The payments module displays simulated rent data. Real payment gateway (Razorpay/Stripe) integration is a Phase 2 feature.
- **Photos** — Unit photos are loaded from Unsplash CDN — requires internet connection to display.
- **JWT Expiry** — Tokens expire after 24 hours. Login again if your session expires.
- **Cloud Deployment** — Not deployed to cloud (GCP/AWS require credit card). The project is fully Dockerized and runs locally with one command.

---

## 👨‍💻 Developer

**Srinu Thammisety**
Mini Project — Residential Apartment Rental Platform (RARP)
Full Stack Development — Angular 20 + Flask + PostgreSQL + Docker

---

*Built with Angular 20 · Flask · PostgreSQL · Docker · Tailwind CSS · JWT Auth*
