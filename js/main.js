/* Path: js/main.js */

// 1. إعدادات الترجمة
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
        btn_start_learning: "ابدأ رحلة التعلم",
        btn_view_gallery: "شوف الإبداع",
        stat_followers: "زائر للموقع",
        stat_courses: "كورس متاح",
        stat_ambition: "طموح بلا حدود",
        gallery_title: "معرض التصميمات",
        btn_download: "تحميل",
        btn_share_img: "مشاركة",
        share_msg: "تم نسخ الرابط! شاركه مع أصحابك.",
        login_welcome: "أهلاً بيك تاني! 👋",
    },
    en: {
        nav_home: "Home",
        nav_courses: "Courses",
        nav_gallery: "Gallery",
        nav_articles: "Articles",
        nav_library: "Library",
        nav_contact: "Contact",
        nav_login: "Login",
        nav_account: "My Account",
        footer_rights: "All Rights Reserved © Mostafa Kamshkat 2025",
        home_welcome: "Kamshkat",
        btn_start_learning: "Start Learning",
        btn_view_gallery: "View Gallery",
        stat_followers: "Visitors",
        stat_courses: "Courses Available",
        stat_ambition: "Limitless Ambition",
        gallery_title: "Design Gallery",
        btn_download: "Download",
        btn_share_img: "Share",
        share_msg: "Link copied! Share it with friends.",
    }
};

let currentLang = localStorage.getItem('kamshkat_lang') || 'ar';

document.addEventListener('DOMContentLoaded', () => {
    setLanguage(currentLang); 
    loadNavbarFooter();       
    initProtection();         
    
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    } else {
        setTimeout(() => { if (typeof lucide !== 'undefined') lucide.createIcons(); }, 1000);
    }

    initCounters();
    injectLightboxStyles(); 

    if(document.body.dataset.page === 'gallery') {
        initGalleryPage();
    }
});

function toggleLanguage() {
    currentLang = currentLang === 'ar' ? 'en' : 'ar';
    localStorage.setItem('kamshkat_lang', currentLang);
    setLanguage(currentLang);
    loadNavbarFooter(); 
    location.reload(); 
}

function setLanguage(lang) {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.dataset.i18n;
        if(translations[lang][key]) {
            if(el.tagName === 'INPUT') el.placeholder = translations[lang][key];
            else el.innerText = translations[lang][key];
        }
    });
}

function t(key) { return translations[currentLang][key] || key; }

