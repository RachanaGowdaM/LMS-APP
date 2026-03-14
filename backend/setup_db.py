import pymysql
import os
from dotenv import load_dotenv

load_dotenv()

DB_HOST = os.getenv('DB_HOST', 'localhost')
DB_USER = os.getenv('DB_USER', 'root')
DB_PASSWORD = os.getenv('DB_PASSWORD', '')
DB_NAME = os.getenv('DB_NAME', 'lms_db')

def setup_database():
    try:
        connection = pymysql.connect(
            host=DB_HOST,
            user=DB_USER,
            password=DB_PASSWORD
        )
        cursor = connection.cursor()
        cursor.execute(f"CREATE DATABASE IF NOT EXISTS {DB_NAME}")
        print(f"Database '{DB_NAME}' created or already exists.")
        
        cursor.execute(f"USE {DB_NAME}")
        
        # We will rely on SQLAlchemy to create tables, but we need the DB to exist first.
        
        connection.commit()
        connection.close()
        print("Database setup complete.")
    except Exception as e:
        print(f"Error setting up database: {e}")

if __name__ == '__main__':
    setup_database()
