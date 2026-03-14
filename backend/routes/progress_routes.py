from flask import Blueprint, jsonify, request
from models import db, Progress, Course, Lesson
from auth_middleware import token_required
import datetime

progress_bp = Blueprint('progress', __name__)

@progress_bp.route('/update', methods=['POST'])
@token_required
def update_progress(current_user):
    data = request.get_json()
    course_id = data.get('course_id')
    lesson_id = data.get('lesson_id')
    
    if not course_id or not lesson_id:
        return jsonify({'message': 'course_id and lesson_id required'}), 400
        
    progress = Progress.query.filter_by(user_id=current_user.user_id, course_id=course_id, lesson_id=lesson_id).first()
    
    if not progress:
        progress = Progress(
            user_id=current_user.user_id,
            course_id=course_id,
            lesson_id=lesson_id,
            status='completed',
            last_watched=datetime.datetime.utcnow()
        )
        db.session.add(progress)
    else:
        progress.last_watched = datetime.datetime.utcnow()
        progress.status = 'completed'
        
    db.session.commit()
    
    return jsonify({'message': 'Progress updated successfully'}), 200

@progress_bp.route('/<int:course_id>', methods=['GET'])
@token_required
def get_progress(current_user, course_id):
    Course.query.get_or_404(course_id) # ensure course exists
    
    completed_lessons = Progress.query.filter_by(
        user_id=current_user.user_id,
        course_id=course_id,
        status='completed'
    ).all()
    
    completed_lesson_ids = [p.lesson_id for p in completed_lessons]
    
    # Calculate percentage based on course's total lessons
    course = Course.query.get(course_id)
    total_lessons = course.total_lessons
    
    percentage = 0
    if total_lessons > 0:
        percentage = min(100, int((len(completed_lesson_ids) / total_lessons) * 100))
        
    # Get last watched lesson
    last_watched = Progress.query.filter_by(
        user_id=current_user.user_id,
        course_id=course_id
    ).order_by(Progress.last_watched.desc()).first()
    
    last_watched_id = last_watched.lesson_id if last_watched else None
    
    return jsonify({
        'course_id': course_id,
        'completed_lessons': completed_lesson_ids,
        'percentage': percentage,
        'last_watched_lesson_id': last_watched_id
    }), 200
