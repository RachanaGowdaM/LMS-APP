pages.courseDetails = async function (container, params) {
    const courseId = params.id;

    container.innerHTML = `
        <div id="course-content-loading" style="text-align: center; padding: 4rem;">
            Loading course details...
        </div>
    `;

    try {
        const course = await api.getCourseDetails(courseId);

        container.innerHTML = `
            <div style="display: grid; grid-template-columns: 1fr 350px; gap: 2rem; align-items: start;">
                <!-- Main Content -->
                <div>
                    <div style="margin-bottom: 2rem;">
                        <h1 style="font-size: 2.5rem; margin-bottom: 1rem;">${course.title}</h1>
                        <p style="font-size: 1.1rem; color: var(--text-secondary); margin-bottom: 1.5rem;">
                            ${course.description || 'No description provided.'}
                        </p>
                        
                        <div style="display: flex; gap: 2rem; font-size: 0.95rem; color: var(--text-secondary);">
                            <span style="display: flex; align-items: center; gap: 0.5rem;">
                                <i data-lucide="user"></i> Created by ${course.instructor_name}
                            </span>
                            <span style="display: flex; align-items: center; gap: 0.5rem;">
                                <i data-lucide="folder"></i> ${course.category || 'General'}
                            </span>
                            <span style="display: flex; align-items: center; gap: 0.5rem;">
                                <i data-lucide="play-circle"></i> ${course.total_lessons} Lessons
                            </span>
                        </div>
                    </div>
                    
                    <div class="glass-card" style="padding: 2rem; margin-bottom: 2rem;">
                        <h2>Course Content</h2>
                        <div style="margin-top: 1.5rem;">
                            ${course.sections.map((section, idx) => `
                                <div style="margin-bottom: 1rem; border: 1px solid var(--border-color); border-radius: 8px; overflow: hidden;">
                                    <div style="background: rgba(255,255,255,0.05); padding: 1rem 1.5rem; font-weight: 600; display: flex; justify-content: space-between;">
                                        <span>Section ${idx + 1}: ${section.title}</span>
                                        <span style="color: var(--text-secondary); font-size: 0.9rem;">${section.lessons.length} lessons</span>
                                    </div>
                                    <div>
                                        ${section.lessons.map((lesson, lidx) => `
                                            <div style="padding: 1rem 1.5rem; border-top: 1px solid var(--border-color); display: flex; align-items: center; gap: 1rem; color: var(--text-secondary);">
                                                <i data-lucide="play-circle" style="width: 16px; height: 16px;"></i>
                                                <span style="flex: 1;">${idx + 1}.${lidx + 1} ${lesson.title}</span>
                                            </div>
                                        `).join('')}
                                    </div>
                                </div>
                            `).join('') || '<p>No sections created yet.</p>'}
                        </div>
                    </div>
                </div>
                
                <!-- Sidebar -->
                <div class="glass-card" style="position: sticky; top: 100px;">
                    <img src="${course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=800'}" alt="${course.title}" style="width: 100%; height: 200px; object-fit: cover;">
                    <div style="padding: 2rem;">
                        <h3 style="margin-bottom: 1.5rem;">Ready to learn?</h3>
                        
                        ${auth.isAuthenticated()
                ? `<button id="enroll-btn" class="btn btn-primary" style="width: 100%; justify-content: center; font-size: 1.1rem; padding: 1rem;">
                                Enroll Now
                               </button>`
                : `<button onclick="router.navigate('/login')" class="btn btn-primary" style="width: 100%; justify-content: center; font-size: 1.1rem; padding: 1rem;">
                                Login to Enroll
                               </button>`
            }
                    </div>
                </div>
            </div>
        `;

        lucide.createIcons();

        // Handle Enrollment
        const enrollBtn = document.getElementById('enroll-btn');
        if (enrollBtn) {
            // First check if already enrolled by fetching my courses
            const myCourses = await api.getMyCourses();
            const isEnrolled = myCourses.some(c => c.course_id == courseId);

            if (isEnrolled) {
                enrollBtn.innerHTML = 'Go to Course <i data-lucide="arrow-right"></i>';
                enrollBtn.classList.replace('btn-primary', 'btn-secondary');
                enrollBtn.onclick = () => router.navigate(`/learn/${courseId}`);
            } else {
                enrollBtn.onclick = async () => {
                    try {
                        enrollBtn.innerHTML = 'Enrolling...';
                        enrollBtn.disabled = true;
                        await api.enrollCourse(courseId);
                        app.showToast('Successfully enrolled!');
                        router.navigate(`/learn/${courseId}`);
                    } catch (error) {
                        app.showToast(error.message, 'error');
                        enrollBtn.innerHTML = 'Enroll Now';
                        enrollBtn.disabled = false;
                    }
                };
            }
            lucide.createIcons();
        }

    } catch (error) {
        container.innerHTML = `
            <div style="text-align: center; color: #ef4444; padding: 4rem;">
                Failed to load course details: ${error.message}
                <br><br>
                <button onclick="router.navigate('/')" class="btn btn-secondary">Back to Home</button>
            </div>
        `;
    }
};
