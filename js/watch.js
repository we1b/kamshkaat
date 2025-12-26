/* Path: js/watch.js */

let currentCourse = null;
let completedLessons = [];
let currentQuiz = [];

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
            alert('لازم تشترك في الكورس الأول!');
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
    updateProgress();
    
    // تشغيل أول درس لو مفيش حاجة شغالة
    if (currentCourse.lessons.length > 0) {
        playLesson(0);
    }
}

function renderPlaylist() {
    const list = document.getElementById('playlist');
    list.innerHTML = currentCourse.lessons.map((lesson, index) => {
        const isCompleted = completedLessons.includes(lesson.id);
        const icon = lesson.type === 'text' ? 'book-open' : 'play-circle'; 
        
        return `
        <button onclick="playLesson(${index})" class="w-full text-right p-3 rounded-xl flex items-center gap-3 hover:bg-slate-50 transition border border-transparent focus:border-emerald-500 group ${isCompleted ? 'bg-emerald-50/50' : ''}">
            <div class="w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isCompleted ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'}">
                ${isCompleted ? '<i data-lucide="check" class="w-4 h-4"></i>' : (index + 1)}
            </div>
            <div class="flex-1">
                <h4 class="font-bold text-sm text-slate-700 group-hover:text-emerald-700 line-clamp-1">${lesson.title}</h4>
                <span class="text-xs text-slate-400">${lesson.duration}</span>
            </div>
            <i data-lucide="${icon}" class="w-5 h-5 text-slate-300 group-hover:text-emerald-500"></i>
        </button>
        `;
    }).join('');
    lucide.createIcons();
}

function playLesson(index) {
    const lesson = currentCourse.lessons[index];
    
    const videoContainer = document.getElementById('video-container');
    const textViewer = document.getElementById('text-viewer');
    const videoPlayer = document.getElementById('video-player');
    
    // إخفاء الكل الأول
    videoContainer.classList.add('hidden');
    textViewer.classList.add('hidden');

    if (lesson.type === 'text') {
        // وضع القراءة: لازم نوقف الفيديو عشان الصوت ميفضلش شغال
        videoPlayer.src = ""; 
        
        textViewer.classList.remove('hidden');
        document.getElementById('text-lesson-title').innerText = lesson.title;
        document.getElementById('text-lesson-content').innerHTML = lesson.content;
    } else {
        // وضع الفيديو
        videoContainer.classList.remove('hidden');
        // بنحمل الفيديو بس لو هو مش شغال بالفعل عشان التوفير
        if (!videoPlayer.src.includes(lesson.url)) {
            videoPlayer.src = lesson.url;
        }
    }

    // تسجيل الاكتمال
    markLessonComplete(lesson.id);
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

    if (progress === 100) {
        document.getElementById('quiz-locked').classList.add('hidden');
        document.getElementById('quiz-area').classList.remove('hidden');
        initQuiz();
    }
}

// --- نظام الاختبار ---
function initQuiz() {
    const quizArea = document.getElementById('quiz-area');
    if (!currentQuiz.length) {
        // نستخدم [... ] عشان نعمل نسخة ومنلخبطش الترتيب الأصلي في الداتا
        const allQuestions = currentCourse.quiz ? [...currentCourse.quiz] : [];
        // اختيار 3 أسئلة عشوائية
        currentQuiz = allQuestions.sort(() => 0.5 - Math.random()).slice(0, 3);
    }

    if(currentQuiz.length === 0) {
        quizArea.innerHTML = `<p class="text-center text-slate-500">لا يوجد اختبار لهذا الكورس. اضغط زر الانتهاء.</p>
        <button onclick="finishCourse()" class="bg-emerald-600 text-white w-full py-3 rounded-xl font-bold mt-4">إتمام الكورس</button>`;
        return;
    }

    let html = `<h3 class="font-black text-xl mb-4 text-emerald-900">اختبار إتمام الكورس 🎓</h3>`;
    currentQuiz.forEach((q, index) => {
        html += `
        <div class="mb-6 p-4 bg-white rounded-xl border border-slate-200">
            <p class="font-bold text-slate-800 mb-3">${index + 1}. ${q.q}</p>
            <div class="space-y-2">
                ${q.options.map((opt, i) => `
                    <label class="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="q${index}" value="${i}" class="accent-emerald-600 w-4 h-4">
                        <span class="text-sm text-slate-600">${opt}</span>
                    </label>
                `).join('')}
            </div>
        </div>`;
    });

    html += `<button onclick="submitQuiz()" class="bg-emerald-600 text-white w-full py-3 rounded-xl font-bold hover:bg-emerald-700 transition">تسليم الإجابات</button>`;
    quizArea.innerHTML = html;
}

window.submitQuiz = function() {
    let score = 0;
    currentQuiz.forEach((q, index) => {
        const selected = document.querySelector(`input[name="q${index}"]:checked`);
        if (selected && parseInt(selected.value) === q.correct) {
            score++;
        }
    });

    // لازم يجاوب كله صح عشان ينجح (أو ممكن تخليها > 50% لو حابب)
    if (score === currentQuiz.length) { 
        alert(`مبروك! جاوبت ${score}/${currentQuiz.length} صح. 🎉`);
        finishCourse();
    } else {
        alert(`جبت ${score}/${currentQuiz.length}. لازم تجاوب كل الأسئلة صح عشان تاخد الشهادة! حاول تاني 💪`);
        // بنعيد تحميل الامتحان عشان يحاول تاني
        initQuiz(); 
    }
}

function finishCourse() {
    const user = firebase.auth().currentUser;
    firebase.database().ref(`users/${user.uid}/enrolledCourses/${currentCourse.id}`).update({
        status: 'completed',
        completedAt: new Date().toISOString()
    }).then(() => {
        window.location.href = 'dashboard.html';
    });
}

window.switchTab = function(tabName) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
    document.querySelectorAll('.tab-btn').forEach(el => {
        el.classList.remove('active', 'border-b-2', 'border-emerald-600', 'text-emerald-600');
        el.classList.add('text-slate-500');
    });
    
    document.getElementById(`tab-${tabName}`).classList.remove('hidden');
    event.target.classList.add('active', 'border-b-2', 'border-emerald-600', 'text-emerald-600');
    event.target.classList.remove('text-slate-500');
}