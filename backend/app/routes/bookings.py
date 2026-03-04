from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import Booking, Unit, _parse_visit_date
from app.routes.auth import get_identity

bookings_bp = Blueprint('bookings', __name__)

@bookings_bp.route('/', methods=['POST'])
@jwt_required()
def create_booking():
    try:
        identity = get_identity()
        data = request.get_json()

        if not data or not data.get('unit_id'):
            return jsonify({'error': 'unit_id is required'}), 400

        unit = Unit.query.get(data['unit_id'])
        if not unit:
            return jsonify({'error': 'Unit not found'}), 404
        if unit.status == 'occupied':
            return jsonify({'error': 'Unit is currently occupied'}), 400

        existing = Booking.query.filter_by(
            user_id=identity['id'], unit_id=data['unit_id'], status='pending'
        ).first()
        if existing:
            return jsonify({'error': 'You already have a pending booking for this unit'}), 409

        visit_date = _parse_visit_date(data.get('visit_date'))

        booking = Booking(
            user_id=identity['id'],
            unit_id=data['unit_id'],
            visit_date=visit_date,
            message=data.get('message') or None
        )
        db.session.add(booking)
        db.session.commit()
        db.session.refresh(booking)
        return jsonify({'booking': booking.to_dict(), 'message': 'Booking created successfully'}), 201

    except Exception as e:
        db.session.rollback()
        print(f"[Booking Error] {str(e)}")
        import traceback; traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@bookings_bp.route('/my', methods=['GET'])
@jwt_required()
def my_bookings():
    identity = get_identity()
    bookings = Booking.query.filter_by(user_id=identity['id']).order_by(Booking.created_at.desc()).all()
    return jsonify({'bookings': [b.to_dict() for b in bookings]}), 200


@bookings_bp.route('/<int:booking_id>/cancel', methods=['PUT'])
@jwt_required()
def cancel_booking(booking_id):
    identity = get_identity()
    booking = Booking.query.get_or_404(booking_id)
    if booking.user_id != identity['id']:
        return jsonify({'error': 'Unauthorized'}), 403
    if booking.status != 'pending':
        return jsonify({'error': 'Only pending bookings can be cancelled'}), 400
    booking.status = 'cancelled'
    db.session.commit()
    return jsonify({'booking': booking.to_dict()}), 200
