/* Path: js/dashboard.js */

document.addEventListener('DOMContentLoaded', () => {
    // 1. تشغيل الأيقونات فوراً
    if (typeof lucide !== 'undefined') lucide.createIcons();

    // 2. التحقق من حالة المستخدم
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            fetchUserData(user);
            initRamadanTracker(user); 
        } else {
            window.location.href = 'login.html';
        }
    });

    // 3. تفعيل زرار الحفظ في البروفايل
    const profileForm = document.getElementById('profile-form');
    if (profileForm) {
        profileForm.addEventListener('submit', (e) => {
            e.preventDefault();
            saveProfileChanges();
        });
    }
});

// --- دالة التبديل بين الأقسام ---
window.showSection = function(sectionId) {
    document.querySelectorAll('.content-section').forEach(el => el.classList.add('hidden'));
    const target = document.getElementById('section-' + sectionId);
    if (target) {
        target.classList.remove('hidden');
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }
}

let currentUserData = null;
let currentFirebaseUser = null;
let selectedRamadanDay = 1; 

function fetchUserData(user) {
    currentFirebaseUser = user;
    const db = firebase.database();
    const userRef = db.ref('users/' + user.uid);

    userRef.on('value', (snapshot) => {
        const data = snapshot.val();
        currentUserData = data;
        
        if (data) {
            updateDashboardUI(data, user);
        } else {
            const defaultData = {
                username: user.displayName,
                email: user.email,
                photoURL: user.photoURL,
                phone: "",
                points: 0 
            };
            updateDashboardUI(defaultData, user);
        }
    });
}

function updateDashboardUI(data, user) {
    const nameEl = document.getElementById('user-name-display');
    const emailEl = document.getElementById('user-email-display');
    const avatarEl = document.getElementById('user-avatar');
    
    if(nameEl) nameEl.innerText = data.username || user.displayName || "مستخدم كمشكاة";
    if(emailEl) emailEl.innerText = data.email || user.email;
    if(avatarEl) avatarEl.src = data.photoURL || user.photoURL || "images/ui/logo.png";
    
    const pointsEl = document.getElementById('user-points');
    if(pointsEl) pointsEl.innerText = data.points || 0;

    const editNameInput = document.getElementById('edit-name');
    const editPhoneInput = document.getElementById('edit-phone');
    if(editNameInput) editNameInput.value = data.username || user.displayName || "";
    if(editPhoneInput) editPhoneInput.value = data.phone || "";

    // تحميل الكورسات الحقيقية فقط
    loadEnrolledCourses(data.enrolledCourses);
}

