from flask import Blueprint, jsonify
from models import Course, Section, Lesson

course_bp = Blueprint('courses', __name__)

@course_bp.route('/', methods=['GET'])
def get_courses():
    courses = Course.query.all()
    result = []
    for c in courses:
        result.append({
            'course_id': c.course_id,
            'title': c.title,
            'description': c.description,
            'thumbnail': c.thumbnail,
            'category': c.category,
            'instructor_id': c.instructor_id,
            'total_lessons': c.total_lessons,
            'total_duration': c.total_duration,
            'instructor_name': c.instructor.name if c.instructor else 'Unknown'
        })
    return jsonify(result), 200

@course_bp.route('/<int:course_id>', methods=['GET'])
def get_course_details(course_id):
    course = Course.query.get_or_404(course_id)
    
    sections_data = []
    for sec in course.sections:
        lessons_data = []
        for les in sec.lessons:
            lessons_data.append({
                'lesson_id': les.lesson_id,
                'title': les.title,
                'order_number': les.order_number,
                'duration': les.duration
                # Not returning youtube_url here for security or size, depends on requirement.
                # Actually requirement says details page shows total lessons. 
                # Learning page will fetch youtube url.
            })
        
        sections_data.append({
            'section_id': sec.section_id,
            'title': sec.title,
            'order_number': sec.order_number,
            'lessons': lessons_data
        })
        
    result = {
        'course_id': course.course_id,
        'title': course.title,
        'description': course.description,
        'thumbnail': course.thumbnail,
        'category': course.category,
        'instructor_name': course.instructor.name if course.instructor else 'Unknown',
        'total_lessons': course.total_lessons,
        'total_duration': course.total_duration,
        'sections': sections_data
    }
    
    return jsonify(result), 200
