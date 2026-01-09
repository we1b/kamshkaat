/* Path: js/dashboard.js */

// --- المتغيرات العامة ---
let currentUserData = null;
let currentFirebaseUser = null;
let selectedRamadanDay = 1;

// حالة التحدي (الافتراضية)
let prayers = [
    { id: 'fajr', name: 'الفجر', checked: false, time: '04:50 ص' },
    { id: 'dhuhr', name: 'الظهر', checked: false, time: '12:05 م' },
    { id: 'asr', name: 'العصر', checked: false, time: '03:15 م' },
    { id: 'maghrib', name: 'المغرب', checked: false, time: '05:45 م' },
    { id: 'isha', name: 'العشاء', checked: false, time: '07:15 م' }
];
let quranWird = { checked: false };
let flexibleHabits = [
    { id: 'sunan_rawatib', name: 'السنن الرواتب', icon: 'layers', active: true, checked: false },
    { id: 'duha', name: 'صلاة الضحى', icon: 'sun', active: true, checked: false },
    { id: 'witr', name: 'الوتر', icon: 'moon', active: false, checked: false },
    { id: 'morning_adhkar', name: 'أذكار الصباح', icon: 'sunrise', active: true, checked: false },
    { id: 'evening_adhkar', name: 'أذكار المساء', icon: 'sunset', active: true, checked: false },
    { id: 'tarawih', name: 'التراويح', icon: 'star', active: true, checked: false }
];