// [تعديل] دالة لحذف كورس (إلغاء الاشتراك)
window.unsubscribeCourse = function(courseId) {
    if (!currentFirebaseUser) return;
    
    if (confirm("هل أنت متأكد أنك تريد إلغاء الاشتراك في هذا الكورس؟ 😢")) {
        const db = firebase.database();
        db.ref('users/' + currentFirebaseUser.uid + '/enrolledCourses/' + courseId).remove()
        .then(() => {
            alert("تم حذف الكورس من لوحة التحكم بنجاح.");
            // التحديث هيحصل تلقائي لأننا مستخدمين .on('value')
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

    // [تعديل] تفريغ القائمة القديمة لإزالة أي كورسات وهمية
    list.innerHTML = '';

    let myCourses = [];
    if (enrolledCoursesData) {
        myCourses = Object.values(enrolledCoursesData);
    }

    // لو مفيش كورسات
    if (myCourses.length === 0) {
        list.innerHTML = `
            <div class="text-center py-12 border-2 border-dashed border-emerald-100 rounded-3xl bg-white/40">
                <div class="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm animate-bounce">
                    <i data-lucide="book-open" class="text-emerald-500 w-8 h-8"></i>
                </div>
                <p class="text-slate-500 font-bold mb-2">لسه مفيش كورسات يا بطل!</p>
                <p class="text-slate-400 text-sm mb-6">ابدأ رحلتك دلوقتي واختار كورس.</p>
                <a href="courses.html" class="inline-block bg-emerald-600 text-white px-6 py-2 rounded-xl font-bold text-sm hover:bg-emerald-700 transition shadow-lg">تصفح الكورسات</a>
            </div>
        `;
        if (typeof lucide !== 'undefined') lucide.createIcons();
        return;
    }

    // [تعديل] عرض الكورسات الحقيقية مع زر الحذف
    list.innerHTML = myCourses.map(c => {
        const isCompleted = c.status === 'completed';
        const progress = isCompleted ? 100 : (c.progress || 0);
        
        let actionButtons = '';
        if (isCompleted) {
            actionButtons = `
                <button onclick="generateCertificate('${c.title}')" class="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg font-bold text-sm transition flex items-center gap-2 shadow-md">
                    <i data-lucide="award" class="w-4 h-4"></i> الشهادة
                </button>
            `;
        } else {
            actionButtons = `
                <a href="watch.html?id=${c.id}" class="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-bold text-sm transition flex items-center gap-2 shadow-md">
                    <i data-lucide="play" class="w-4 h-4"></i> استكمال
                </a>
            `;
        }

        return `
        <div class="bg-white p-4 rounded-2xl border border-slate-100 flex flex-col md:flex-row gap-6 hover:shadow-md transition group relative">
             <!-- [تعديل] زر حذف الكورس -->
            <button onclick="unsubscribeCourse('${c.id}')" class="absolute top-2 left-2 text-red-400 hover:text-red-600 hover:bg-red-50 p-1 rounded-full transition opacity-0 group-hover:opacity-100" title="إلغاء الاشتراك">
                <i data-lucide="trash-2" class="w-4 h-4"></i>
            </button>

            <div class="w-full md:w-48 h-32 rounded-xl overflow-hidden relative shrink-0">
                <img src="${c.img}" class="w-full h-full object-cover group-hover:scale-105 transition duration-500" onerror="this.src='https://placehold.co/300x200/e2e8f0/64748b?text=Course'">
                ${isCompleted ? '<div class="absolute inset-0 bg-black/50 flex items-center justify-center"><i data-lucide="check" class="text-white w-10 h-10"></i></div>' : ''}
            </div>

            <div class="flex-1 flex flex-col justify-center">
                <div class="flex justify-between items-start mb-2">
                    <h3 class="font-bold text-lg text-slate-800">${c.title}</h3>
                    <span class="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-1 rounded-lg">${progress}%</span>
                </div>
                
                <div class="w-full bg-slate-100 rounded-full h-2.5 mb-4 overflow-hidden mt-2">
                    <div class="bg-emerald-500 h-2.5 rounded-full transition-all duration-1000 ease-out" style="width: ${progress}%"></div>
                </div>

                <div class="self-end flex gap-2">
                    ${actionButtons}
                </div>
            </div>
        </div>
    `}).join('');
    
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function saveProfileChanges() {
    if (!currentFirebaseUser) return;
    const newName = document.getElementById('edit-name').value;
    const newPhone = document.getElementById('edit-phone').value;
    const btn = document.querySelector('#profile-form button');
    const originalBtnText = btn.innerText;
    btn.innerText = "جاري الحفظ...";
    btn.disabled = true;

    const db = firebase.database();
    const userRef = db.ref('users/' + currentFirebaseUser.uid);
    userRef.update({ username: newName, phone: newPhone }).then(() => {
        alert("تم تحديث بياناتك بنجاح! 🎉");
        currentFirebaseUser.updateProfile({ displayName: newName });
    }).catch((error) => {
        console.error(error);
        alert("حصلت مشكلة في الحفظ.");
    }).finally(() => {
        btn.innerText = originalBtnText;
        btn.disabled = false;
    });
}

// دالة توليد الشهادة (Canvas)
window.generateCertificate = function(courseName) {
    let defaultName = document.getElementById('user-name-display').innerText;
    let userName = prompt("اكتب الاسم اللي عايزه يظهر في الشهادة:", defaultName);
    if (!userName) return; 

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.src = 'images/ui/certificate-template.jpg'; 
    const btn = event.target.closest('button');
    const originalText = btn.innerHTML;
    btn.innerHTML = 'جاري...';
    btn.disabled = true;

    img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        ctx.font = 'bold 80px "Cairo", sans-serif'; 
        ctx.fillStyle = '#1e293b'; 
        ctx.textAlign = 'center';
        ctx.fillText(userName, canvas.width / 2, canvas.height / 2);

        ctx.font = '50px "Cairo", sans-serif';
        ctx.fillStyle = '#059669'; 
        ctx.fillText(courseName, canvas.width / 2, canvas.height / 2 + 120);

        const link = document.createElement('a');
        link.download = `Certificate-${courseName}.png`;
        link.href = canvas.toDataURL();
        link.click();
        btn.innerHTML = originalText;
        btn.disabled = false;
    };
    img.onerror = () => {
        alert("صورة قالب الشهادة مش موجودة!");
        btn.innerHTML = originalText;
        btn.disabled = false;
    };
}

/* --------------------------------------------------------
   🌙 منطق تحدي رمضان
   -------------------------------------------------------- */
function initRamadanTracker(user) {
    const daysScroller = document.getElementById('ramadan-days-scroller');
    if (!daysScroller) return; 

    daysScroller.innerHTML = '';
    for (let i = 1; i <= 30; i++) {
        const dayBtn = document.createElement('button');
        dayBtn.className = `shrink-0 w-12 h-12 rounded-full font-bold text-sm transition flex items-center justify-center border-2 
            ${i === selectedRamadanDay ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-slate-500 border-slate-200 hover:border-purple-300'}`;
        dayBtn.innerText = i;
        dayBtn.onclick = () => selectRamadanDay(i, user);
        daysScroller.appendChild(dayBtn);
    }
    selectRamadanDay(selectedRamadanDay, user);
}

function selectRamadanDay(day, user) {
    selectedRamadanDay = day;
    const dateEl = document.getElementById('today-date');
    const titleEl = document.getElementById('selected-day-title');
    if(dateEl) dateEl.innerText = `اليوم ${day} رمضان`;
    if(titleEl) titleEl.innerText = `إنجازات اليوم ${day}`;

    // تحديث الأزرار
    const scroller = document.getElementById('ramadan-days-scroller');
    if (scroller) {
        const buttons = scroller.children;
        for (let btn of buttons) {
            if (btn.innerText == day) {
                btn.className = "shrink-0 w-12 h-12 rounded-full font-bold text-sm transition flex items-center justify-center border-2 bg-purple-600 text-white border-purple-600 shadow-md transform scale-110";
            } else {
                btn.className = "shrink-0 w-12 h-12 rounded-full font-bold text-sm transition flex items-center justify-center border-2 bg-white text-slate-500 border-slate-200 hover:border-purple-300";
            }
        }
    }

    const db = firebase.database();
    db.ref(`users/${user.uid}/ramadanChallenge/day${day}`).once('value', (snapshot) => {
        const data = snapshot.val() || {};
        const quranIn = document.getElementById('quran-input');
        const azkarCheck = document.getElementById('azkar-check');
        const tarawihCheck = document.getElementById('tarawih-check');
        const tahajjudCheck = document.getElementById('tahajjud-check');
        const sunanCheck = document.getElementById('sunan-check');

        if(quranIn) quranIn.value = data.quran || '';
        if(azkarCheck) azkarCheck.checked = data.azkar || false;
        if(tarawihCheck) tarawihCheck.checked = data.tarawih || false;
        if(tahajjudCheck) tahajjudCheck.checked = data.tahajjud || false;
        if(sunanCheck) sunanCheck.checked = data.sunan || false;
    });
}

window.saveRamadanDay = function() {
    if (!currentFirebaseUser) return;
    const dayData = {
        quran: document.getElementById('quran-input').value,
        azkar: document.getElementById('azkar-check').checked,
        tarawih: document.getElementById('tarawih-check').checked,
        tahajjud: document.getElementById('tahajjud-check').checked,
        sunan: document.getElementById('sunan-check').checked,
        completed: true 
    };
    const db = firebase.database();
    db.ref(`users/${currentFirebaseUser.uid}/ramadanChallenge/day${selectedRamadanDay}`).set(dayData)
        .then(() => { alert(`تم حفظ إنجاز اليوم ${selectedRamadanDay} يا بطل! 🌙✨`); })
        .catch(err => { console.error(err); alert("حصلت مشكلة في الحفظ"); });
}