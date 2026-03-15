/**
 * API Utility Class
 * Handles all communications with the Flask backend
 */
class ApiService {
    constructor() {
        // Change from http://localhost:5000/api to the live Render URL
        this.baseUrl = 'https://lms-app-3.onrender.com/api';
    }

    // Helper to get auth headers
    getHeaders(requireAuth = false) {
        const headers = { 'Content-Type': 'application/json' };
        if (requireAuth) {
            const token = localStorage.getItem('lms_token');
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
        }
        return headers;
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        try {
            const response = await fetch(url, options);
            const data = await response.json();

            if (!response.ok) {
                // If unauthorized and it's a protected route, trigger logout
                if (response.status === 401 && options.headers && options.headers['Authorization']) {
                    auth.logout();
                }
                throw new Error(data.message || data.error || 'API Request Failed');
            }
            return data;
        } catch (error) {
            console.error(`API Error (${endpoint}):`, error);
            throw error;
        }
    }

    // Auth Modules
    async login(email, password) {
        return this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
            headers: this.getHeaders()
        });
    }

    async signup(name, email, password) {
        return this.request('/auth/signup', {
            method: 'POST',
            body: JSON.stringify({ name, email, password }),
            headers: this.getHeaders()
        });
    }

    // Course Modules
    async getCourses() {
        return this.request('/courses/', {
            method: 'GET',
            headers: this.getHeaders()
        });
    }

    async getCourseDetails(id) {
        return this.request(`/courses/${id}`, {
            method: 'GET',
            headers: this.getHeaders()
        });
    }

    // Lesson Modules
    async getCourseLessons(courseId) {
        return this.request(`/lessons/course/${courseId}`, {
            method: 'GET',
            headers: this.getHeaders(true)
        });
    }

    // Enrollment Modules
    async enrollCourse(courseId) {
        return this.request('/enrollments/', {
            method: 'POST',
            body: JSON.stringify({ course_id: courseId }),
            headers: this.getHeaders(true)
        });
    }

    async getMyCourses() {
        return this.request('/enrollments/my-courses', {
            method: 'GET',
            headers: this.getHeaders(true)
        });
    }

    // Progress Modules
    async updateProgress(courseId, lessonId) {
        return this.request('/progress/update', {
            method: 'POST',
            body: JSON.stringify({ course_id: courseId, lesson_id: lessonId }),
            headers: this.getHeaders(true)
        });
    }

    async getProgress(courseId) {
        return this.request(`/progress/${courseId}`, {
            method: 'GET',
            headers: this.getHeaders(true)
        });
    }
}

const api = new ApiService();
