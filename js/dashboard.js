/* Path: js/dashboard.js */

document.addEventListener('DOMContentLoaded', () => {
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            fetchUserData(user);
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

let currentUserData = null;
let currentFirebaseUser = null;

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
    document.getElementById('user-name-display').innerText = data.username || user.displayName || "مستخدم كمشكاة";
    document.getElementById('user-email-display').innerText = data.email || user.email;
    document.getElementById('user-avatar').src = data.photoURL || user.photoURL || "images/ui/logo.png";
    
    const pointsEl = document.getElementById('user-points');
    if(pointsEl) pointsEl.innerText = data.points || 0;

    const editNameInput = document.getElementById('edit-name');
    const editPhoneInput = document.getElementById('edit-phone');
    if(editNameInput) editNameInput.value = data.username || user.displayName || "";
    if(editPhoneInput) editPhoneInput.value = data.phone || "";

    loadEnrolledCourses(data.enrolledCourses);
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

    userRef.update({
        username: newName,
        phone: newPhone
    }).then(() => {
        alert("تم تحديث بياناتك بنجاح! 🎉");
        currentFirebaseUser.updateProfile({ displayName: newName });
    }).catch((error) => {
        console.error(error);
        alert("حصلت مشكلة في الحفظ، حاول تاني.");
    }).finally(() => {
        btn.innerText = originalBtnText;
        btn.disabled = false;
    });
}

function loadEnrolledCourses(enrolledCoursesData) {
    const list = document.getElementById('my-courses-list');
    if(!list) return;

    let myCourses = [];
    if (enrolledCoursesData) {
        myCourses = Object.values(enrolledCoursesData);
    }

    if (myCourses.length > 0) {
        list.innerHTML = myCourses.map(c => {
            const isCompleted = c.status === 'completed';
            const progress = isCompleted ? 100 : (c.progress || 0);
            
            let actionButtons = '';
            
            if (isCompleted) {
                // زرار الشهادة
                actionButtons = `
                    <button onclick="generateCertificate('${c.title}')" class="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg font-bold text-sm transition flex items-center gap-2 shadow-md">
                        <i data-lucide="award" class="w-4 h-4"></i> تحميل الشهادة
                    </button>
                `;
            } else {
                // زرار استكمال المشاهدة (يودي لصفحة watch.html)
                actionButtons = `
                    <a href="watch.html?id=${c.id}" class="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-bold text-sm transition flex items-center gap-2 shadow-md">
                        <i data-lucide="play" class="w-4 h-4"></i> استكمال
                    </a>
                `;
            }

            return `
            <div class="bg-white p-4 rounded-2xl border border-slate-100 flex flex-col md:flex-row gap-6 hover:shadow-md transition group">
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
        lucide.createIcons();
    } else {
        list.innerHTML = `
            <div class="text-center py-10 border-2 border-dashed border-emerald-100 rounded-3xl bg-white/40">
                <div class="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm animate-bounce">
                    <i data-lucide="book-open" class="text-emerald-500 w-8 h-8"></i>
                </div>
                <p class="text-slate-500 font-bold">لا توجد كورسات مسجلة حالياً</p>
                <a href="courses.html" class="mt-4 inline-block bg-emerald-600 text-white px-6 py-2 rounded-xl font-bold text-sm hover:bg-emerald-700 transition">تصفح الكورسات</a>
            </div>
        `;
    }
}

// دالة توليد الشهادة (Canvas)
window.generateCertificate = function(courseName) {
    // 1. طلب الاسم من المستخدم للتأكد
    let defaultName = document.getElementById('user-name-display').innerText;
    let userName = prompt("اكتب الاسم اللي عايزه يظهر في الشهادة:", defaultName);
    
    if (!userName) return; // لو داس إلغاء

    // إنشاء عنصر Canvas في الذاكرة
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.src = 'images/ui/certificate-template.jpg'; 
    
    const btn = event.target.closest('button');
    const originalText = btn.innerHTML;
    btn.innerHTML = 'جاري الإصدار...';
    btn.disabled = true;

    img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;

        // 1. رسم الخلفية
        ctx.drawImage(img, 0, 0);

        // 2. كتابة الاسم (تنسيق أفضل)
        ctx.font = 'bold 80px "Cairo", sans-serif'; 
        ctx.fillStyle = '#1e293b'; 
        ctx.textAlign = 'center';
        // ظبط مكان الاسم (نص العرض، وشوية تحت النص في الطول)
        ctx.fillText(userName, canvas.width / 2, canvas.height / 2);

        // 3. كتابة اسم الكورس
        ctx.font = '50px "Cairo", sans-serif';
        ctx.fillStyle = '#059669'; 
        ctx.fillText(courseName, canvas.width / 2, canvas.height / 2 + 120);

        // 4. كتابة التاريخ
        ctx.font = '30px "Cairo", sans-serif';
        ctx.fillStyle = '#64748b';
        const date = new Date().toLocaleDateString('ar-EG');
        ctx.fillText(date, canvas.width / 2, canvas.height - 100);

        // 5. التحميل
        const link = document.createElement('a');
        link.download = `Certificate-${courseName}.png`;
        link.href = canvas.toDataURL();
        link.click();

        btn.innerHTML = originalText;
        btn.disabled = false;
    };

    img.onerror = () => {
        alert("صورة قالب الشهادة مش موجودة! (images/ui/certificate-template.jpg)");
        btn.innerHTML = originalText;
        btn.disabled = false;
    };
}