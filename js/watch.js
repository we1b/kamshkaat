/* Path: js/watch.js */

let currentCourse = null;
let completedLessons = [];
let currentQuiz = [];
let currentLessonId = null;

document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    const params = new URLSearchParams(window.location.search);
    const courseId = params.get('id');

    firebase.auth().onAuthStateChanged((user) => {
        if (!user) {
            window.location.href = 'login.html';
            return;
        }
        checkEnrollment(user.uid, courseId);
    });
});

function checkEnrollment(userId, courseId) {
    const db = firebase.database();
    db.ref(`users/${userId}/enrolledCourses/${courseId}`).once('value', (snapshot) => {
        if (!snapshot.exists()) {
            window.location.href = `course-details.html?id=${courseId}&type=academy`;
        } else {
            const enrollmentData = snapshot.val();
            const staticData = window.kameshkahData.find(c => c.id == courseId);
            
            if(staticData) {
                currentCourse = { ...staticData, ...enrollmentData };
                completedLessons = enrollmentData.completedLessons || []; 
                initPlayerUI();
            }
        }
    });
}

function initPlayerUI() {
    document.getElementById('course-title-nav').innerText = currentCourse.titleAr;
    document.getElementById('lessons-count').innerText = `${currentCourse.lessons.length} درس`;
    
    renderPlaylist();
    renderAttachments();
    updateProgress();
    
    // تشغيل أول درس تلقائي لو مفيش حاجة شغالة
    if (currentCourse.lessons.length > 0 && !currentLessonId) {
        playLesson(0);
    }
}

function renderPlaylist() {
    const list = document.getElementById('playlist');
    
    // 1. توليد قائمة الدروس
    let html = currentCourse.lessons.map((lesson, index) => {
        const isCompleted = completedLessons.includes(lesson.id);
        const isActive = currentLessonId === lesson.id;
        let icon = 'play-circle';
        if (lesson.type === 'text') icon = 'book-open';
        if (lesson.type === 'audio') icon = 'headphones';
        
        const activeClass = isActive ? 'bg-emerald-50 border-emerald-500' : 'bg-white border-transparent hover:bg-slate-50';
        
        return `
        <button onclick="playLesson(${index})" class="w-full text-right p-4 rounded-xl flex items-center gap-3 transition border-r-4 shadow-sm mb-2 group ${activeClass}">
            <div class="w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isCompleted ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'}">
                ${isCompleted ? '<i data-lucide="check" class="w-4 h-4"></i>' : (index + 1)}
            </div>
            <div class="flex-1">
                <h4 class="font-bold text-sm text-slate-800 group-hover:text-emerald-700 line-clamp-1">${lesson.title}</h4>
                <span class="text-xs text-slate-400 font-medium">${lesson.duration}</span>
            </div>
            <i data-lucide="${icon}" class="w-5 h-5 text-slate-300 group-hover:text-emerald-500"></i>
        </button>
        `;
    }).join('');

    // 2. زرار الاختبار النهائي (مفتوح للجميع وبدون شروط)
    // لاحظ: شلت أي كود بيشيك على completedLessons
    html += `
        <div class="mt-6 pt-4 border-t border-slate-200">
            <button onclick="openQuizModal()" class="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 text-white p-4 rounded-xl flex items-center justify-between gap-3 shadow-md hover:shadow-lg transition transform hover:-translate-y-1 group cursor-pointer">
                <div class="flex items-center gap-3">
                    <div class="bg-white/20 p-2 rounded-lg">
                        <i data-lucide="award" class="w-6 h-6 text-white"></i>
                    </div>
                    <div class="text-right">
                        <h4 class="font-black text-base">الاختبار النهائي</h4>
                        <span class="text-xs text-yellow-50 opacity-90">جاهز للتحدي؟ (مفتوح)</span>
                    </div>
                </div>
                <i data-lucide="chevron-left" class="w-5 h-5 text-white animate-pulse"></i>
            </button>
        </div>
    `;

    list.innerHTML = html;
    lucide.createIcons();
}

function playLesson(index) {
    const lesson = currentCourse.lessons[index];
    currentLessonId = lesson.id;
    
    renderPlaylist(); 

    const videoContainer = document.getElementById('video-container');
    const audioContainer = document.getElementById('audio-container');
    const textViewer = document.getElementById('text-viewer');
    
    const videoPlayer = document.getElementById('video-player');
    const audioPlayer = document.getElementById('audio-player');
    
    videoContainer.classList.add('hidden');
    audioContainer.classList.add('hidden');
    textViewer.classList.add('hidden');
    
    videoPlayer.src = "";
    audioPlayer.pause();

    if (lesson.type === 'text') {
        textViewer.classList.remove('hidden');
        document.getElementById('text-lesson-title').innerText = lesson.title;
        document.getElementById('text-lesson-content').innerHTML = lesson.content;
        document.querySelector('.flex-1').scrollTop = 0; 
        
        // تسجيل القراءة تلقائياً
        markLessonComplete(lesson.id);
    } 
    else if (lesson.type === 'audio') {
        audioContainer.classList.remove('hidden');
        document.getElementById('audio-title').innerText = lesson.title;
        audioPlayer.src = lesson.url;
        audioPlayer.play();
        markLessonComplete(lesson.id);
    } 
    else {
        videoContainer.classList.remove('hidden');
        if (!videoPlayer.src.includes(lesson.url)) {
            videoPlayer.src = lesson.url;
        }
        markLessonComplete(lesson.id);
    }
}