document.addEventListener('DOMContentLoaded', () => {
    if (typeof lucide !== 'undefined') lucide.createIcons();

    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            currentFirebaseUser = user;
            fetchUserData(user);
            initRamadanDays(); // توليد أيام الشهر
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
        if (sectionId === 'ramadan') loadRamadanDayData(selectedRamadanDay); // تحميل بيانات اليوم
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
        <div class="bg-white p-4 rounded-2xl border border-slate-100 flex flex-col md:flex-row gap-6 shadow-sm">
            <div class="w-full md:w-32 h-20 rounded-xl overflow-hidden relative shrink-0">
                <img src="${c.img}" class="w-full h-full object-cover">
            </div>
            <div class="flex-1 flex flex-col justify-center">
                <h3 class="font-bold text-slate-800">${c.title}</h3>
                <div class="w-full bg-slate-100 rounded-full h-2 my-2"><div class="bg-emerald-500 h-2 rounded-full" style="width: ${progress}%"></div></div>
                <a href="watch.html?id=${c.id}" class="text-xs font-bold text-emerald-600 hover:underline">استكمال المشاهدة</a>
            </div>
        </div>`;
    }).join('');
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

// --- 🌙 منطق تحدي رمضان 🌙 ---

function initRamadanDays() {
    const container = document.getElementById('ramadan-days-scroller');
    if (!container) return;
    container.innerHTML = '';
    
    for (let i = 1; i <= 30; i++) {
        const btn = document.createElement('button');
        btn.className = `shrink-0 w-10 h-10 rounded-full font-bold text-sm border flex items-center justify-center transition 
            ${i === selectedRamadanDay ? 'bg-[#047857] text-white border-[#047857]' : 'bg-white text-gray-500 border-gray-200'}`;
        btn.innerText = i;
        btn.onclick = () => { selectedRamadanDay = i; initRamadanDays(); loadRamadanDayData(i); };
        container.appendChild(btn);
    }
    document.getElementById('current-ramadan-date').innerText = `(رمضان ${selectedRamadanDay})`;
}

// تحميل بيانات اليوم من فايربيس
function loadRamadanDayData(day) {
    if (!currentFirebaseUser) return;
    const db = firebase.database();
    
    // 1. جلب إعدادات العادات (Active Habits)
    db.ref(`users/${currentFirebaseUser.uid}/ramadanSettings`).once('value', (snapSettings) => {
        const settings = snapSettings.val();
        if (settings) {
            flexibleHabits.forEach(h => {
                if (settings[h.id] !== undefined) h.active = settings[h.id];
            });
        }

        // 2. جلب إنجازات اليوم (Checked Items)
        db.ref(`users/${currentFirebaseUser.uid}/ramadanData/day${day}`).once('value', (snapData) => {
            const data = snapData.val() || {};
            
            // تحديث الحالة المحلية
            prayers.forEach(p => p.checked = !!data[p.id]);
            quranWird.checked = !!data.quran;
            flexibleHabits.forEach(h => h.checked = !!data[h.id]);
            
            // رسم الواجهة
            renderRamadanUI();
        });
    });
}

function renderRamadanUI() {
    // 1. الصلوات
    const prayersCont = document.getElementById('prayers-container');
    prayersCont.innerHTML = prayers.map((p, idx) => `
        <div class="stat-card p-4 flex items-center justify-between cursor-pointer ${p.checked ? 'bg-green-50 border-green-200' : ''}" onclick="togglePrayer(${idx})">
            <div class="flex items-center gap-3">
                <div class="custom-checkbox ${p.checked ? 'bg-[#047857] border-[#047857]' : ''}">${p.checked ? '✔' : ''}</div>
                <div><h4 class="font-bold text-gray-800">${p.name}</h4><span class="text-xs text-gray-400">${p.time}</span></div>
            </div>
        </div>
    `).join('');

    // 2. القرآن
    const quranCircle = document.getElementById('quran-check-circle');
    const quranStatus = document.getElementById('quran-status-text');
    const quranAction = document.getElementById('quran-action-text');
    if (quranWird.checked) {
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

    // 3. النوافل
    const habitsCont = document.getElementById('flexible-habits-container');
    const activeHabits = flexibleHabits.filter(h => h.active);
    
    if (activeHabits.length === 0) {
        document.getElementById('empty-habits-msg').classList.remove('hidden');
        habitsCont.innerHTML = '';
    } else {
        document.getElementById('empty-habits-msg').classList.add('hidden');
        habitsCont.innerHTML = activeHabits.map(h => {
            // نجد الاندكس الاصلي
            const originalIdx = flexibleHabits.findIndex(x => x.id === h.id);
            return `
            <div class="stat-card p-4 flex items-center gap-3 cursor-pointer ${h.checked ? 'bg-yellow-50 border-yellow-200' : ''}" onclick="toggleHabit(${originalIdx})">
                <div class="custom-checkbox ${h.checked ? 'bg-[#047857] border-[#047857]' : ''}">${h.checked ? '✔' : ''}</div>
                <div><h4 class="font-bold text-gray-800">${h.name}</h4><span class="text-xs text-gray-400">سُنة</span></div>
            </div>`;
        }).join('');
    }

    // 4. النسبة
    calculateProgress();
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

// --- دوال التفاعل والحفظ الفوري ---
window.togglePrayer = function(index) {
    prayers[index].checked = !prayers[index].checked;
    saveToFirebase(prayers[index].id, prayers[index].checked);
    renderRamadanUI();
}

window.toggleHabit = function(index) {
    flexibleHabits[index].checked = !flexibleHabits[index].checked;
    saveToFirebase(flexibleHabits[index].id, flexibleHabits[index].checked);
    renderRamadanUI();
}

window.toggleQuran = function() {
    quranWird.checked = !quranWird.checked;
    saveToFirebase('quran', quranWird.checked);
    renderRamadanUI();
}

function saveToFirebase(key, value) {
    if (!currentFirebaseUser) return;
    const db = firebase.database();
    db.ref(`users/${currentFirebaseUser.uid}/ramadanData/day${selectedRamadanDay}/${key}`).set(value);
}

// --- إعدادات النوافل (تفعيل/تعطيل العادة نفسها) ---
window.toggleSettingsModal = function() {
    const modal = document.getElementById('settings-modal');
    modal.classList.toggle('hidden');
    if (!modal.classList.contains('hidden')) {
        renderSettingsList();
    }
}

function renderSettingsList() {
    const list = document.getElementById('settings-list');
    list.innerHTML = flexibleHabits.map((h, idx) => `
        <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg mb-2">
            <div class="flex items-center gap-3">
                <i data-lucide="${h.icon}" class="w-5 h-5 text-gray-500"></i>
                <span class="font-semibold text-gray-700">${h.name}</span>
            </div>
            <label class="toggle-switch">
                <input type="checkbox" ${h.active ? 'checked' : ''} onchange="updateHabitSettings(${idx}, this.checked)">
                <span class="slider"></span>
            </label>
        </div>
    `).join('');
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

window.updateHabitSettings = function(index, isActive) {
    flexibleHabits[index].active = isActive;
    // حفظ الإعدادات في فايربيس
    if (currentFirebaseUser) {
        firebase.database().ref(`users/${currentFirebaseUser.uid}/ramadanSettings/${flexibleHabits[index].id}`).set(isActive);
    }
    // تحديث الواجهة الخلفية (لو قفلنا النافذة)
    renderRamadanUI();
}

function calculateProgress() {
    const activeFlexible = flexibleHabits.filter(h => h.active);
    const totalTasks = prayers.length + 1 + activeFlexible.length;
    
    const completedPrayers = prayers.filter(p => p.checked).length;
    const completedQuran = quranWird.checked ? 1 : 0;
    const completedFlexible = activeFlexible.filter(h => h.checked).length;
    
    const totalCompleted = completedPrayers + completedQuran + completedFlexible;
    const percent = Math.round((totalCompleted / totalTasks) * 100);

    document.getElementById('progress-bar').style.width = `${percent}%`;
    document.getElementById('progress-percent').innerText = `${percent}%`;
    
    const textEl = document.getElementById('progress-text');
    if (percent === 100) textEl.innerText = "ما شاء الله! يومك كامل 🌟";
    else textEl.innerText = `فاضلك ${totalTasks - totalCompleted} خطوات 💪`;
}