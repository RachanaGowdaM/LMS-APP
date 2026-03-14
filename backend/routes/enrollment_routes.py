from flask import Blueprint, jsonify, request
from models import db, Enrollment, Course
from auth_middleware import token_required

enrollment_bp = Blueprint('enrollments', __name__)

@enrollment_bp.route('/', methods=['POST'])
@token_required
def enroll_course(current_user):
    data = request.get_json()
    course_id = data.get('course_id')
    
    if not course_id:
        return jsonify({'message': 'Course ID is required'}), 400
        
    course = Course.query.get_or_404(course_id)
    
    # Check if already enrolled
    existing_enrollment = Enrollment.query.filter_by(user_id=current_user.user_id, course_id=course_id).first()
    if existing_enrollment:
        return jsonify({'message': 'Already enrolled in this course'}), 400
        
    new_enrollment = Enrollment(user_id=current_user.user_id, course_id=course_id)
    db.session.add(new_enrollment)
    db.session.commit()
    
    return jsonify({'message': 'Successfully enrolled in course', 'enrollment_id': new_enrollment.enrollment_id}), 201

@enrollment_bp.route('/my-courses', methods=['GET'])
@token_required
def get_my_courses(current_user):
    enrollments = Enrollment.query.filter_by(user_id=current_user.user_id).all()
    courses_data = []
    for en in enrollments:
        c = en.course
        courses_data.append({
            'course_id': c.course_id,
            'title': c.title,
            'thumbnail': c.thumbnail,
            'instructor_name': c.instructor.name if c.instructor else 'Unknown',
            'total_lessons': c.total_lessons,
            'enrollment_date': en.enrollment_date
        })
    return jsonify(courses_data), 200
