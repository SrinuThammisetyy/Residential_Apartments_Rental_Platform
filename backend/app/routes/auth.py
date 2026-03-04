from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from app import db
from app.models import User
import bcrypt, json

auth_bp = Blueprint('auth', __name__)

def make_token(user):
    # Store identity as JSON string - works with all Flask-JWT-Extended versions
    identity = json.dumps({'id': user.id, 'role': user.role})
    return create_access_token(identity=identity)

def get_identity():
    raw = get_jwt_identity()
    if isinstance(raw, dict):
        return raw  # old token format
    return json.loads(raw)  # new string format

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    if not data or not data.get('email') or not data.get('password') or not data.get('full_name'):
        return jsonify({'error': 'Email, password, and full name are required'}), 400

    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already registered'}), 409

    pw_hash = bcrypt.hashpw(data['password'].encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    user = User(
        email=data['email'], password_hash=pw_hash,
        full_name=data['full_name'], phone=data.get('phone'), role='user'
    )
    db.session.add(user)
    db.session.commit()
    return jsonify({'token': make_token(user), 'user': user.to_dict()}), 201


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Email and password are required'}), 400

    user = User.query.filter_by(email=data['email']).first()
    if not user:
        return jsonify({'error': 'Invalid credentials'}), 401

    try:
        match = bcrypt.checkpw(data['password'].encode('utf-8'), user.password_hash.encode('utf-8'))
    except Exception as e:
        print(f"[Auth] bcrypt error: {e}")
        return jsonify({'error': 'Invalid credentials'}), 401

    if not match:
        return jsonify({'error': 'Invalid credentials'}), 401

    return jsonify({'token': make_token(user), 'user': user.to_dict()}), 200


@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def me():
    identity = get_identity()
    user = User.query.get(identity['id'])
    if not user:
        return jsonify({'error': 'User not found'}), 404
    return jsonify({'user': user.to_dict()}), 200


@auth_bp.route('/me', methods=['PUT'])
@jwt_required()
def update_me():
    identity = get_identity()
    user = User.query.get(identity['id'])
    data = request.get_json()
    if data.get('full_name'): user.full_name = data['full_name']
    if data.get('phone'):     user.phone = data['phone']
    if data.get('password'):
        user.password_hash = bcrypt.hashpw(data['password'].encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    db.session.commit()
    return jsonify({'user': user.to_dict()}), 200
