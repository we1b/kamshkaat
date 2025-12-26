/* Path: js/main.js */

// ... (نفس كود الترجمة والقائمة اللي عندك فوق زي ما هو) ...
// (سأضع لك الكود الأساسي ودالة الاشتراك الجديدة فقط لتوفير المساحة، تأكد من وجود باقي الكود)

const translations = {
    ar: {
        nav_home: "الرئيسية",
        nav_courses: "الكورسات",
        nav_gallery: "المعرض",
        nav_articles: "المقالات",
        nav_library: "المكتبة",
        nav_contact: "تواصل",
        nav_login: "دخول",
        nav_account: "حسابي",
        footer_rights: "جميع الحقوق محفوظة © مصطفى كمشكاة 2025",
        home_welcome: "كمشكاة",
        btn_download: "تحميل",
        btn_share_img: "مشاركة",
        share_msg: "تم نسخ الرابط! شاركه مع أصحابك.",
    },
    en: {
        nav_home: "Home",
        footer_rights: "All Rights Reserved © Mostafa Kamshkat 2025",
        home_welcome: "Kamshkat",
        btn_download: "Download",
        btn_share_img: "Share",
        share_msg: "Link copied!",
    }
};

let currentLang = localStorage.getItem('kamshkat_lang') || 'ar';

document.addEventListener('DOMContentLoaded', () => {
    setLanguage(currentLang); 
    loadNavbarFooter();       
    initProtection();         
    lucide.createIcons();     
    // initChatbot(); // لو عندك الشات بوت سيبه
    initCounters();
    injectLightboxStyles(); 

    if(document.body.dataset.page === 'gallery') {
        initGalleryPage();
    }
});

// ... (دوال الترجمة والقائمة LoadNavbarFooter زي ما هي) ...

// 👇👇👇 دي الدالة المهمة اللي ناقصة 👇👇👇
window.enrollInCourse = function(courseId, courseType) {
    const user = firebase.auth().currentUser;
    if (!user) {
        alert("لازم تسجل دخول الأول يا بطل عشان تقدر تشترك! 🔒");
        window.location.href = "login.html";
        return;
    }

    // تحديد الكورس
    let course = null;
    if (courseType === 'udemy' && window.udemyData) {
        course = window.udemyData.find(c => c.id == courseId);
    } else if (courseType === 'academy' && window.kameshkahData) {
        course = window.kameshkahData.find(c => c.id == courseId);
    }

    if (!course) { alert("حصل خطأ في بيانات الكورس!"); return; }

    const db = firebase.database();
    const enrollmentRef = db.ref('users/' + user.uid + '/enrolledCourses/' + courseId);

    enrollmentRef.once('value', (snapshot) => {
        if (snapshot.exists()) {
            // لو مشترك بالفعل، وديه على القاعة علطول
            window.location.href = `watch.html?id=${courseId}`;
        } else {
            // اشتراك جديد
            enrollmentRef.set({
                id: courseId,
                type: courseType,
                title: course.titleAr,
                img: course.img,
                progress: 0,
                status: 'active',
                completedLessons: [],
                enrolledAt: new Date().toISOString()
            }).then(() => {
                alert("تم الاشتراك! يلا بينا نبدأ 🚀");
                window.location.href = `watch.html?id=${courseId}`;
            }).catch((error) => {
                console.error(error);
                alert("حصلت مشكلة في الاشتراك، حاول تاني.");
            });
        }
    });
}

// ... (باقي دوال المعرض واللايت بوكس والعدادات زي ملفك الأصلي) ...
function loadNavbarFooter() {
    // (نفس الكود القديم لبناء القائمة)
    const langBtnText = currentLang === 'ar' ? 'En' : 'عربي';
    const navbarHTML = `
    <nav class="fixed top-0 w-full glass-panel z-50 !bg-white/90 backdrop-blur-md border-b border-white/50 h-20 flex items-center shadow-sm">
        <div class="container mx-auto px-4 flex justify-between items-center">
            <a href="index.html" class="flex items-center gap-2 font-black text-2xl text-emerald-800 hover:scale-105 transition">
                <img src="images/logo.png" class="w-10 h-10 drop-shadow-sm object-contain" alt="Logo" onerror="this.style.display='none'"> 
                <span data-i18n="home_welcome">${t('home_welcome')}</span>
            </a>
            <!-- باقي القائمة -->
             <div class="hidden md:flex items-center gap-1 bg-slate-100/50 p-1 rounded-full border border-slate-200">
                <a href="index.html" class="nav-link px-4 py-2 rounded-full text-slate-600 font-bold text-sm hover:bg-white hover:text-emerald-600 transition" data-i18n="nav_home">${t('nav_home')}</a>
                <a href="courses.html" class="nav-link px-4 py-2 rounded-full text-slate-600 font-bold text-sm hover:bg-white hover:text-emerald-600 transition" data-i18n="nav_courses">${t('nav_courses')}</a>
                <a href="gallery.html" class="nav-link px-4 py-2 rounded-full text-slate-600 font-bold text-sm hover:bg-white hover:text-emerald-600 transition" data-i18n="nav_gallery">${t('nav_gallery')}</a>
                <a href="articles.html" class="nav-link px-4 py-2 rounded-full text-slate-600 font-bold text-sm hover:bg-white hover:text-emerald-600 transition" data-i18n="nav_articles">${t('nav_articles')}</a>
                <a href="library.html" class="nav-link px-4 py-2 rounded-full text-slate-600 font-bold text-sm hover:bg-white hover:text-emerald-600 transition" data-i18n="nav_library">${t('nav_library')}</a>
                <a href="contact.html" class="nav-link px-4 py-2 rounded-full text-slate-600 font-bold text-sm hover:bg-white hover:text-emerald-600 transition" data-i18n="nav_contact">${t('nav_contact')}</a>
            </div>
            <div class="flex items-center gap-2">
                 <button onclick="toggleLanguage()" class="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 font-bold text-xs hover:bg-emerald-100 transition border border-emerald-200">${langBtnText}</button>
                 <div id="auth-area" class="hidden md:block"><a href="login.html" class="bg-emerald-600 text-white px-5 py-2 rounded-xl font-bold hover:bg-emerald-700 transition shadow-lg shadow-emerald-200 text-sm">دخول</a></div>
            </div>
        </div>
    </nav>`;
    const footerHTML = `<footer class="text-center py-8 mt-auto relative z-10"><div class="glass-panel inline-block px-8 py-4 rounded-full bg-white/50 backdrop-blur-md"><p class="text-emerald-800 font-bold text-sm">${t('footer_rights')}</p></div></footer>`;
    if(document.getElementById('header-ph')) document.getElementById('header-ph').innerHTML = navbarHTML;
    if(document.getElementById('footer-ph')) document.getElementById('footer-ph').innerHTML = footerHTML;
    lucide.createIcons();
}
// ... (تأكد ان باقي الدوال toggleLanguage, t, setLanguage, initProtection, initCounters, lightbox موجودة) ...
function initProtection() { document.addEventListener('contextmenu', event => event.preventDefault()); }
function initCounters() { /* ... */ }
function injectLightboxStyles() { /* ... */ }