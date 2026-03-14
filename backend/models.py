from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    user_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), nullable=False, default='Student') # Student, Instructor, Admin
    
    courses = db.relationship('Course', backref='instructor', lazy=True)
    enrollments = db.relationship('Enrollment', backref='student', lazy=True)
    progress = db.relationship('Progress', backref='student', lazy=True)

class Course(db.Model):
    __tablename__ = 'courses'
    course_id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=True)
    thumbnail = db.Column(db.String(255), nullable=True)
    category = db.Column(db.String(100), nullable=True)
    instructor_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)
    
    # Calculated fields or cached for convenience, normally we'd compute this
    total_lessons = db.Column(db.Integer, default=0)
    total_duration = db.Column(db.Integer, default=0) # in minutes
    
    sections = db.relationship('Section', backref='course', lazy=True)
    enrollments = db.relationship('Enrollment', backref='course', lazy=True)
    progress = db.relationship('Progress', backref='course', lazy=True)

class Section(db.Model):
    __tablename__ = 'sections'
    section_id = db.Column(db.Integer, primary_key=True)
    course_id = db.Column(db.Integer, db.ForeignKey('courses.course_id'), nullable=False)
    title = db.Column(db.String(255), nullable=False)
    order_number = db.Column(db.Integer, nullable=False)
    
    lessons = db.relationship('Lesson', backref='section', lazy=True)

class Lesson(db.Model):
    __tablename__ = 'lessons'
    lesson_id = db.Column(db.Integer, primary_key=True)
    section_id = db.Column(db.Integer, db.ForeignKey('sections.section_id'), nullable=False)
    title = db.Column(db.String(255), nullable=False)
    order_number = db.Column(db.Integer, nullable=False)
    youtube_url = db.Column(db.String(255), nullable=False)
    duration = db.Column(db.Integer, default=0) # in minutes
    
    progress = db.relationship('Progress', backref='lesson', lazy=True)

class Enrollment(db.Model):
    __tablename__ = 'enrollments'
    enrollment_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)
    course_id = db.Column(db.Integer, db.ForeignKey('courses.course_id'), nullable=False)
    enrollment_date = db.Column(db.DateTime, default=datetime.utcnow)

class Progress(db.Model):
    __tablename__ = 'progress'
    progress_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)
    course_id = db.Column(db.Integer, db.ForeignKey('courses.course_id'), nullable=False)
    lesson_id = db.Column(db.Integer, db.ForeignKey('lessons.lesson_id'), nullable=False)
    status = db.Column(db.String(20), default='completed') # completed
    last_watched = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
