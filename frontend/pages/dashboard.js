pages.dashboard = async function (container) {
    if (!auth.user) {
        router.navigate('/login');
        return;
    }

    container.innerHTML = `
        <div style="margin-bottom: 3rem;">
            <h1 style="font-size: 2.5rem; margin-bottom: 0.5rem;">Welcome back, ${auth.user.name}</h1>
            <p style="color: var(--text-secondary); font-size: 1.1rem;">Pick up where you left off or start something new.</p>
        </div>
        
        <div style="margin-bottom: 2rem; display: flex; justify-content: space-between; align-items: center;">
            <h2>Your Enrolled Courses</h2>
        </div>
        
        <div id="enrolled-courses-list" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 2rem;">
            <div style="padding: 2rem; color: var(--text-secondary);">Loading your learning journey...</div>
        </div>
    `;

    try {
        const myCourses = await api.getMyCourses();
        const coursesList = document.getElementById('enrolled-courses-list');

        if (myCourses.length === 0) {
            coursesList.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 4rem; background: var(--bg-surface); border-radius: 16px;">
                    <i data-lucide="book-open" style="width: 48px; height: 48px; color: var(--text-secondary); margin-bottom: 1rem;"></i>
                    <h3>You are not enrolled in any courses yet</h3>
                    <p style="margin-bottom: 1.5rem;">Discover our premium content and start learning today!</p>
                    <button onclick="router.navigate('/')" class="btn btn-primary">Explore Courses</button>
                </div>
            `;
            lucide.createIcons();
            return;
        }

        // Fetch progress for each course to display
        const courseHtmlPromises = myCourses.map(async (course) => {
            try {
                const progressData = await api.getProgress(course.course_id);
                const percent = progressData.percentage || 0;

                return `
                    <div class="glass-card" style="display: flex; flex-direction: column;">
                        <div class="glass-card-img-wrapper" style="height: 140px;">
                            <img src="${course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=800'}" alt="${course.title}" class="glass-card-img">
                        </div>
                        <div class="glass-card-content" style="flex: 1; display: flex; flex-direction: column;">
                            <h3 style="margin-bottom: 0.5rem; font-size: 1.1rem; flex: 1;">${course.title}</h3>
                            
                            <div style="margin-bottom: 1rem;">
                                <div style="display: flex; justify-content: space-between; font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 0.25rem;">
                                    <span>Progress</span>
                                    <span>${percent}%</span>
                                </div>
                                <div style="background: rgba(0,0,0,0.3); height: 6px; border-radius: 3px; overflow: hidden;">
                                    <div style="width: ${percent}%; height: 100%; background: linear-gradient(90deg, var(--primary), var(--secondary));"></div>
                                </div>
                            </div>
                            
                            <a href="/learn/${course.course_id}" data-link class="btn btn-primary" style="width: 100%; justify-content: center; font-size: 0.9rem;">
                                ${percent === 0 ? 'Start Course' : percent === 100 ? 'Review Course' : 'Continue Learning'} <i data-lucide="play-circle" style="width: 16px; height: 16px;"></i>
                            </a>
                        </div>
                    </div>
                `;
            } catch (err) {
                return `
                    <div class="glass-card" style="padding: 1.5rem; display: flex; justify-content: center; align-items: center; color: var(--text-secondary);">
                        Failed to load progress for ${course.title}
                    </div>
                `;
            }
        });

        const renderedHtmls = await Promise.all(courseHtmlPromises);
        coursesList.innerHTML = renderedHtmls.join('');
        lucide.createIcons();

    } catch (error) {
        document.getElementById('enrolled-courses-list').innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; color: #ef4444; padding: 2rem;">
                Failed to load dashboard: ${error.message}
            </div>
        `;
    }
};
