from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from functools import wraps
from app import db
from app.models import User, Tower, Unit, Amenity, Booking, Lease, Payment, unit_amenities
from app.routes.auth import get_identity
from datetime import datetime

admin_bp = Blueprint('admin', __name__)

def admin_required(fn):
    @wraps(fn)
    @jwt_required()
    def wrapper(*args, **kwargs):
        identity = get_identity()
        if identity.get('role') != 'admin':
            return jsonify({'error': 'Admin access required'}), 403
        return fn(*args, **kwargs)
    return wrapper

@admin_bp.route('/stats', methods=['GET'])
@admin_required
def get_stats():
    total_units     = Unit.query.count()
    available_units = Unit.query.filter_by(status='available').count()
    occupied_units  = Unit.query.filter_by(status='occupied').count()
    pending_bookings= Booking.query.filter_by(status='pending').count()
    total_tenants   = User.query.filter_by(role='user').count()
    total_towers    = Tower.query.count()
    active_leases   = Lease.query.filter_by(status='active').count()
    total_payments  = db.session.query(db.func.sum(Payment.amount)).filter_by(status='paid').scalar() or 0
    return jsonify({
        'total_units': total_units, 'available_units': available_units,
        'occupied_units': occupied_units,
        'occupancy_rate': round((occupied_units / total_units * 100) if total_units else 0, 1),
        'pending_bookings': pending_bookings, 'total_tenants': total_tenants,
        'total_towers': total_towers, 'active_leases': active_leases,
        'total_revenue': float(total_payments)
    }), 200

# Towers
@admin_bp.route('/towers', methods=['GET'])
@admin_required
def get_towers():
    return jsonify({'towers': [t.to_dict() for t in Tower.query.all()]}), 200

@admin_bp.route('/towers', methods=['POST'])
@admin_required
def create_tower():
    data = request.get_json()
    tower = Tower(name=data['name'], address=data['address'], floors=data['floors'])
    db.session.add(tower); db.session.commit()
    return jsonify({'tower': tower.to_dict()}), 201

@admin_bp.route('/towers/<int:tid>', methods=['PUT'])
@admin_required
def update_tower(tid):
    tower = Tower.query.get_or_404(tid); data = request.get_json()
    for f in ['name','address','floors']:
        if f in data: setattr(tower, f, data[f])
    db.session.commit()
    return jsonify({'tower': tower.to_dict()}), 200

@admin_bp.route('/towers/<int:tid>', methods=['DELETE'])
@admin_required
def delete_tower(tid):
    tower = Tower.query.get_or_404(tid)
    db.session.delete(tower); db.session.commit()
    return jsonify({'message': 'Tower deleted'}), 200

# Units
@admin_bp.route('/units', methods=['GET'])
@admin_required
def get_units():
    return jsonify({'units': [u.to_dict() for u in Unit.query.all()]}), 200

@admin_bp.route('/units', methods=['POST'])
@admin_required
def create_unit():
    data = request.get_json()
    unit = Unit(tower_id=data['tower_id'], unit_number=data['unit_number'],
                floor=data['floor'], bedrooms=data['bedrooms'], bathrooms=data['bathrooms'],
                area_sqft=data['area_sqft'], rent_monthly=data['rent_monthly'],
                status=data.get('status','available'), description=data.get('description'))
    db.session.add(unit); db.session.commit()
    return jsonify({'unit': unit.to_dict()}), 201

@admin_bp.route('/units/<int:uid>', methods=['PUT'])
@admin_required
def update_unit(uid):
    unit = Unit.query.get_or_404(uid); data = request.get_json()
    for f in ['unit_number','floor','bedrooms','bathrooms','area_sqft','rent_monthly','status','description','tower_id']:
        if f in data: setattr(unit, f, data[f])
    db.session.commit()
    return jsonify({'unit': unit.to_dict()}), 200

@admin_bp.route('/units/<int:uid>', methods=['DELETE'])
@admin_required
def delete_unit(uid):
    unit = Unit.query.get_or_404(uid)
    db.session.delete(unit); db.session.commit()
    return jsonify({'message': 'Unit deleted'}), 200

# Amenities
@admin_bp.route('/amenities', methods=['GET'])
@admin_required
def get_amenities():
    return jsonify({'amenities': [a.to_dict() for a in Amenity.query.all()]}), 200

@admin_bp.route('/amenities', methods=['POST'])
@admin_required
def create_amenity():
    data = request.get_json()
    a = Amenity(name=data['name'], description=data.get('description'), icon=data.get('icon'))
    db.session.add(a); db.session.commit()
    return jsonify({'amenity': a.to_dict()}), 201

@admin_bp.route('/amenities/<int:aid>', methods=['PUT'])
@admin_required
def update_amenity(aid):
    a = Amenity.query.get_or_404(aid); data = request.get_json()
    for f in ['name','description','icon','is_active']:
        if f in data: setattr(a, f, data[f])
    db.session.commit()
    return jsonify({'amenity': a.to_dict()}), 200

# Bookings
@admin_bp.route('/bookings', methods=['GET'])
@admin_required
def get_bookings():
    status = request.args.get('status')
    q = Booking.query
    if status: q = q.filter_by(status=status)
    return jsonify({'bookings': [b.to_dict() for b in q.order_by(Booking.created_at.desc()).all()]}), 200

@admin_bp.route('/bookings/<int:bid>/approve', methods=['PUT'])
@admin_required
def approve_booking(bid):
    booking = Booking.query.get_or_404(bid)
    data = request.get_json() or {}
    booking.status = 'approved'
    booking.admin_note = data.get('admin_note')
    db.session.commit()
    return jsonify({'booking': booking.to_dict()}), 200

@admin_bp.route('/bookings/<int:bid>/decline', methods=['PUT'])
@admin_required
def decline_booking(bid):
    booking = Booking.query.get_or_404(bid)
    data = request.get_json() or {}
    booking.status = 'declined'
    booking.admin_note = data.get('admin_note')
    db.session.commit()
    return jsonify({'booking': booking.to_dict()}), 200

# Tenants
@admin_bp.route('/tenants', methods=['GET'])
@admin_required
def get_tenants():
    users = User.query.filter_by(role='user').all()
    return jsonify({'tenants': [u.to_dict() for u in users]}), 200

# Leases
@admin_bp.route('/leases', methods=['GET'])
@admin_required
def get_leases():
    return jsonify({'leases': [l.to_dict() for l in Lease.query.all()]}), 200

@admin_bp.route('/leases', methods=['POST'])
@admin_required
def create_lease():
    data = request.get_json()
    lease = Lease(
        user_id=data['user_id'], unit_id=data['unit_id'],
        start_date=datetime.strptime(data['start_date'], '%Y-%m-%d').date(),
        end_date=datetime.strptime(data['end_date'], '%Y-%m-%d').date(),
        monthly_rent=data['monthly_rent'], deposit=data.get('deposit')
    )
    db.session.add(lease)
    unit = Unit.query.get(data['unit_id'])
    if unit: unit.status = 'occupied'
    db.session.commit()
    return jsonify({'lease': lease.to_dict()}), 201

# Payments
@admin_bp.route('/payments', methods=['GET'])
@admin_required
def get_payments():
    return jsonify({'payments': [p.to_dict() for p in Payment.query.order_by(Payment.payment_date.desc()).all()]}), 200
