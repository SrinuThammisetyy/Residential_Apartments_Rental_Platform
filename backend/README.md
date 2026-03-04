# Apartment Portal — Backend (Flask)

## Prerequisites
- Python 3.10+
- PostgreSQL running locally

## Setup & Run

### 1. Create PostgreSQL database
```sql
CREATE USER apartment_user WITH PASSWORD 'apartment_pass';
CREATE DATABASE apartment_db OWNER apartment_user;
```

### 2. Install dependencies
```bash
pip install -r requirements.txt
```

### 3. Configure environment
Edit `.env` file — update DATABASE_URL if needed.

### 4. Run
```bash
python run.py
```

Backend runs at: http://localhost:5000

On first run it auto-creates all tables and seeds demo data:
- Admin: admin@apartment.com / password123
- User:  user@apartment.com  / password123

## API Endpoints
- POST   /api/auth/login
- POST   /api/auth/register
- GET    /api/units/
- GET    /api/units/:id
- GET    /api/units/towers
- GET    /api/amenities/
- POST   /api/bookings/         (JWT required)
- GET    /api/bookings/my       (JWT required)
- PUT    /api/bookings/:id/cancel (JWT required)
- GET    /api/admin/stats       (Admin JWT)
- CRUD   /api/admin/towers      (Admin JWT)
- CRUD   /api/admin/units       (Admin JWT)
- GET    /api/admin/bookings    (Admin JWT)
- PUT    /api/admin/bookings/:id/approve  (Admin JWT)
- PUT    /api/admin/bookings/:id/decline  (Admin JWT)
- GET    /api/admin/tenants     (Admin JWT)
- GET    /api/admin/leases      (Admin JWT)
- POST   /api/admin/leases      (Admin JWT)
- GET    /api/admin/payments    (Admin JWT)
