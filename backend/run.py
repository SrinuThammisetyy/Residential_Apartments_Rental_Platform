from app import create_app, db
from app.models import User, Tower, Unit, Amenity, unit_amenities
import bcrypt

app = create_app()

def seed_data():
    """Seed database with demo data if empty"""
    with app.app_context():
        db.create_all()

        # Only seed if no users exist
        if User.query.first():
            print("Database already seeded, skipping...")
            return

        print("Seeding database with demo data...")

        # Hash password correctly using bcrypt
        pw_hash = bcrypt.hashpw(b'password123', bcrypt.gensalt()).decode('utf-8')

        # Create users
        admin = User(email='admin@apartment.com', password_hash=pw_hash,
                     full_name='Admin User', role='admin')
        user = User(email='user@apartment.com', password_hash=pw_hash,
                    full_name='John Resident', role='user')
        db.session.add_all([admin, user])
        db.session.flush()

        # Create towers
        t1 = Tower(name='Tower A - Sunrise', address='123 Garden View, Downtown', floors=12)
        t2 = Tower(name='Tower B - Skyline', address='456 Lake Avenue, Midtown', floors=15)
        t3 = Tower(name='Tower C - Horizon', address='789 Park Road, Uptown', floors=10)
        db.session.add_all([t1, t2, t3])
        db.session.flush()

        # Create amenities
        amenities_data = [
            ('Swimming Pool', 'Olympic size heated pool', 'pool'),
            ('Gym', 'State-of-the-art fitness center', 'fitness_center'),
            ('Parking', 'Covered basement parking', 'local_parking'),
            ('WiFi', 'High-speed fiber internet', 'wifi'),
            ('Security', '24/7 CCTV surveillance', 'security'),
            ('Laundry', 'In-unit washer/dryer connections', 'local_laundry_service'),
            ('Balcony', 'Private balcony with view', 'deck'),
            ('Pet Friendly', 'Pets allowed with deposit', 'pets'),
        ]
        amenities = []
        for name, desc, icon in amenities_data:
            a = Amenity(name=name, description=desc, icon=icon)
            db.session.add(a)
            amenities.append(a)
        db.session.flush()

        # Create units
        units_data = [
            (t1, 'A101', 1, 1, 1, 650.00, 1200.00, 'available', 'Cozy 1-bed unit with garden view', [0,1,2,3,4]),
            (t1, 'A201', 2, 2, 2, 950.00, 1800.00, 'available', 'Spacious 2-bed with modern kitchen', [0,1,2,3,4,5,6]),
            (t1, 'A301', 3, 3, 2, 1250.00, 2400.00, 'occupied', 'Premium 3-bed corner unit', [0,1,2,3,4,5,6,7]),
            (t1, 'A401', 4, 1, 1, 680.00, 1300.00, 'available', 'Bright unit with city views', [1,2,3,4]),
            (t2, 'B101', 1, 2, 1, 850.00, 1600.00, 'available', 'Modern 2-bed near pool', [0,1,2,3,4]),
            (t2, 'B201', 2, 3, 2, 1150.00, 2200.00, 'available', 'Luxury 3-bed with panoramic views', [0,1,2,3,4,5,6]),
            (t2, 'B501', 5, 1, 1, 700.00, 1400.00, 'occupied', 'High-floor 1-bed studio', [1,3,4]),
            (t3, 'C101', 1, 2, 2, 1000.00, 1900.00, 'available', 'Garden-facing 2-bed family unit', [0,1,2,3,4,7]),
            (t3, 'C201', 2, 1, 1, 600.00, 1100.00, 'available', 'Affordable starter unit', [2,3,4]),
            (t3, 'C301', 3, 4, 3, 1800.00, 3200.00, 'available', 'Penthouse-style 4-bed luxury unit', [0,1,2,3,4,5,6]),
        ]

        for tower, unit_num, floor, beds, baths, area, rent, status, desc, amenity_indices in units_data:
            u = Unit(
                tower=tower,
                unit_number=unit_num,
                floor=floor,
                bedrooms=beds,
                bathrooms=baths,
                area_sqft=area,
                rent_monthly=rent,
                status=status,
                description=desc
            )
            for idx in amenity_indices:
                u.amenities.append(amenities[idx])
            db.session.add(u)

        db.session.commit()
        print("✅ Database seeded successfully!")
        print("   Admin: admin@apartment.com / password123")
        print("   User:  user@apartment.com / password123")


if __name__ == '__main__':
    seed_data()
    app.run(host='0.0.0.0', port=5000, debug=True)
