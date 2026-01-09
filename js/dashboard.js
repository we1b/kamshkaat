/* Path: js/dashboard.js */

// --- المتغيرات العامة ---
let currentUserData = null;
let currentFirebaseUser = null;
let selectedRamadanDay = 1;

// القوالب الثابتة (للاستخدام في العرض فقط)
const PRAYERS_TEMPLATE = [
    { id: 'fajr', name: 'الفجر', time: '04:50 ص' },
    { id: 'dhuhr', name: 'الظهر', time: '12:05 م' },
    { id: 'asr', name: 'العصر', time: '03:15 م' },
    { id: 'maghrib', name: 'المغرب', time: '05:45 م' },
    { id: 'isha', name: 'العشاء', time: '07:15 م' }
];

const HABITS_TEMPLATE = [
    { id: 'sunan_rawatib', name: 'السنن الرواتب', icon: 'layers' },
    { id: 'duha', name: 'صلاة الضحى', icon: 'sun' },
    { id: 'witr', name: 'الوتر', icon: 'moon' },
    { id: 'morning_adhkar', name: 'أذكار الصباح', icon: 'sunrise' },
    { id: 'evening_adhkar', name: 'أذكار المساء', icon: 'sunset' },
    { id: 'tarawih', name: 'التراويح', icon: 'star' }
];

// الحالة الحالية (State) - سيتم تحديثها عند تغيير اليوم
let currentDayData = {
    prayers: {}, // { fajr: true, dhuhr: false ... }
    habits: {},  // { sunan: true ... }
    quran: false
};

let userSettings = {}; // الإعدادات العامة (ايه اللي مفعل وايه اللي لا)

document.addEventListener('DOMContentLoaded', () => {
    if (typeof lucide !== 'undefined') lucide.createIcons();

    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            currentFirebaseUser = user;
            fetchUserData(user);
            initRamadanApp(user); // تهيئة التطبيق
        } else {
            window.location.href = 'login.html';
        }
    });

    const profileForm = document.getElementById('profile-form');
    if (profileForm) {
        profileForm.addEventListener('submit', (e) => {
            e.preventDefault();
            saveProfileChanges();
        });
    }
});

// --- التبديل بين الأقسام ---
window.showSection = function(sectionId) {
    document.querySelectorAll('.content-section').forEach(el => el.classList.add('hidden'));
    const target = document.getElementById('section-' + sectionId);
    if (target) {
        target.classList.remove('hidden');
        if (sectionId === 'ramadan') {
            // عند فتح قسم رمضان، نتأكد من تحميل بيانات اليوم الحالي
            loadRamadanDayData(selectedRamadanDay);
        }
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }
}

// --- جلب بيانات المستخدم والكورسات ---
function fetchUserData(user) {
    const db = firebase.database();
    db.ref('users/' + user.uid).on('value', (snapshot) => {
        const data = snapshot.val();
        currentUserData = data;
        if (data) {
            updateDashboardUI(data, user);
        }
    });
}

function updateDashboardUI(data, user) {
    document.getElementById('user-name-display').innerText = data.username || user.displayName || "مستخدم كمشكاة";
    document.getElementById('user-email-display').innerText = data.email || user.email;
    document.getElementById('user-avatar').src = data.photoURL || user.photoURL || "images/ui/logo.png";
    
    // تحميل الكورسات
    loadEnrolledCourses(data.enrolledCourses);
}

// دالة لحذف كورس (إلغاء الاشتراك)
window.unsubscribeCourse = function(courseId) {
    if (!currentFirebaseUser) return;
    
    if (confirm("هل أنت متأكد أنك تريد إلغاء الاشتراك في هذا الكورس؟ 😢")) {
        const db = firebase.database();
        db.ref('users/' + currentFirebaseUser.uid + '/enrolledCourses/' + courseId).remove()
        .then(() => {
            alert("تم حذف الكورس من لوحة التحكم بنجاح.");
            // التحديث هيحصل تلقائي لأننا مستخدمين .on('value') في fetchUserData
        })
        .catch((error) => {
            console.error("Error removing course: ", error);
            alert("حدث خطأ أثناء حذف الكورس.");
        });
    }
}

