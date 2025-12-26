/* Path: js/watch.js */

let currentCourse = null;
let completedLessons = [];
let currentLessonId = null;

document.addEventListener('DOMContentLoaded', () => {
    if (typeof lucide !== 'undefined') lucide.createIcons();
    
    const params = new URLSearchParams(window.location.search);
    const courseId = params.get('id');

    // التحقق من المستخدم
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
            // لو مش مشترك، يروح يشترك
            window.location.href = `course-details.html?id=${courseId}&type=academy`;
        } else {
            const enrollmentData = snapshot.val();
            // التأكد من تحميل البيانات
            if (typeof window.kameshkahData === 'undefined') {
                console.error('Kameshkah data not loaded');
                return;
            }
            
            const staticData = window.kameshkahData.find(c => c.id == courseId);
            if(staticData) {
                currentCourse = { ...staticData, ...enrollmentData };
                completedLessons = enrollmentData.completedLessons || []; 
                initPlayerUI();
            } else {
                alert('عذراً، بيانات الكورس غير متوفرة حالياً.');
                window.location.href = 'courses.html';
            }
        }
    });
}

function initPlayerUI() {
    // تحديث عناوين الصفحة
    document.title = `${currentCourse.titleAr} | مشاهدة`;
    document.getElementById('course-title-nav').innerText = currentCourse.titleAr;
    document.getElementById('lessons-count').innerText = `${currentCourse.lessons.length} درس`;
    
    // تحديث رابط زر الاختبار (الاختياري)
    const quizBtnNav = document.getElementById('quiz-btn-nav');
    if (quizBtnNav) {
        quizBtnNav.href = `quiz.html?courseId=${currentCourse.id}`;
        quizBtnNav.classList.remove('hidden');
    }

    renderPlaylist();
    renderAttachments();
    updateProgress();
    
    // تشغيل أول درس تلقائياً لو مفيش درس شغال
    if (currentCourse.lessons.length > 0 && !currentLessonId) {
        playLesson(0);
    }
}

function renderPlaylist() {
    const list = document.getElementById('playlist');
    let html = currentCourse.lessons.map((lesson, index) => {
        const isCompleted = completedLessons.includes(lesson.id);
        const isActive = currentLessonId === lesson.id;
        
        let iconName = 'play-circle';
        if (lesson.type === 'text') iconName = 'book-open';
        if (lesson.type === 'audio') iconName = 'headphones';
        
        // تلوين الدرس النشط
        const activeClass = isActive 
            ? 'bg-emerald-50 border-emerald-500 ring-1 ring-emerald-500/20' 
            : 'bg-white border-transparent hover:bg-slate-50';
        
        const completedClass = isCompleted 
            ? 'text-emerald-600 bg-emerald-100' 
            : 'text-slate-400 bg-slate-100';

        return `
        <button onclick="playLesson(${index})" class="w-full text-right p-3 rounded-xl flex items-center gap-3 transition border-r-4 shadow-sm mb-2 group ${activeClass}">
            <div class="w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${completedClass} transition-colors">
                ${isCompleted ? '<i data-lucide="check" class="w-4 h-4"></i>' : `<span class="font-bold text-xs">${index + 1}</span>`}
            </div>
            <div class="flex-1 min-w-0"> <!-- min-w-0 مهم لـ truncate -->
                <h4 class="font-bold text-sm text-slate-800 group-hover:text-emerald-700 truncate">${lesson.title}</h4>
                <span class="text-xs text-slate-400 font-medium">${lesson.duration || ''}</span>
            </div>
            <i data-lucide="${iconName}" class="w-4 h-4 text-slate-300 group-hover:text-emerald-500 transition-colors"></i>
        </button>`;
    }).join('');

    // زرار الاختبار في القائمة (اختياري أيضاً)
    html += `
        <div class="mt-6 pt-4 border-t border-slate-200">
            <a href="quiz.html?courseId=${currentCourse.id}" class="block w-full bg-gradient-to-r from-amber-400 to-amber-500 text-white p-4 rounded-xl flex items-center justify-between gap-3 shadow-md hover:shadow-lg transition transform hover:-translate-y-1 group cursor-pointer decoration-0">
                <div class="flex items-center gap-3">
                    <div class="bg-white/20 p-2 rounded-lg"><i data-lucide="award" class="w-6 h-6 text-white"></i></div>
                    <div class="text-right">
                        <h4 class="font-black text-base">الاختبار النهائي</h4>
                        <span class="text-xs text-amber-50 opacity-90">جاهز للتحدي؟</span>
                    </div>
                </div>
                <i data-lucide="chevron-left" class="w-5 h-5 text-white"></i>
            </a>
        </div>`;

    list.innerHTML = html;
    if (typeof lucide !== 'undefined') lucide.createIcons();
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
    
    // إخفاء الكل
    videoContainer.classList.add('hidden');
    audioContainer.classList.add('hidden');
    textViewer.classList.add('hidden');
    
    // إيقاف المشغلات السابقة
    videoPlayer.src = "";
    audioPlayer.pause();

    if (lesson.type === 'text') {
        textViewer.classList.remove('hidden');
        document.getElementById('text-lesson-title').innerText = lesson.title;
        
        // معالجة المحتوى النصي للتأكد من التنسيق
        let content = lesson.content;
        // إضافة كلاسات لتحسين القراءة لو مش موجودة
        if (!content.includes('class="')) {
           content = `<div class="prose prose-lg max-w-none text-slate-700 leading-loose">${content}</div>`;
        }
        document.getElementById('text-lesson-content').innerHTML = content;
        
        if(lesson.duration) document.getElementById('text-lesson-duration').innerText = lesson.duration;

        // سكرول لأول الصفحة (المحتوى الرئيسي)
        document.getElementById('main-content-area').scrollTop = 0;
        
        // تسجيل القراءة
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

window.finishCurrentLesson = function() {
    if(currentLessonId) {
        markLessonComplete(currentLessonId);
        const currentIndex = currentCourse.lessons.findIndex(l => l.id == currentLessonId);
        if (currentIndex < currentCourse.lessons.length - 1) {
            playLesson(currentIndex + 1);
        } else {
            alert("ألف مبروك! خلصت كل الدروس 🎉\nتقدر دلوقتي تدخل الاختبار من القائمة لو حابب.");
            // تسجيل إنهاء الكورس (اختياري هنا، ممكن يتم بعد الامتحان)
             finishCourse();
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
            </li>`).join('');
    } else {
        list.innerHTML = '<li class="text-slate-400 text-sm text-center">لا توجد ملحقات</li>';
    }
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function finishCourse() {
    const user = firebase.auth().currentUser;
    firebase.database().ref(`users/${user.uid}/enrolledCourses/${currentCourse.id}`).update({
        status: 'completed',
        completedAt: new Date().toISOString()
    });
}