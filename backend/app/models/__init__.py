from app import db
from datetime import datetime

class User(db.Model):
    __tablename__ = 'users'
    id            = db.Column(db.Integer, primary_key=True)
    email         = db.Column(db.String(255), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    full_name     = db.Column(db.String(255), nullable=False)
    phone         = db.Column(db.String(20))
    role          = db.Column(db.String(20), default='user')
    created_at    = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return dict(id=self.id, email=self.email, full_name=self.full_name,
                    phone=self.phone, role=self.role,
                    created_at=self.created_at.isoformat() if self.created_at else None)


unit_amenities = db.Table('unit_amenities',
    db.Column('unit_id',    db.Integer, db.ForeignKey('units.id'),     primary_key=True),
    db.Column('amenity_id', db.Integer, db.ForeignKey('amenities.id'), primary_key=True)
)


class Tower(db.Model):
    __tablename__ = 'towers'
    id         = db.Column(db.Integer, primary_key=True)
    name       = db.Column(db.String(100), nullable=False)
    address    = db.Column(db.Text, nullable=False)
    floors     = db.Column(db.Integer, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    units      = db.relationship('Unit', backref='tower', lazy=True, cascade='all, delete-orphan')

    def to_dict(self):
        return dict(id=self.id, name=self.name, address=self.address,
                    floors=self.floors, unit_count=len(self.units))


class Amenity(db.Model):
    __tablename__ = 'amenities'
    id          = db.Column(db.Integer, primary_key=True)
    name        = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    icon        = db.Column(db.String(50))
    is_active   = db.Column(db.Boolean, default=True)

    def to_dict(self):
        return dict(id=self.id, name=self.name, description=self.description,
                    icon=self.icon, is_active=self.is_active)


class Unit(db.Model):
    __tablename__ = 'units'
    id            = db.Column(db.Integer, primary_key=True)
    tower_id      = db.Column(db.Integer, db.ForeignKey('towers.id'))
    unit_number   = db.Column(db.String(20), nullable=False)
    floor         = db.Column(db.Integer, nullable=False)
    bedrooms      = db.Column(db.Integer, nullable=False)
    bathrooms     = db.Column(db.Integer, nullable=False)
    area_sqft     = db.Column(db.Numeric(10,2), nullable=False)
    rent_monthly  = db.Column(db.Numeric(10,2), nullable=False)
    status        = db.Column(db.String(20), default='available')
    description   = db.Column(db.Text)
    image_url     = db.Column(db.Text)
    created_at    = db.Column(db.DateTime, default=datetime.utcnow)
    amenities     = db.relationship('Amenity', secondary=unit_amenities, lazy='subquery',
                                    backref=db.backref('units', lazy=True))

    def to_dict(self):
        return dict(
            id=self.id, tower_id=self.tower_id,
            tower_name=self.tower.name if self.tower else None,
            unit_number=self.unit_number, floor=self.floor,
            bedrooms=self.bedrooms, bathrooms=self.bathrooms,
            area_sqft=float(self.area_sqft), rent_monthly=float(self.rent_monthly),
            status=self.status, description=self.description,
            image_url=self.image_url,
            amenities=[a.to_dict() for a in self.amenities]
        )


def _parse_visit_date(date_str):
    """Accept YYYY-MM-DD or DD-MM-YYYY or MM/DD/YYYY from browser date pickers"""
    if not date_str:
        return None
    for fmt in ('%Y-%m-%d', '%d-%m-%Y', '%m/%d/%Y', '%d/%m/%Y'):
        try:
            from datetime import datetime as dt
            return dt.strptime(date_str, fmt).date()
        except ValueError:
            continue
    return None


class Booking(db.Model):
    __tablename__ = 'bookings'
    id         = db.Column(db.Integer, primary_key=True)
    user_id    = db.Column(db.Integer, db.ForeignKey('users.id'))
    unit_id    = db.Column(db.Integer, db.ForeignKey('units.id'))
    status     = db.Column(db.String(20), default='pending')
    visit_date = db.Column(db.Date)
    message    = db.Column(db.Text)
    admin_note = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    user       = db.relationship('User', backref='bookings')
    unit       = db.relationship('Unit', backref='bookings')

    def to_dict(self):
        return dict(
            id=self.id, user_id=self.user_id,
            user_name=self.user.full_name if self.user else None,
            user_email=self.user.email if self.user else None,
            unit_id=self.unit_id,
            unit_number=self.unit.unit_number if self.unit else None,
            tower_name=self.unit.tower.name if self.unit and self.unit.tower else None,
            status=self.status,
            visit_date=self.visit_date.isoformat() if self.visit_date else None,
            message=self.message, admin_note=self.admin_note,
            created_at=self.created_at.isoformat() if self.created_at else None,
            updated_at=self.updated_at.isoformat() if self.updated_at else None
        )


class Lease(db.Model):
    __tablename__ = 'leases'
    id           = db.Column(db.Integer, primary_key=True)
    user_id      = db.Column(db.Integer, db.ForeignKey('users.id'))
    unit_id      = db.Column(db.Integer, db.ForeignKey('units.id'))
    start_date   = db.Column(db.Date, nullable=False)
    end_date     = db.Column(db.Date, nullable=False)
    monthly_rent = db.Column(db.Numeric(10,2), nullable=False)
    deposit      = db.Column(db.Numeric(10,2))
    status       = db.Column(db.String(20), default='active')
    created_at   = db.Column(db.DateTime, default=datetime.utcnow)
    user         = db.relationship('User', backref='leases')
    unit         = db.relationship('Unit', backref='leases')

    def to_dict(self):
        return dict(
            id=self.id, user_id=self.user_id,
            user_name=self.user.full_name if self.user else None,
            unit_id=self.unit_id,
            unit_number=self.unit.unit_number if self.unit else None,
            tower_name=self.unit.tower.name if self.unit and self.unit.tower else None,
            start_date=self.start_date.isoformat(), end_date=self.end_date.isoformat(),
            monthly_rent=float(self.monthly_rent),
            deposit=float(self.deposit) if self.deposit else None,
            status=self.status
        )


class Payment(db.Model):
    __tablename__ = 'payments'
    id              = db.Column(db.Integer, primary_key=True)
    lease_id        = db.Column(db.Integer, db.ForeignKey('leases.id'))
    user_id         = db.Column(db.Integer, db.ForeignKey('users.id'))
    amount          = db.Column(db.Numeric(10,2), nullable=False)
    payment_date    = db.Column(db.Date, nullable=False)
    status          = db.Column(db.String(20), default='paid')
    payment_method  = db.Column(db.String(50))
    transaction_ref = db.Column(db.String(100))
    created_at      = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return dict(
            id=self.id, lease_id=self.lease_id, user_id=self.user_id,
            amount=float(self.amount), payment_date=self.payment_date.isoformat(),
            status=self.status, payment_method=self.payment_method,
            transaction_ref=self.transaction_ref
        )