function loadNavbarFooter() {
    const langBtnText = currentLang === 'ar' ? 'En' : 'عربي';
    
    const navbarHTML = `
    <nav class="fixed top-0 w-full glass-panel z-50 !bg-white/90 backdrop-blur-md border-b border-white/50 h-20 flex items-center shadow-sm transition-all duration-300">
        <div class="container mx-auto px-4 flex justify-between items-center">
            <a href="index.html" class="flex items-center gap-2 font-black text-2xl text-emerald-800 hover:scale-105 transition">
                <img src="images/ui/logo.png" class="w-10 h-10 drop-shadow-sm object-contain" alt="Logo" onerror="this.style.display='none'"> 
                <span data-i18n="home_welcome">${t('home_welcome')}</span>
            </a>
            
            <div class="hidden md:flex items-center gap-1 bg-slate-100/50 p-1 rounded-full border border-slate-200">
                <a href="index.html" class="nav-link px-4 py-2 rounded-full text-slate-600 font-bold text-sm hover:bg-white hover:text-emerald-600 transition" data-i18n="nav_home">${t('nav_home')}</a>
                <a href="courses.html" class="nav-link px-4 py-2 rounded-full text-slate-600 font-bold text-sm hover:bg-white hover:text-emerald-600 transition" data-i18n="nav_courses">${t('nav_courses')}</a>
                <a href="gallery.html" class="nav-link px-4 py-2 rounded-full text-slate-600 font-bold text-sm hover:bg-white hover:text-emerald-600 transition" data-i18n="nav_gallery">${t('nav_gallery')}</a>
                <a href="articles.html" class="nav-link px-4 py-2 rounded-full text-slate-600 font-bold text-sm hover:bg-white hover:text-emerald-600 transition" data-i18n="nav_articles">${t('nav_articles')}</a>
                <a href="library.html" class="nav-link px-4 py-2 rounded-full text-slate-600 font-bold text-sm hover:bg-white hover:text-emerald-600 transition" data-i18n="nav_library">${t('nav_library')}</a>
                <a href="contact.html" class="nav-link px-4 py-2 rounded-full text-slate-600 font-bold text-sm hover:bg-white hover:text-emerald-600 transition" data-i18n="nav_contact">${t('nav_contact')}</a>
            </div>

            <div class="flex items-center gap-2">
                <button onclick="toggleLanguage()" class="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 font-bold text-xs hover:bg-emerald-100 transition border border-emerald-200">
                    ${langBtnText}
                </button>
                
                <div id="auth-area" class="hidden md:block">
                    <a href="login.html" class="bg-emerald-600 text-white px-5 py-2 rounded-xl font-bold hover:bg-emerald-700 transition shadow-lg shadow-emerald-200 text-sm" data-i18n="nav_login">${t('nav_login')}</a>
                </div>

                <button id="mobile-menu-btn" onclick="toggleMobileMenu()" class="md:hidden p-2 rounded-lg bg-slate-100 text-emerald-800 hover:bg-emerald-100 transition border border-slate-200">
                    <i data-lucide="menu" class="w-6 h-6"></i>
                </button>
            </div>
        </div>

        <div id="mobile-menu" class="hidden absolute top-20 left-0 w-full bg-white/95 backdrop-blur-xl border-t border-slate-100 p-4 shadow-xl flex flex-col gap-2 md:hidden animate-fade-in-down origin-top">
            <a href="index.html" class="p-3 rounded-xl hover:bg-emerald-50 text-slate-700 font-bold flex items-center gap-3"><i data-lucide="home" class="w-5 h-5 text-emerald-600"></i> ${t('nav_home')}</a>
            <a href="courses.html" class="p-3 rounded-xl hover:bg-emerald-50 text-slate-700 font-bold flex items-center gap-3"><i data-lucide="zap" class="w-5 h-5 text-emerald-600"></i> ${t('nav_courses')}</a>
            <a href="gallery.html" class="p-3 rounded-xl hover:bg-emerald-50 text-slate-700 font-bold flex items-center gap-3"><i data-lucide="image" class="w-5 h-5 text-emerald-600"></i> ${t('nav_gallery')}</a>
            <a href="articles.html" class="p-3 rounded-xl hover:bg-emerald-50 text-slate-700 font-bold flex items-center gap-3"><i data-lucide="pen-tool" class="w-5 h-5 text-emerald-600"></i> ${t('nav_articles')}</a>
            <a href="library.html" class="p-3 rounded-xl hover:bg-emerald-50 text-slate-700 font-bold flex items-center gap-3"><i data-lucide="library" class="w-5 h-5 text-emerald-600"></i> ${t('nav_library')}</a>
            <a href="contact.html" class="p-3 rounded-xl hover:bg-emerald-50 text-slate-700 font-bold flex items-center gap-3"><i data-lucide="phone" class="w-5 h-5 text-emerald-600"></i> ${t('nav_contact')}</a>
            <div class="h-px bg-slate-100 my-1"></div>
            <a href="login.html" class="p-3 rounded-xl bg-emerald-600 text-white font-bold text-center shadow-lg" id="mobile-auth-btn">${t('nav_login')}</a>
        </div>
    </nav>`;

    const footerHTML = `
    <footer class="text-center py-8 mt-auto relative z-10">
        <div class="glass-panel inline-block px-8 py-4 rounded-full bg-white/50 backdrop-blur-md border border-white">
            <p class="text-emerald-800 font-bold text-sm" data-i18n="footer_rights">${t('footer_rights')}</p>
        </div>
    </footer>`;

    if(document.getElementById('header-ph')) document.getElementById('header-ph').innerHTML = navbarHTML;
    if(document.getElementById('footer-ph')) document.getElementById('footer-ph').innerHTML = footerHTML;
    
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

window.toggleMobileMenu = function() {
    const menu = document.getElementById('mobile-menu');
    if (menu) {
        menu.classList.toggle('hidden');
    }
}

// -------------------------------------------------------------------------
// 5. وظيفة الاشتراك في الكورس (محدثة: رسالة وتوجيه للداشبورد) 🔥
// -------------------------------------------------------------------------
window.enrollInCourse = function(courseId, courseType) {
    const user = firebase.auth().currentUser;
    if (!user) {
        alert("لازم تسجل دخول الأول يا بطل عشان تقدر تشترك! 🔒");
        window.location.href = "login.html";
        return;
    }

    let course = null;
    if (courseType === 'udemy' && typeof window.udemyData !== 'undefined') {
        course = window.udemyData.find(c => c.id == courseId);
    } else if (courseType === 'academy' && typeof window.kameshkahData !== 'undefined') {
        course = window.kameshkahData.find(c => c.id == courseId);
    }

    if (!course) { 
        console.error("Course data not found", courseId, courseType);
        alert("حصل خطأ في تحميل بيانات الكورس! تأكد من تحميل الصفحة بشكل صحيح."); 
        return; 
    }

    const db = firebase.database();
    const enrollmentRef = db.ref('users/' + user.uid + '/enrolledCourses/' + courseId);

    // التحقق المباشر بدون تعقيد
    enrollmentRef.once('value', (snapshot) => {
        if (snapshot.exists()) {
            // لو مشترك، نوديه الداشبورد علطول
            alert("أنت مشترك بالفعل! جاري نقلك لكورساتك...");
            window.location.href = "dashboard.html";
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
                // إظهار رسالة نجاح مخصصة (Toast) لو موجودة في الصفحة، أو Alert عادي
                showSuccessMessage("تم الاشتراك بنجاح! 🎉\nتمت إضافة الكورس للوحة التحكم.");
                // تأخير بسيط قبل التحويل عشان يلحق يشوف الرسالة
                setTimeout(() => {
                    window.location.href = "dashboard.html";
                }, 2000);
            }).catch((error) => {
                console.error(error);
                alert("حصلت مشكلة في الاشتراك، حاول تاني.");
            });
        }
    });
}

