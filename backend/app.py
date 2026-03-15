import os
import ssl
from flask import Flask
from flask_cors import CORS
from models import db
from dotenv import load_dotenv

load_dotenv()

def create_app():
    app = Flask(__name__)
    
    # Enable CORS for local development and the Vercel frontend
    CORS(app, resources={
        r"/api/*": {
            "origins": [
                "http://localhost:8000",
                "http://127.0.0.1:8000",
                "https://lms-mmv57lj5k-rachanagowdarachana4-7842s-projects.vercel.app"
            ]
        }
    })
    
    db_user = os.getenv('DB_USER', 'root')
    db_password = os.getenv('DB_PASSWORD', '')
    db_host = os.getenv('DB_HOST', 'localhost')
    db_port = os.getenv('DB_PORT', '3306')
    db_name = os.getenv('DB_NAME', 'lms_db')
    
    # Configure SQLAlchemy
    app.config['SQLALCHEMY_DATABASE_URI'] = f'mysql+pymysql://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    # Configure SSL Context to bypass self-signed certificate errors from Aiven
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE

    app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
        'connect_args': {
            'ssl': ctx
        }
    }
    
    db.init_app(app)
    
    with app.app_context():
        # Create all tables if they don't exist
        db.create_all()
        
    from routes.auth_routes import auth_bp
    from routes.course_routes import course_bp
    from routes.lesson_routes import lesson_bp
    from routes.enrollment_routes import enrollment_bp
    from routes.progress_routes import progress_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(course_bp, url_prefix='/api/courses')
    app.register_blueprint(lesson_bp, url_prefix='/api/lessons')
    app.register_blueprint(enrollment_bp, url_prefix='/api/enrollments')
    app.register_blueprint(progress_bp, url_prefix='/api/progress')
        
    @app.route('/health')
    def health_check():
        return {'status': 'healthy', 'message': 'LMS Backend is running!'}
        
    return app
app = create_app()

if __name__ == '__main__':
    app.run(debug=True, port=5000)
