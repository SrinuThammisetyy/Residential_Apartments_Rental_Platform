from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from dotenv import load_dotenv
import os

# Load .env FIRST
load_dotenv()

db = SQLAlchemy()
jwt = JWTManager()

def create_app():
    app = Flask(__name__)

    # Your exact DB details
    # DB name   : rarp_apartment
    # DB user   : apartment_user
    # DB pass   : apartment_pass
    # Host      : localhost
    # Port      : 5432
    db_url = os.environ.get(
        'DATABASE_URL',
        'postgresql://apartment_user:apartment_pass@localhost:5432/rarp_apartment'
    )

    print(f"\n[DB] Connecting to: {db_url}\n")

    app.config['SQLALCHEMY_DATABASE_URI'] = db_url
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'mysecretkey123')
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = 86400  # 24 hours

    db.init_app(app)
    jwt.init_app(app)

    CORS(app, resources={
        r"/api/*": {
            "origins": "*",
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"]
        }
    })

    from app.routes.auth      import auth_bp
    from app.routes.units     import units_bp
    from app.routes.bookings  import bookings_bp
    from app.routes.admin     import admin_bp
    from app.routes.amenities import amenities_bp

    app.register_blueprint(auth_bp,      url_prefix='/api/auth')
    app.register_blueprint(units_bp,     url_prefix='/api/units')
    app.register_blueprint(bookings_bp,  url_prefix='/api/bookings')
    app.register_blueprint(admin_bp,     url_prefix='/api/admin')
    app.register_blueprint(amenities_bp, url_prefix='/api/amenities')

    return app
