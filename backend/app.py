import os
from flask import Flask
from flask_cors import CORS
from models import db
from dotenv import load_dotenv

load_dotenv()

def create_app():
    app = Flask(__name__)
    CORS(app)
    
    db_user = os.getenv('DB_USER', 'root')
    db_password = os.getenv('DB_PASSWORD', '')
    db_host = os.getenv('DB_HOST', 'localhost')
    db_name = os.getenv('DB_NAME', 'lms_db')
    
    # Configure SQLAlchemy
    app.config['SQLALCHEMY_DATABASE_URI'] = f'mysql+pymysql://{db_user}:{db_password}@{db_host}/{db_name}'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
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
