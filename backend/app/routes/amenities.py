from flask import Blueprint, jsonify
from app.models import Amenity

amenities_bp = Blueprint('amenities', __name__)

@amenities_bp.route('/', methods=['GET'])
def get_amenities():
    amenities = Amenity.query.filter_by(is_active=True).all()
    return jsonify({'amenities': [a.to_dict() for a in amenities]}), 200