function loadEnrolledCourses(enrolledCoursesData) {
    const list = document.getElementById('my-courses-list');
    if(!list) return;
    list.innerHTML = '';

    let myCourses = enrolledCoursesData ? Object.values(enrolledCoursesData) : [];

    if (myCourses.length === 0) {
        list.innerHTML = `<div class="text-center py-10 text-slate-500">لسه مفيش كورسات.. اشترك في كورس وابدأ!</div>`;
        return;
    }

    list.innerHTML = myCourses.map(c => {
        const isCompleted = c.status === 'completed';
        const progress = isCompleted ? 100 : (c.progress || 0);
        return `
        <div class="bg-white p-4 rounded-2xl border border-slate-100 flex flex-col md:flex-row gap-6 shadow-sm relative group">
            <!-- زر حذف الكورس -->
            <button onclick="unsubscribeCourse('${c.id}')" class="absolute top-2 left-2 text-red-400 hover:text-red-600 hover:bg-red-50 p-1 rounded-full transition opacity-0 group-hover:opacity-100" title="إلغاء الاشتراك">
                <i data-lucide="trash-2" class="w-4 h-4"></i>
            </button>

            <div class="w-full md:w-32 h-20 rounded-xl overflow-hidden relative shrink-0">
                <img src="${c.img}" class="w-full h-full object-cover">
            </div>
            <div class="flex-1 flex flex-col justify-center">
                <h3 class="font-bold text-slate-800">${c.title}</h3>
                <div class="w-full bg-slate-100 rounded-full h-2 my-2"><div class="bg-emerald-500 h-2 rounded-full" style="width: ${progress}%"></div></div>
                <div class="flex justify-between items-center">
                    <a href="watch.html?id=${c.id}" class="text-xs font-bold text-emerald-600 hover:underline">استكمال المشاهدة</a>
                    <span class="text-xs text-slate-400">${progress}% مكتمل</span>
                </div>
            </div>
        </div>`;
    }).join('');
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

// --- 🌙 منطق تحدي رمضان المحدث 🌙 ---

function initRamadanApp(user) {
    initRamadanDays();
    // تحميل الإعدادات العامة مرة واحدة (ايه النوافل المفعلة)
    const db = firebase.database();
    db.ref(`users/${user.uid}/ramadanSettings`).on('value', (snapshot) => {
        userSettings = snapshot.val() || {};
        // لو الإعدادات فاضية، نفعل كله افتراضياً
        if (Object.keys(userSettings).length === 0) {
            HABITS_TEMPLATE.forEach(h => userSettings[h.id] = true);
        }
        // بعد تحميل الإعدادات، نحمل بيانات اليوم
        loadRamadanDayData(selectedRamadanDay);
    });
}

function initRamadanDays() {
    const container = document.getElementById('ramadan-days-scroller');
    if (!container) return;
    container.innerHTML = '';
    
    // تحديد اليوم الحالي (مثال: لو احنا في رمضان نجيب التاريخ، حالياً هنفترض 1)
    // const today = new Date().getDate(); // للتطوير لاحقاً
    
    for (let i = 1; i <= 30; i++) {
        const btn = document.createElement('button');
        btn.className = `shrink-0 w-10 h-10 rounded-full font-bold text-sm border flex items-center justify-center transition day-btn 
            ${i === selectedRamadanDay ? 'bg-[#047857] text-white border-[#047857]' : 'bg-white text-gray-500 border-gray-200'}`;
        btn.innerText = i;
        btn.dataset.day = i;
        btn.onclick = () => { changeDay(i); };
        container.appendChild(btn);
    }
    document.getElementById('current-ramadan-date').innerText = `(رمضان ${selectedRamadanDay})`;
}

function changeDay(day) {
    selectedRamadanDay = day;
    
    // تحديث شكل الأزرار
    document.querySelectorAll('.day-btn').forEach(btn => {
        if(parseInt(btn.innerText) === day) {
            btn.className = "shrink-0 w-10 h-10 rounded-full font-bold text-sm border flex items-center justify-center transition day-btn bg-[#047857] text-white border-[#047857] transform scale-110 shadow-md";
        } else {
            btn.className = "shrink-0 w-10 h-10 rounded-full font-bold text-sm border flex items-center justify-center transition day-btn bg-white text-gray-500 border-gray-200 hover:border-purple-300";
        }
    });

    document.getElementById('current-ramadan-date').innerText = `(رمضان ${day})`;
    
    // تحميل بيانات اليوم الجديد من الداتابيز
    loadRamadanDayData(day);
}

// تحميل بيانات اليوم المحدد
function loadRamadanDayData(day) {
    if (!currentFirebaseUser) return;
    const db = firebase.database();
    
    db.ref(`users/${currentFirebaseUser.uid}/ramadanData/day${day}`).once('value', (snapshot) => {
        const data = snapshot.val() || {};
        
        // تحديث الحالة المحلية بالبيانات اللي جاية من السيرفر
        currentDayData = {
            prayers: data.prayers || {},
            habits: data.habits || {},
            quran: !!data.quran
        };

        // إعادة رسم الواجهة
        renderRamadanUI();
        
        // التحقق من التقرير الأسبوعي (لو اليوم 7، 14، 21، 28)
        if (day % 7 === 0) {
            checkWeeklyReport(day);
        }
    });
}

function renderRamadanUI() {
    // 1. الصلوات
    const prayersCont = document.getElementById('prayers-container');
    prayersCont.innerHTML = PRAYERS_TEMPLATE.map((p) => {
        const isChecked = !!currentDayData.prayers[p.id];
        return `
        <div class="stat-card p-4 flex items-center justify-between cursor-pointer ${isChecked ? 'bg-green-50 border-green-200' : ''}" onclick="togglePrayer('${p.id}')">
            <div class="flex items-center gap-3">
                <div class="custom-checkbox ${isChecked ? 'bg-[#047857] border-[#047857]' : ''}">${isChecked ? '✔' : ''}</div>
                <div><h4 class="font-bold text-gray-800">${p.name}</h4><span class="text-xs text-gray-400">${p.time}</span></div>
            </div>
        </div>
    `}).join('');

    // 2. القرآن
    const quranCircle = document.getElementById('quran-check-circle');
    const quranStatus = document.getElementById('quran-status-text');
    const quranAction = document.getElementById('quran-action-text');
    if (currentDayData.quran) {
        quranCircle.innerHTML = '<i data-lucide="check" class="w-5 h-5 text-[#047857]"></i>';
        quranCircle.className = "w-8 h-8 rounded-full bg-white flex items-center justify-center";
        quranStatus.innerText = "زادك الله نوراً ✨";
        quranAction.innerText = "تم الورد";
    } else {
        quranCircle.innerHTML = '';
        quranCircle.className = "w-8 h-8 rounded-full border-2 border-white/50 flex items-center justify-center";
        quranStatus.innerText = "اضغط لتسجيل الورد 📖";
        quranAction.innerText = "لم يتم بعد";
    }

    // 3. النوافل (فقط المفعلة في الإعدادات)
    const habitsCont = document.getElementById('flexible-habits-container');
    const activeHabits = HABITS_TEMPLATE.filter(h => userSettings[h.id] !== false); // الافتراضي مفعل
    
    if (activeHabits.length === 0) {
        document.getElementById('empty-habits-msg').classList.remove('hidden');
        habitsCont.innerHTML = '';
    } else {
        document.getElementById('empty-habits-msg').classList.add('hidden');
        habitsCont.innerHTML = activeHabits.map(h => {
            const isChecked = !!currentDayData.habits[h.id];
            return `
            <div class="stat-card p-4 flex items-center gap-3 cursor-pointer ${isChecked ? 'bg-yellow-50 border-yellow-200' : ''}" onclick="toggleHabit('${h.id}')">
                <div class="custom-checkbox ${isChecked ? 'bg-[#047857] border-[#047857]' : ''}">${isChecked ? '✔' : ''}</div>
                <div><h4 class="font-bold text-gray-800">${h.name}</h4><span class="text-xs text-gray-400">سُنة</span></div>
            </div>`;
        }).join('');
    }

    // 4. النسبة
    calculateProgress();
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

// --- دوال التفاعل والحفظ ---

window.togglePrayer = function(prayerId) {
    // عكس الحالة
    currentDayData.prayers[prayerId] = !currentDayData.prayers[prayerId];
    // حفظ في اليوم المحدد فقط
    saveToFirebase(`prayers/${prayerId}`, currentDayData.prayers[prayerId]);
    renderRamadanUI();
}

window.toggleHabit = function(habitId) {
    currentDayData.habits[habitId] = !currentDayData.habits[habitId];
    saveToFirebase(`habits/${habitId}`, currentDayData.habits[habitId]);
    renderRamadanUI();
}

window.toggleQuran = function() {
    currentDayData.quran = !currentDayData.quran;
    saveToFirebase('quran', currentDayData.quran);
    renderRamadanUI();
}

function saveToFirebase(path, value) {
    if (!currentFirebaseUser) return;
    const db = firebase.database();
    // الحفظ في مسار اليوم المحدد (day1, day2, etc.)
    db.ref(`users/${currentFirebaseUser.uid}/ramadanData/day${selectedRamadanDay}/${path}`).set(value);
    
    // عرض تقرير يومي لو خلص كل حاجة
    checkDailyCompletion();
}

// --- التقارير (يومي وأسبوعي) ---

function calculateProgress() {
    const activeHabitsList = HABITS_TEMPLATE.filter(h => userSettings[h.id] !== false);
    const totalTasks = PRAYERS_TEMPLATE.length + 1 + activeHabitsList.length;
    
    let completedCount = 0;
    // عد الصلوات
    PRAYERS_TEMPLATE.forEach(p => { if(currentDayData.prayers[p.id]) completedCount++; });
    // عد القرآن
    if(currentDayData.quran) completedCount++;
    // عد النوافل
    activeHabitsList.forEach(h => { if(currentDayData.habits[h.id]) completedCount++; });
    
    const percent = Math.round((completedCount / totalTasks) * 100);

    document.getElementById('progress-bar').style.width = `${percent}%`;
    document.getElementById('progress-percent').innerText = `${percent}%`;
    
    const textEl = document.getElementById('progress-text');
    if (percent === 100) {
        textEl.innerText = "ما شاء الله! يومك كامل 🌟";
        textEl.classList.add('text-[#047857]', 'font-bold');
    } else {
        textEl.innerText = `فاضلك ${totalTasks - completedCount} خطوات 💪`;
        textEl.classList.remove('text-[#047857]', 'font-bold');
    }

    return percent; // بنرجع النسبة عشان نستخدمها في التقرير
}

function checkDailyCompletion() {
    const percent = calculateProgress();
    if (percent === 100) {
        // ممكن نطلع رسالة تشجيعية (Toast) هنا
        // alert("أداء عظيم! قفلت اليوم 💯");
    }
}

function checkWeeklyReport(day) {
    // دالة تجيب داتا الـ 7 أيام اللي فاتوا
    const db = firebase.database();
    const startDay = day - 6;
    let totalScore = 0;
    let daysLoaded = 0;

    for(let i = startDay; i <= day; i++) {
        db.ref(`users/${currentFirebaseUser.uid}/ramadanData/day${i}`).once('value', (snap) => {
            const d = snap.val() || {};
            // حسبة بسيطة للإنجاز (ممكن تكون أدق)
            let dailyTasks = 0;
            if(d.prayers) dailyTasks += Object.keys(d.prayers).length; // عدد الصلوات اللي صلاها
            if(d.quran) dailyTasks += 1;
            
            totalScore += dailyTasks;
            daysLoaded++;

            if(daysLoaded === 7) {
                // عرض التقرير
                alert(`📊 تقرير الأسبوع (${startDay}-${day}):\nإجمالي إنجازك: ${totalScore} مهمة عبادية.\nاستمر يا بطل!`);
            }
        });
    }
}

// --- إعدادات النوافل ---
window.toggleSettingsModal = function() {
    const modal = document.getElementById('settings-modal');
    modal.classList.toggle('hidden');
    if (!modal.classList.contains('hidden')) {
        renderSettingsList();
    }
}

function renderSettingsList() {
    const list = document.getElementById('settings-list');
    list.innerHTML = HABITS_TEMPLATE.map((h, idx) => {
        const isActive = userSettings[h.id] !== false;
        return `
        <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg mb-2">
            <div class="flex items-center gap-3">
                <i data-lucide="${h.icon}" class="w-5 h-5 text-gray-500"></i>
                <span class="font-semibold text-gray-700">${h.name}</span>
            </div>
            <label class="toggle-switch">
                <input type="checkbox" ${isActive ? 'checked' : ''} onchange="updateHabitSettings('${h.id}', this.checked)">
                <span class="slider"></span>
            </label>
        </div>
    `}).join('');
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

window.updateHabitSettings = function(habitId, isActive) {
    userSettings[habitId] = isActive;
    if (currentFirebaseUser) {
        firebase.database().ref(`users/${currentFirebaseUser.uid}/ramadanSettings/${habitId}`).set(isActive);
    }
    renderRamadanUI(); // تحديث الواجهة فوراً
}