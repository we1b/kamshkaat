/* Path: js/auth.js */

// 1. إعدادات Firebase (نفس اللي في script.js عشان نضمن إنها شغالة هنا لوحدها)
const firebaseConfig = {
    apiKey: "AIzaSyCTRm9XNvVgmP-h_7qHZyQy-dEAqnTIrY4",
    authDomain: "kameshkah-8c9ed.firebaseapp.com",
    projectId: "kameshkah-8c9ed",
    storageBucket: "kameshkah-8c9ed.firebasestorage.app",
    messagingSenderId: "221923589082",
    appId: "1:221923589082:web:098b2152a227e93acbdee3",
    measurementId: "G-199GK5EH3K",
    databaseURL: "https://kameshkah-8c9ed-default-rtdb.firebaseio.com"
};

// تهيئة التطبيق لو مش شغال
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const db = firebase.database(); // عشان نحفظ بيانات اليوزر

// --- دالة: حفظ بيانات المستخدم في قاعدة البيانات ---
function saveUserData(user, additionalData = {}) {
    const userRef = db.ref('users/' + user.uid);
    userRef.update({
        username: user.displayName || additionalData.name || "مستخدم جديد",
        email: user.email,
        photoURL: user.photoURL || "images/users/avatar-placeholder.png",
        lastLogin: new Date().toISOString(),
        ...additionalData
    }).then(() => {
        console.log("User data saved successfully!");
    }).catch((error) => {
        console.error("Error saving user data: ", error);
    });
}

// --- 1. تسجيل الدخول بجوجل (Google) ---
function loginWithGoogle() {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider)
        .then((result) => {
            const user = result.user;
            // حفظ البيانات فوراً
            saveUserData(user);
            
            alert(`منور يا ${user.displayName.split(' ')[0]}! 🌹`);
            window.location.href = 'dashboard.html';
        }).catch((error) => {
            console.error(error);
            alert("حصلت مشكلة في التسجيل بجوجل: " + error.message);
        });
}

// --- 2. إنشاء حساب جديد (Email & Password) ---
function registerWithEmail(name, email, password) {
    auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            
            // تحديث اسم المستخدم في البروفايل
            user.updateProfile({
                displayName: name,
                photoURL: "images/users/avatar-placeholder.png"
            }).then(() => {
                // وحفظ البيانات في الداتابيز
                saveUserData(user, { name: name });
                
                alert("مبروك! تم إنشاء الحساب بنجاح 🎉");
                window.location.href = 'dashboard.html';
            });
        })
        .catch((error) => {
            let msg = "حصل خطأ ما!";
            if(error.code === 'auth/email-already-in-use') msg = "الإيميل ده مستخدم قبل كده يا بطل 😉";
            if(error.code === 'auth/weak-password') msg = "كلمة السر ضعيفة شوية، كبرها!";
            alert(msg);
            console.error(error);
        });
}

// --- 3. تسجيل الدخول (Email & Password) ---
function loginWithEmail(email, password) {
    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            // تحديث وقت الدخول
            saveUserData(user);
            
            alert("تم تسجيل الدخول بنجاح! 🚀");
            window.location.href = 'dashboard.html';
        })
        .catch((error) => {
            let msg = "في حاجة غلط!";
            if(error.code === 'auth/user-not-found') msg = "مفيش حساب بالإيميل ده، جرب تعمل حساب جديد.";
            if(error.code === 'auth/wrong-password') msg = "كلمة السر غلط، ركز يا درش! 🤔";
            alert(msg);
            console.error(error);
        });
}

// --- 4. استعادة كلمة المرور ---
function resetPassword(email) {
    auth.sendPasswordResetEmail(email)
        .then(() => {
            alert("تم إرسال رابط تغيير الباسورد على إيميلك.. شيك عليه 📧");
            window.location.href = 'login.html';
        })
        .catch((error) => {
            alert("تأكد إن الإيميل مكتوب صح.");
        });
}

// --- 5. مراقب حالة المستخدم (لإظهار زرار حسابي/دخول) ---
auth.onAuthStateChanged((user) => {
    const authArea = document.getElementById('auth-area');
    if (authArea) {
        if (user) {
            authArea.innerHTML = `
                <a href="dashboard.html" class="flex items-center gap-2 bg-emerald-100 text-emerald-800 px-4 py-2 rounded-xl font-bold hover:bg-emerald-200 transition">
                    <img src="${user.photoURL || 'images/users/avatar-placeholder.png'}" class="w-6 h-6 rounded-full border border-emerald-500">
                    <span class="hidden md:inline">حسابي</span>
                </a>`;
        } else {
            authArea.innerHTML = `
                <a href="login.html" class="bg-emerald-600 text-white px-5 py-2 rounded-xl font-bold hover:bg-emerald-700 transition shadow-lg shadow-emerald-200 text-sm">دخول</a>`;
        }
    }
});