// دالة مساعدة لإظهار رسالة جميلة
function showSuccessMessage(msg) {
    // لو مفيش عنصر رسالة، نستخدم alert
    const toast = document.createElement('div');
    toast.className = "fixed bottom-5 left-1/2 transform -translate-x-1/2 bg-emerald-600 text-white px-6 py-3 rounded-full shadow-2xl z-50 flex items-center gap-2 animate-bounce-slow font-bold";
    toast.innerHTML = `<i data-lucide="check-circle" class="w-5 h-5"></i> ${msg.replace('\n', ' ')}`;
    document.body.appendChild(toast);
    if(typeof lucide !== 'undefined') lucide.createIcons();
    
    // تختفي بعد 3 ثواني
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// ... (باقي الدوال: initCounters, animateValue, initProtection, injectLightboxStyles ...)
function initCounters() {
    const counters = document.querySelectorAll('.counter-number');
    if(counters.length === 0) return;
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if(entry.isIntersecting) {
                const el = entry.target;
                const target = +el.dataset.target || 0;
                animateValue(el, 0, target, 2500); 
                observer.unobserve(el);
            }
        });
    }, { threshold: 0.2 });
    counters.forEach(c => observer.observe(c));
}

function animateValue(obj, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        obj.innerHTML = Math.floor(progress * (end - start) + start) + '+';
        if (progress < 1) window.requestAnimationFrame(step);
    };
    window.requestAnimationFrame(step);
}

function initProtection() {
    document.addEventListener('contextmenu', event => event.preventDefault());
    document.onkeydown = function(e) {
        if(e.keyCode == 123) return false; 
        if(e.ctrlKey && e.shiftKey && e.keyCode == 'I'.charCodeAt(0)) return false; 
        if(e.ctrlKey && e.keyCode == 'U'.charCodeAt(0)) return false; 
    };
    document.addEventListener('dragstart', function(e) { e.preventDefault(); });
}

function injectLightboxStyles() {
    const style = document.createElement('style');
    style.innerHTML = `
        #lightbox-img { max-height: 85vh; max-width: 90vw; border-radius: 12px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); }
        .masonry-grid { column-count: 1; column-gap: 1.5rem; }
        @media (min-width: 640px) { .masonry-grid { column-count: 2; } }
        @media (min-width: 1024px) { .masonry-grid { column-count: 3; } }
        .animate-fade-in-down { animation: fadeInDown 0.3s ease-out forwards; }
        @keyframes fadeInDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
    `;
    document.head.appendChild(style);
}