from flask import Blueprint, jsonify
from models import Course, Section, Lesson
from auth_middleware import token_required

lesson_bp = Blueprint('lessons', __name__)

@lesson_bp.route('/course/<int:course_id>', methods=['GET'])
@token_required
def get_course_lessons(current_user, course_id):
    course = Course.query.get_or_404(course_id)
    sections_data = []
    for sec in course.sections:
        lessons_data = []
        for les in sec.lessons:
            lessons_data.append({
                'lesson_id': les.lesson_id,
                'title': les.title,
                'order_number': les.order_number,
                'duration': les.duration,
                'youtube_url': les.youtube_url # URL provided for learning page
            })
        
        sections_data.append({
            'section_id': sec.section_id,
            'title': sec.title,
            'order_number': sec.order_number,
            'lessons': lessons_data
        })
    
    return jsonify(sections_data), 200

@lesson_bp.route('/<int:lesson_id>', methods=['GET'])
@token_required
def get_lesson(current_user, lesson_id):
    lesson = Lesson.query.get_or_404(lesson_id)
    return jsonify({
        'lesson_id': lesson.lesson_id,
        'section_id': lesson.section_id,
        'title': lesson.title,
        'order_number': lesson.order_number,
        'duration': lesson.duration,
        'youtube_url': lesson.youtube_url
    }), 200
