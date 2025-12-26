/* Path: js/main.js */

// -------------------------------------------------------------------------
// 1. إعدادات الترجمة
// -------------------------------------------------------------------------
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
        gallery_subtitle: "إبداع متجدد . لمسة فنية",
        btn_download: "تحميل",
        btn_share_img: "مشاركة",
        btn_zoom: "تكبير",
        btn_load_more: "عرض المزيد",
        
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
        gallery_subtitle: "Renewed Creativity . Artistic Touch",
        btn_download: "Download",
        btn_share_img: "Share",
        btn_zoom: "Zoom",
        btn_load_more: "Load More",

        share_msg: "Link copied! Share it with friends.",
    }
};

let currentLang = localStorage.getItem('kamshkat_lang') || 'ar';

// -------------------------------------------------------------------------
// 2. التشغيل الرئيسي
// -------------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    setLanguage(currentLang); 
    loadNavbarFooter();       
    initProtection();         
    lucide.createIcons();     
    initChatbot(); 
    initCounters();
    injectLightboxStyles(); 

    if(document.body.dataset.page === 'gallery') {
        initGalleryPage();
    }
});

// -------------------------------------------------------------------------
// 3. وظائف الترجمة
// -------------------------------------------------------------------------
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

// -------------------------------------------------------------------------
// 4. بناء القائمة
// -------------------------------------------------------------------------
function loadNavbarFooter() {
    const langBtnText = currentLang === 'ar' ? 'En' : 'عربي';
    
    const navbarHTML = `
    <nav class="fixed top-0 w-full glass-panel z-50 !bg-white/90 backdrop-blur-md border-b border-white/50 h-20 flex items-center shadow-sm">
        <div class="container mx-auto px-4 flex justify-between items-center">
            <a href="index.html" class="flex items-center gap-2 font-black text-2xl text-emerald-800 hover:scale-105 transition">
                <img src="images/logo.png" class="w-10 h-10 drop-shadow-sm object-contain" alt="Logo" onerror="this.style.display='none'"> 
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

                <button onclick="document.getElementById('mobile-menu').classList.toggle('hidden')" class="md:hidden p-2 rounded-lg bg-slate-100 text-emerald-800 hover:bg-emerald-100 transition">
                    <i data-lucide="menu" class="w-6 h-6"></i>
                </button>
            </div>
        </div>

        <div id="mobile-menu" class="hidden absolute top-20 left-0 w-full bg-white/95 backdrop-blur-xl border-t border-slate-100 p-4 shadow-xl flex flex-col gap-2 md:hidden animate-fade-in-down">
            <a href="index.html" class="p-3 rounded-xl hover:bg-emerald-50 text-slate-700 font-bold flex items-center gap-3"><i data-lucide="home" class="w-5 h-5 text-emerald-600"></i> ${t('nav_home')}</a>
            <a href="courses.html" class="p-3 rounded-xl hover:bg-emerald-50 text-slate-700 font-bold flex items-center gap-3"><i data-lucide="zap" class="w-5 h-5 text-emerald-600"></i> ${t('nav_courses')}</a>
            <a href="gallery.html" class="p-3 rounded-xl hover:bg-emerald-50 text-slate-700 font-bold flex items-center gap-3"><i data-lucide="image" class="w-5 h-5 text-emerald-600"></i> ${t('nav_gallery')}</a>
            <a href="articles.html" class="p-3 rounded-xl hover:bg-emerald-50 text-slate-700 font-bold flex items-center gap-3"><i data-lucide="pen-tool" class="w-5 h-5 text-emerald-600"></i> ${t('nav_articles')}</a>
            <a href="library.html" class="p-3 rounded-xl hover:bg-emerald-50 text-slate-700 font-bold flex items-center gap-3"><i data-lucide="library" class="w-5 h-5 text-emerald-600"></i> ${t('nav_library')}</a>
            <a href="contact.html" class="p-3 rounded-xl hover:bg-emerald-50 text-slate-700 font-bold flex items-center gap-3"><i data-lucide="phone" class="w-5 h-5 text-emerald-600"></i> ${t('nav_contact')}</a>
            <div class="h-px bg-slate-100 my-1"></div>
            <a href="login.html" class="p-3 rounded-xl bg-emerald-600 text-white font-bold text-center shadow-lg">${t('nav_login')}</a>
        </div>
    </nav>`;

    const footerHTML = `
    <footer class="text-center py-8 mt-auto relative z-10">
        <div class="glass-panel inline-block px-8 py-4 rounded-full bg-white/50 backdrop-blur-md">
            <p class="text-emerald-800 font-bold text-sm" data-i18n="footer_rights">${t('footer_rights')}</p>
        </div>
    </footer>`;

    if(document.getElementById('header-ph')) document.getElementById('header-ph').innerHTML = navbarHTML;
    if(document.getElementById('footer-ph')) document.getElementById('footer-ph').innerHTML = footerHTML;
    lucide.createIcons();
}

