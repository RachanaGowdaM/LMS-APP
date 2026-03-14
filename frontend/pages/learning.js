pages.learningArea = async function (container, params) {
    const courseId = params.courseId;

    // Store state internally for the learning page
    let state = {
        sections: [],
        flatLessons: [],
        currentLesson: null,
        completedLessonIds: [],
        progressPercentage: 0
    };

    container.innerHTML = `
        <div style="display: flex; height: calc(100vh - 120px); gap: 2px; margin: -2rem;">
            <!-- Left Sidebar: Contents -->
            <div style="width: 350px; background: var(--bg-surface); border-right: 1px solid var(--border-color); display: flex; flex-direction: column;">
                <div style="padding: 1.5rem; border-bottom: 1px solid var(--border-color);">
                    <h2 style="font-size: 1.2rem; margin-bottom: 1rem;">Course Content</h2>
                    <div style="background: rgba(0,0,0,0.2); height: 8px; border-radius: 4px; overflow: hidden; margin-bottom: 0.5rem;">
                        <div id="progress-bar-fill" style="width: 0%; height: 100%; background: linear-gradient(90deg, var(--primary), var(--secondary)); transition: width 0.5s ease;"></div>
                    </div>
                    <div style="display: flex; justify-content: space-between; font-size: 0.85rem; color: var(--text-secondary);">
                        <span id="progress-text">0% Complete</span>
                    </div>
                </div>
                <div id="lesson-list-container" style="flex: 1; overflow-y: auto;">
                    <div style="padding: 2rem; text-align: center; color: var(--text-secondary);">Loading lessons...</div>
                </div>
            </div>
            
            <!-- Main Content: Video Player -->
            <div style="flex: 1; background: #000; position: relative; display: flex; flex-direction: column;">
                <div id="video-container" style="flex: 1; display: flex; align-items: center; justify-content: center;">
                    <!-- iframe injected here -->
                </div>
                
                <div style="background: var(--bg-surface); padding: 1.5rem; border-top: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center;">
                    <h3 id="current-lesson-title" style="margin: 0; font-size: 1.2rem;">Select a lesson</h3>
                    
                    <div style="display: flex; gap: 1rem;">
                        <button id="btn-prev" class="btn btn-secondary" disabled>
                            <i data-lucide="chevron-left"></i> Previous
                        </button>
                        <button id="btn-complete" class="btn btn-primary" style="display: none;">
                            Mark as Complete <i data-lucide="check-circle"></i>
                        </button>
                        <button id="btn-next" class="btn btn-secondary" disabled>
                            Next <i data-lucide="chevron-right"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    lucide.createIcons();

    // Fetch required data
    try {
        const [sectionsData, progressData] = await Promise.all([
            api.getCourseLessons(courseId),
            api.getProgress(courseId)
        ]);

        state.sections = sectionsData;
        state.completedLessonIds = progressData.completed_lessons || [];
        state.progressPercentage = progressData.percentage || 0;

        // Flatten lessons for easy Prev/Next navigation
        state.sections.forEach(sec => {
            sec.lessons.forEach(l => {
                state.flatLessons.push({ ...l, sectionId: sec.section_id, sectionTitle: sec.title });
            });
        });

        renderLessonList();
        updateProgressUI();

        // Auto-select last watched or first lesson
        if (state.flatLessons.length > 0) {
            let initialLesson = state.flatLessons[0];
            if (progressData.last_watched_lesson_id) {
                const found = state.flatLessons.find(l => l.lesson_id === progressData.last_watched_lesson_id);
                if (found) initialLesson = found;
            }
            selectLesson(initialLesson);
        }

    } catch (error) {
        document.getElementById('lesson-list-container').innerHTML = `
            <div style="padding: 2rem; color: #ef4444; text-align: center;">Error loading course: ${error.message}</div>
        `;
    }

    // Interactive functions
    function renderLessonList() {
        const listDiv = document.getElementById('lesson-list-container');
        listDiv.innerHTML = state.sections.map((section, sidx) => `
            <div>
                <div style="padding: 1rem 1.5rem; background: rgba(255,255,255,0.02); font-weight: 600; font-size: 0.9rem; border-bottom: 1px solid var(--border-color);">
                    Section ${sidx + 1}: ${section.title}
                </div>
                <div>
                    ${section.lessons.map((lesson, lidx) => {
            const isCompleted = state.completedLessonIds.includes(lesson.lesson_id);
            const isCurrent = state.currentLesson && state.currentLesson.lesson_id === lesson.lesson_id;

            return `
                            <div class="lesson-item ${isCurrent ? 'active' : ''}" 
                                 data-id="${lesson.lesson_id}"
                                 style="padding: 1rem 1.5rem; cursor: pointer; display: flex; align-items: center; gap: 1rem; border-bottom: 1px solid rgba(255,255,255,0.05); transition: background 0.2s; background: ${isCurrent ? 'rgba(99, 102, 241, 0.1)' : 'transparent'};">
                                
                                <div style="color: ${isCompleted ? '#10b981' : 'var(--text-secondary)'}">
                                    <i data-lucide="${isCompleted ? 'check-circle' : 'circle'}" style="width: 18px; height: 18px;"></i>
                                </div>
                                <span style="flex: 1; font-size: 0.9rem; color: ${isCurrent ? 'white' : 'var(--text-secondary)'};">${sidx + 1}.${lidx + 1} ${lesson.title}</span>
                            </div>
                        `;
        }).join('')}
                </div>
            </div>
        `).join('');
        lucide.createIcons();

        // Attach click listeners
        listDiv.querySelectorAll('.lesson-item').forEach(el => {
            el.addEventListener('click', () => {
                const id = parseInt(el.getAttribute('data-id'));
                const lesson = state.flatLessons.find(l => l.lesson_id === id);
                if (lesson) selectLesson(lesson);
            });
        });
    }

    function selectLesson(lesson) {
        state.currentLesson = lesson;

        // Extract YouTube ID assuming standard format or just raw URL if embedded format is given
        // Fallback safety embedded tag
        let embedUrl = lesson.youtube_url;
        if (embedUrl && !embedUrl.includes('embed')) {
            // Very naive extraction for demo
            const videoIdMatch = embedUrl.match(/(?:v=|youtu\.be\/)([^&]+)/);
            if (videoIdMatch) {
                embedUrl = `https://www.youtube.com/embed/${videoIdMatch[1]}`;
            }
        }

        const videoContainer = document.getElementById('video-container');
        if (embedUrl) {
            videoContainer.innerHTML = `
                <iframe 
                    width="100%" 
                    height="100%" 
                    src="${embedUrl}" 
                    title="YouTube video player" 
                    frameborder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowfullscreen>
                </iframe>
            `;
        } else {
            videoContainer.innerHTML = '<div style="color: var(--text-secondary);">No valid video URL found for this lesson.</div>';
        }

        document.getElementById('current-lesson-title').textContent = lesson.title;

        // Update selection UI
        renderLessonList();
        updateControls();
    }

    function updateControls() {
        if (!state.currentLesson) return;

        const currentIndex = state.flatLessons.findIndex(l => l.lesson_id === state.currentLesson.lesson_id);
        const isCompleted = state.completedLessonIds.includes(state.currentLesson.lesson_id);

        const btnPrev = document.getElementById('btn-prev');
        const btnNext = document.getElementById('btn-next');
        const btnComplete = document.getElementById('btn-complete');

        // Navigation state
        btnPrev.disabled = currentIndex === 0;
        btnNext.disabled = currentIndex === state.flatLessons.length - 1;

        // Completion logic
        btnComplete.style.display = isCompleted ? 'none' : 'flex';

        // Attach handlers (remove old ones first via cloning)

        const newBtnPrev = btnPrev.cloneNode(true);
        btnPrev.parentNode.replaceChild(newBtnPrev, btnPrev);
        newBtnPrev.addEventListener('click', () => {
            if (currentIndex > 0) selectLesson(state.flatLessons[currentIndex - 1]);
        });

        const newBtnNext = btnNext.cloneNode(true);
        btnNext.parentNode.replaceChild(newBtnNext, btnNext);
        newBtnNext.addEventListener('click', () => {
            if (currentIndex < state.flatLessons.length - 1) selectLesson(state.flatLessons[currentIndex + 1]);
        });

        const newBtnComplete = btnComplete.cloneNode(true);
        btnComplete.parentNode.replaceChild(newBtnComplete, btnComplete);
        newBtnComplete.addEventListener('click', async () => {
            try {
                newBtnComplete.disabled = true;
                newBtnComplete.innerHTML = 'Saving...';

                await api.updateProgress(courseId, state.currentLesson.lesson_id);

                // Update local state
                state.completedLessonIds.push(state.currentLesson.lesson_id);
                state.progressPercentage = Math.min(100, Math.round((state.completedLessonIds.length / state.flatLessons.length) * 100));

                updateProgressUI();
                renderLessonList();
                updateControls();
                app.showToast('Lesson marked as complete!');

                // Auto advance if not last
                if (currentIndex < state.flatLessons.length - 1) {
                    setTimeout(() => selectLesson(state.flatLessons[currentIndex + 1]), 1000);
                }

            } catch (err) {
                app.showToast(err.message, 'error');
                newBtnComplete.disabled = false;
                newBtnComplete.innerHTML = 'Mark as Complete <i data-lucide="check-circle"></i>';
                lucide.createIcons();
            }
        });
    }

    function updateProgressUI() {
        document.getElementById('progress-bar-fill').style.width = `${state.progressPercentage}%`;
        document.getElementById('progress-text').textContent = `${state.progressPercentage}% Complete`;
    }
};