// دالة الزرار "التالي"
window.finishCurrentLesson = function() {
    if(currentLessonId) {
        markLessonComplete(currentLessonId);
        const currentIndex = currentCourse.lessons.findIndex(l => l.id == currentLessonId);
        
        // لو لسه فيه دروس، شغل اللي بعده
        if (currentIndex < currentCourse.lessons.length - 1) {
            playLesson(currentIndex + 1);
        } else {
            // لو خلص، ما تعملش حاجة، سيبه يقرر يروح فين
            alert("خلصت كل الدروس! تقدر تعيد أي درس أو تدخل الامتحان من القائمة.");
        }
    }
}

function markLessonComplete(lessonId) {
    if (!completedLessons.includes(lessonId)) {
        completedLessons.push(lessonId);
        
        const progress = Math.round((completedLessons.length / currentCourse.lessons.length) * 100);
        
        const user = firebase.auth().currentUser;
        const db = firebase.database();
        db.ref(`users/${user.uid}/enrolledCourses/${currentCourse.id}`).update({
            completedLessons: completedLessons,
            progress: progress
        });

        renderPlaylist();
        updateProgress();
    }
}

function updateProgress() {
    const progress = Math.round((completedLessons.length / currentCourse.lessons.length) * 100);
    document.getElementById('progress-text').innerText = `${progress}%`;
    document.getElementById('progress-bar').style.width = `${progress}%`;
}

function renderAttachments() {
    const list = document.getElementById('attachments-list');
    if (currentCourse.attachments && currentCourse.attachments.length > 0) {
        list.innerHTML = currentCourse.attachments.map(att => `
            <li class="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl hover:shadow-md transition">
                <div class="flex items-center gap-3">
                    <div class="bg-blue-100 text-blue-600 p-2 rounded-lg">
                        <i data-lucide="file" class="w-5 h-5"></i>
                    </div>
                    <span class="font-bold text-slate-700">${att.name}</span>
                </div>
                <a href="${att.link}" target="_blank" class="text-sm font-bold text-blue-600 hover:bg-blue-50 px-3 py-1 rounded-lg transition">تحميل</a>
            </li>
        `).join('');
    } else {
        list.innerHTML = '<li class="text-slate-400 text-sm text-center">لا توجد ملحقات</li>';
    }
    lucide.createIcons();
}

// --- نافذة الاختبار (بدون شروط) ---
window.openQuizModal = function() {
    // 👇 مفيش شرط هنا، الامتحان بيفتح لأي حد
    
    const quizArea = document.getElementById('quiz-questions-area');
    const modal = document.getElementById('quiz-modal');
    
    if (!currentQuiz.length && currentCourse.quiz) {
        const allQuestions = [...currentCourse.quiz];
        currentQuiz = allQuestions.sort(() => 0.5 - Math.random()).slice(0, 5);
    }

    if(!currentQuiz || currentQuiz.length === 0) {
        alert("الكورس ده مفيهوش امتحان، عاش يا بطل! 🎉");
        finishCourse();
        return;
    }

    let html = '';
    currentQuiz.forEach((q, index) => {
        html += `
        <div class="mb-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <p class="font-bold text-slate-800 mb-3 text-lg border-b border-slate-100 pb-2">
                <span class="text-emerald-600">س ${index + 1}:</span> ${q.q}
            </p>
            <div class="space-y-3">
                ${q.options.map((opt, i) => `
                    <label class="flex items-center gap-3 cursor-pointer p-3 rounded-lg border border-slate-100 hover:bg-emerald-50 hover:border-emerald-200 transition group">
                        <div class="relative flex items-center">
                            <input type="radio" name="q${index}" value="${i}" class="peer h-5 w-5 cursor-pointer appearance-none rounded-full border border-slate-300 checked:border-emerald-500 checked:bg-emerald-500 transition-all">
                            <div class="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" /></svg>
                            </div>
                        </div>
                        <span class="text-slate-600 font-medium group-hover:text-slate-800">${opt}</span>
                    </label>
                `).join('')}
            </div>
        </div>`;
    });

    quizArea.innerHTML = html;
    modal.classList.remove('hidden');
}

window.submitQuiz = function() {
    let score = 0;
    let allAnswered = true;
    
    currentQuiz.forEach((q, index) => {
        const selected = document.querySelector(`input[name="q${index}"]:checked`);
        if (!selected) {
            allAnswered = false;
        } else if (parseInt(selected.value) === q.correct) {
            score++;
        }
    });

    if (!allAnswered) {
        alert("جاوب على كل الأسئلة عشان نعرف نطلع النتيجة 😉");
        return;
    }

    const percentage = (score / currentQuiz.length) * 100;

    if (percentage >= 75) { 
        // نجاح
        document.getElementById('quiz-modal').classList.add('hidden');
        alert(`ألف مبروك! نتيجتك ${percentage}%. 🎉\nالشهادة جاهزة في لوحة التحكم.`);
        finishCourse();
    } else {
        // رسوب
        alert(`نتيجتك ${percentage}%. محتاج 75% عشان الشهادة.\nجرب تاني، مش مشكلة! 💪`);
        currentQuiz = []; 
        // هنسيب النافذة مفتوحة عشان يعيد أو يقفلها براحته
        openQuizModal(); 
    }
}

function finishCourse() {
    const user = firebase.auth().currentUser;
    firebase.database().ref(`users/${user.uid}/enrolledCourses/${currentCourse.id}`).update({
        status: 'completed',
        completedAt: new Date().toISOString()
    });
}