// -------------------------------------------------------------------------
// 5. وظائف المعرض (تحديث: قارئ الصور الذكي)
// -------------------------------------------------------------------------
let visibleGalleryCount = 0;
const GALLERY_INCREMENT = 10;
const MAX_IMAGES = 100;
let activeSourceImage = null;

function initGalleryPage() {
    const grid = document.getElementById('gallery-grid');
    if(grid) grid.innerHTML = '';
    
    loadGalleryImages();
    const btn = document.getElementById('load-more-gallery');
    if(btn) {
        btn.addEventListener('click', loadGalleryImages);
    }
}

function loadGalleryImages() {
    const grid = document.getElementById('gallery-grid');
    const btn = document.getElementById('load-more-gallery');
    if(!grid) return;
    
    let start = visibleGalleryCount + 1;
    let end = start + GALLERY_INCREMENT - 1;

    if (start > MAX_IMAGES) {
        if(btn) btn.style.display = 'none';
        return;
    }

    let html = '';
    for(let i=start; i<=end; i++) {
        // المسار الأساسي (UI folder)
        const imgSrc = `images/ui/${i}.jpg`; 
        
        // كود الطوارئ: لو الصورة مش في UI، دور في Gallery، لو لا دور على Webp، لو لا اعرض الخلفية
        const fallbackLogic = `this.onerror=null; this.src='images/gallery/${i}.jpg'; this.onerror=function(){ this.src='images/${i}.webp'; this.onerror=function(){ this.src='images/ui/bg.jpg'; } }`;

        html += `
        <div class="break-inside-avoid mb-6 glass-panel rounded-2xl overflow-hidden group relative bg-white/40 border border-white hover:shadow-xl transition duration-300">
            <div class="cursor-pointer relative" onclick="openLightbox(this.querySelector('img').src, this.querySelector('img'))">
                <img src="${imgSrc}" loading="lazy" class="w-full h-auto block transform transition duration-500 group-hover:scale-105" 
                     onerror="${fallbackLogic}">
                
                <div class="absolute inset-0 bg-emerald-900/20 opacity-0 group-hover:opacity-100 transition duration-300 flex items-center justify-center">
                    <div class="bg-white/90 text-emerald-900 p-3 rounded-full shadow-lg transform scale-75 group-hover:scale-100 transition">
                        <i data-lucide="zoom-in" class="w-6 h-6"></i>
                    </div>
                </div>
            </div>
            
            <div class="p-3 flex justify-between items-center bg-white/80 backdrop-blur-md border-t border-white/50">
                <div class="flex gap-2">
                    <button onclick="toggleLike(${i})" class="flex items-center gap-1.5 text-slate-500 hover:text-red-500 transition group/like">
                        <i data-lucide="heart" class="w-5 h-5 transition transform group-active/like:scale-125" id="heart-${i}"></i>
                        <span id="likes-count-${i}" class="text-xs font-bold font-sans mt-0.5">0</span>
                    </button>
                </div>

                <div class="flex gap-2">
                    <button onclick="downloadImage(this.closest('.break-inside-avoid').querySelector('img').src)" class="text-emerald-600 hover:bg-emerald-50 p-2 rounded-lg transition" title="${t('btn_download')}">
                        <i data-lucide="download" class="w-5 h-5"></i>
                    </button>
                    <button onclick="shareImage(this.closest('.break-inside-avoid').querySelector('img').src)" class="text-emerald-600 hover:bg-emerald-50 p-2 rounded-lg transition" title="${t('btn_share_img')}">
                        <i data-lucide="share-2" class="w-5 h-5"></i>
                    </button>
                </div>
            </div>
        </div>`;
    }

    grid.insertAdjacentHTML('beforeend', html);
    visibleGalleryCount = end;
    lucide.createIcons();
    if(typeof firebase !== 'undefined') listenToLikes(visibleGalleryCount);
}

