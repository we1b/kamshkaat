/* Path: js/watch.js */

let currentCourse = null;
let completedLessons = [];
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
    
    // تشغيل أول درس لو مفيش درس شغال حالياً
    if (currentCourse.lessons.length > 0 && !currentLessonId) {
        playLesson(0);
    }
}

function renderPlaylist() {
    const list = document.getElementById('playlist');
    let html = currentCourse.lessons.map((lesson, index) => {
        const isCompleted = completedLessons.includes(lesson.id);
        const isActive = currentLessonId === lesson.id;
        let icon = 'play-circle';
        if (lesson.type === 'text') icon = 'book-open';
        if (lesson.type === 'audio') icon = 'headphones';
        
        // تلوين الدرس النشط
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

    // زرار إظهار باقي المحتوى (يظهر المحتوى المخفي عند الحاجة)
    html += `
        <div class="mt-6 pt-4 border-t border-slate-200 text-center">
             <button id="show-more-content-btn" onclick="showMoreContent()" class="w-full bg-slate-100 text-slate-600 p-3 rounded-xl font-bold hover:bg-slate-200 transition text-sm flex items-center justify-center gap-2">
                <i data-lucide="chevron-down" class="w-4 h-4"></i> إظهار باقي المحتوى
            </button>
        </div>
    `;

    list.innerHTML = html;
    lucide.createIcons();
}

// دالة إظهار المحتوى الإضافي (بسيط جداً - لو فيه محتوى مخفي بيظهره)
function showMoreContent() {
    // هنا ممكن تضيف أي لوجيك لإظهار عناصر مخفية في القائمة لو القائمة طويلة جداً
    // حالياً هو مجرد زرار توضيحي، ممكن نربطه بتحميل المزيد لو عندك دروس كتير
    alert("سيتم عرض باقي المحتوى (لو وجد) أو الانتقال لأسفل القائمة."); 
    // مثال عملي: سكرول لآخر القائمة
    const playlist = document.getElementById('playlist');
    playlist.scrollTop = playlist.scrollHeight;
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
    
    // إخفاء الكل وإيقاف المشغلات
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

// دالة الزرار اللي تحت الدرس النصي (التالي)
window.finishCurrentLesson = function() {
    if(currentLessonId) {
        markLessonComplete(currentLessonId);
        // نقل للدرس التالي مباشرة
        const currentIndex = currentCourse.lessons.findIndex(l => l.id == currentLessonId);
        if (currentIndex < currentCourse.lessons.length - 1) {
            playLesson(currentIndex + 1);
        } else {
            alert("ألف مبروك! خلصت كل دروس الكورس 🎉");
            finishCourse(); // علم الكورس كـ مكتمل
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

function finishCourse() {
    const user = firebase.auth().currentUser;
    firebase.database().ref(`users/${user.uid}/enrolledCourses/${currentCourse.id}`).update({
        status: 'completed',
        completedAt: new Date().toISOString()
    });
}