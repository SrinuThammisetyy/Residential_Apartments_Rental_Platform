from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app.models import Unit, Tower

units_bp = Blueprint('units', __name__)

@units_bp.route('/', methods=['GET'])
def get_units():
    status = request.args.get('status')
    tower_id = request.args.get('tower_id')
    bedrooms = request.args.get('bedrooms')
    min_rent = request.args.get('min_rent')
    max_rent = request.args.get('max_rent')

    query = Unit.query
    if status:
        query = query.filter_by(status=status)
    if tower_id:
        query = query.filter_by(tower_id=tower_id)
    if bedrooms:
        query = query.filter_by(bedrooms=int(bedrooms))
    if min_rent:
        query = query.filter(Unit.rent_monthly >= float(min_rent))
    if max_rent:
        query = query.filter(Unit.rent_monthly <= float(max_rent))

    units = query.all()
    return jsonify({'units': [u.to_dict() for u in units]}), 200

@units_bp.route('/<int:unit_id>', methods=['GET'])
def get_unit(unit_id):
    unit = Unit.query.get_or_404(unit_id)
    return jsonify({'unit': unit.to_dict()}), 200

@units_bp.route('/towers', methods=['GET'])
def get_towers():
    towers = Tower.query.all()
    return jsonify({'towers': [t.to_dict() for t in towers]}), 200