// دالة التحميل
window.downloadImage = function(src) {
    const link = document.createElement('a');
    link.href = src;
    link.download = src.substring(src.lastIndexOf('/') + 1) || 'image.jpg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// دالة فتح اللايت بوكس
window.openLightbox = function(src, thumbnailEl) {
    const lb = document.getElementById('lightbox');
    const img = document.getElementById('lightbox-img');
    const dl = document.getElementById('lightbox-download');
    
    if(!lb || !img) return;

    activeSourceImage = thumbnailEl;
    img.src = src;
    
    if(dl) {
        dl.onclick = function(e) {
            e.stopPropagation();
            downloadImage(src);
        };
        dl.innerHTML = `<i data-lucide="download" class="w-5 h-5"></i> ${t('btn_download')}`;
    }

    lb.classList.remove('hidden');
    lb.classList.add('flex');
    
    if (thumbnailEl) {
        img.style.transition = 'none';
        img.style.transformOrigin = 'top left';
        img.style.transform = 'scale(0.5)';
        img.style.opacity = '0';
        
        requestAnimationFrame(() => {
            img.style.transition = 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.4s ease';
            img.style.transform = 'scale(1)';
            img.style.opacity = '1';
        });
    }
    
    lucide.createIcons();
}

window.closeLightbox = function() {
    const lb = document.getElementById('lightbox');
    const img = document.getElementById('lightbox-img');
    
    if(!lb || !img) return;

    img.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
    img.style.transform = 'scale(0.8)';
    img.style.opacity = '0';

    setTimeout(() => {
        lb.classList.add('hidden');
        lb.classList.remove('flex');
        img.style.transform = ''; 
        img.style.opacity = '';
    }, 300);
}

function injectLightboxStyles() {
    const style = document.createElement('style');
    style.innerHTML = `
        #lightbox-img { max-height: 85vh; max-width: 90vw; border-radius: 12px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); }
        .masonry-grid { column-count: 1; column-gap: 1.5rem; }
        @media (min-width: 640px) { .masonry-grid { column-count: 2; } }
        @media (min-width: 1024px) { .masonry-grid { column-count: 3; } }
    `;
    document.head.appendChild(style);
}

// -------------------------------------------------------------------------
// 6. باقي الوظائف
// -------------------------------------------------------------------------
window.toggleLike = function(id) {
    if(typeof firebase === 'undefined') return;
    const db = firebase.database();
    const likeRef = db.ref('likes/' + id);
    const storageKey = `liked_${id}`;
    const isLiked = localStorage.getItem(storageKey);

    likeRef.transaction((currentLikes) => {
        if (currentLikes === null) currentLikes = 0;
        if (isLiked) {
            localStorage.removeItem(storageKey);
            updateHeartUI(id, false);
            return currentLikes - 1;
        } else {
            localStorage.setItem(storageKey, 'true');
            updateHeartUI(id, true);
            return currentLikes + 1;
        }
    });
}

window.listenToLikes = function(limit) {
    if(typeof firebase === 'undefined') return;
    const db = firebase.database();
    for(let i=1; i<=limit; i++) {
        db.ref('likes/' + i).on('value', (snapshot) => {
            const countEl = document.getElementById(`likes-count-${i}`);
            if(countEl) countEl.innerText = snapshot.val() || 0;
            updateHeartUI(i, localStorage.getItem(`liked_${i}`));
        });
    }
}

function updateHeartUI(id, isLiked) {
    const icon = document.getElementById(`heart-${id}`);
    if(icon) {
        if(isLiked) {
            icon.classList.add('fill-red-500', 'text-red-500');
            icon.classList.remove('text-slate-400');
        } else {
            icon.classList.remove('fill-red-500', 'text-red-500');
            icon.classList.add('text-slate-400');
        }
    }
}

window.shareCourse = function(title, url) {
    if (navigator.share) {
        navigator.share({
            title: title,
            text: `Check out this course on Kamshkat: ${title}`,
            url: url
        }).catch(console.error);
    } else {
        navigator.clipboard.writeText(url);
        alert(t('share_msg'));
    }
}

window.shareImage = function(imgSrc) {
    // إصلاح رابط المشاركة ليكون كاملاً
    const fullUrl = imgSrc.startsWith('http') ? imgSrc : window.location.origin + window.location.pathname.replace('gallery.html', '') + imgSrc;
    if (navigator.share) {
        navigator.share({
            title: 'تصميم من كمشكاة',
            text: 'شوف الإبداع ده!',
            url: fullUrl
        }).catch(console.error);
    } else {
        navigator.clipboard.writeText(fullUrl);
        alert(t('share_msg'));
    }
}

function initChatbot() {
    (function(){
        if(!window.chatbase || window.chatbase("getState") !== "initialized"){
            window.chatbase = (...arguments) => {
                if(!window.chatbase.q){ window.chatbase.q = [] }
                window.chatbase.q.push(arguments)
            };
            window.chatbase = new Proxy(window.chatbase, {
                get(target, prop){
                    if(prop === "q"){ return target.q }
                    return (...args) => target(prop, ...args)
                }
            })
        }
        const onLoad = function(){
            const script = document.createElement("script");
            script.src = "https://www.chatbase.co/embed.min.js";
            script.id = "pzJqEYo1jgjQMK7rX1iuu";
            script.domain = "www.chatbase.co";
            document.body.appendChild(script)
        };
        if(document.readyState === "complete"){ onLoad() }
        else { window.addEventListener("load", onLoad) }
    })();
}

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