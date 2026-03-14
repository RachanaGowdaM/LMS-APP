pages.home = async function (container) {
    container.innerHTML = `
        <div style="text-align: center; padding: 4rem 1rem;">
            <h1 style="font-size: 3rem; margin-bottom: 1rem;">Master Your Skills with Kodnest</h1>
            <p style="font-size: 1.2rem; max-width: 600px; margin: 0 auto; margin-bottom: 3rem;">
                Premium online courses designed to take your tech career to the next level.
            </p>
        </div>
        
        <div class="courses-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
            <h2>Explore Courses</h2>
        </div>
        
        <div id="course-list" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 2rem;">
            ${Array(3).fill('<div class="glass-card" style="height: 350px; display: flex; align-items: center; justify-content: center; color: var(--text-secondary);">Loading...</div>').join('')}
        </div>
    `;

    try {
        const courses = await api.getCourses();
        const courseList = document.getElementById('course-list');

        if (courses.length === 0) {
            courseList.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 4rem; background: var(--bg-surface); border-radius: 16px;">
                    <i data-lucide="inbox" style="width: 48px; height: 48px; color: var(--text-secondary); margin-bottom: 1rem;"></i>
                    <h3>No courses available yet</h3>
                    <p>Check back later for exciting new content!</p>
                </div>
            `;
            lucide.createIcons();
            return;
        }

        courseList.innerHTML = courses.map(course => `
            <div class="glass-card">
                <div class="glass-badge">${course.category || 'Course'}</div>
                <div class="glass-card-img-wrapper">
                    <img src="${course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=800'}" alt="${course.title}" class="glass-card-img">
                </div>
                <div class="glass-card-content">
                    <h3 style="margin-bottom: 0.5rem; font-size: 1.25rem;">${course.title}</h3>
                    <p style="font-size: 0.9rem; margin-bottom: 1rem; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                        ${course.description || 'No description available.'}
                    </p>
                    
                    <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem; font-size: 0.85rem; color: var(--text-secondary);">
                        <span style="display: flex; align-items: center; gap: 0.25rem;">
                            <i data-lucide="user" style="width: 14px; height: 14px;"></i>
                            ${course.instructor_name}
                        </span>
                        <span style="display: flex; align-items: center; gap: 0.25rem;">
                            <i data-lucide="play-circle" style="width: 14px; height: 14px;"></i>
                            ${course.total_lessons} lessons
                        </span>
                    </div>
                    
                    <a href="/course/${course.course_id}" data-link class="btn btn-primary" style="width: 100%; justify-content: center;">
                        View Details
                    </a>
                </div>
            </div>
        `).join('');
        lucide.createIcons();

    } catch (error) {
        document.getElementById('course-list').innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; color: #ef4444; padding: 2rem;">
                Failed to load courses: ${error.message}
            </div>
        `;
    }
};
