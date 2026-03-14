from models import db, User, Course, Section, Lesson
from app import create_app
from werkzeug.security import generate_password_hash

def seed_database():
    app = create_app()
    with app.app_context():
        print("Starting database seeding...")
        
        # Check if already seeded
        if User.query.filter_by(email="admin@kodnest.com").first():
            print("Database already seeded. Skipping.")
            return

        # 1. Create Instructor
        instructor = User(
            name="Kodnest Instructor",
            email="admin@kodnest.com",
            password=generate_password_hash("password123", method="pbkdf2:sha256"),
            role="Instructor"
        )
        db.session.add(instructor)
        db.session.commit()

        # 2. Create sample course 1: Web Dev
        c1 = Course(
            title="Full Stack Web Development Masterclass",
            description="Learn HTML, CSS, JavaScript, React, and Node.js from scratch to build fully functional web applications. Includes real-world projects and interview preparation.",
            thumbnail="https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=800",
            category="Web Development",
            instructor_id=instructor.user_id,
            total_lessons=4,
            total_duration=45
        )
        db.session.add(c1)
        db.session.commit()

        # Course 1 Sections & Lessons
        s1 = Section(course_id=c1.course_id, title="Frontend Fundamentals", order_number=1)
        db.session.add(s1)
        db.session.commit()

        db.session.add_all([
            Lesson(section_id=s1.section_id, title="HTML Basics & Structure", order_number=1, duration=10, youtube_url="https://www.youtube.com/embed/qz0aGYrrlhU"),
            Lesson(section_id=s1.section_id, title="CSS Styling & Layouts", order_number=2, duration=15, youtube_url="https://www.youtube.com/embed/OEV8gMkCHXQ")
        ])

        s2 = Section(course_id=c1.course_id, title="Backend Introduction", order_number=2)
        db.session.add(s2)
        db.session.commit()

        db.session.add_all([
            Lesson(section_id=s2.section_id, title="Python Flask Crash Course", order_number=1, duration=10, youtube_url="https://www.youtube.com/embed/Z1RJmh_OqeA"),
            Lesson(section_id=s2.section_id, title="RESTful APIs Explained", order_number=2, duration=10, youtube_url="https://www.youtube.com/embed/lsMQRaeKNDk")
        ])

        # 3. Create sample course 2: Python
        c2 = Course(
            title="Complete Python Bootcamp",
            description="Master Python by building 100 projects. Go from zero to hero in Python 3. Covers automation, data science, machine learning, web scraping, and more.",
            thumbnail="https://images.unsplash.com/photo-1526379095098-d400fd0bf935?auto=format&fit=crop&q=80&w=800",
            category="Programming",
            instructor_id=instructor.user_id,
            total_lessons=2,
            total_duration=25
        )
        db.session.add(c2)
        db.session.commit()

        s3 = Section(course_id=c2.course_id, title="Python Basics", order_number=1)
        db.session.add(s3)
        db.session.commit()

        db.session.add_all([
            Lesson(section_id=s3.section_id, title="Variables and Data Types", order_number=1, duration=12, youtube_url="https://www.youtube.com/embed/k9TUPpGqYTo"),
            Lesson(section_id=s3.section_id, title="Control Flow & Loops", order_number=2, duration=13, youtube_url="https://www.youtube.com/embed/6iF8Xb7Z3wQ")
        ])
        
        db.session.commit()
        print("Database seeding completed successfully!")

if __name__ == "__main__":
    seed_database()
