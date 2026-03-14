import os
import jwt
import datetime
from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from models import db, User

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    if not data or not data.get('email') or not data.get('password') or not data.get('name'):
        return jsonify({'message': 'Missing required fields'}), 400
        
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'message': 'User already exists'}), 400
        
    hashed_password = generate_password_hash(data['password'], method='pbkdf2:sha256')
    
    new_user = User(
        name=data['name'],
        email=data['email'],
        password=hashed_password,
        role=data.get('role', 'Student')
    )
    
    db.session.add(new_user)
    db.session.commit()
    
    return jsonify({'message': 'User created successfully', 'user_id': new_user.user_id}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'message': 'Could not verify', 'WWW-Authenticate': 'Basic realm="Login required!"'}), 401
        
    user = User.query.filter_by(email=data['email']).first()
    
    if not user:
        return jsonify({'message': 'User not found'}), 404
        
    if check_password_hash(user.password, data['password']):
        token = jwt.encode({
            'user_id': user.user_id,
            'role': user.role,
            'exp': datetime.datetime.utcnow() + datetime.timedelta(minutes=1440)
        }, os.getenv('JWT_SECRET', 'secret_key'), algorithm="HS256")
        
        return jsonify({
            'token': token,
            'user': {
                'id': user.user_id,
                'name': user.name,
                'email': user.email,
                'role': user.role
            }
        }), 200
        
    return jsonify({'message': 'Invalid credentials'}), 401
