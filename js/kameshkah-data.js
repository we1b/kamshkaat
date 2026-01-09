/* Path: js/kameshkah-data.js */

const kameshkahCourses = [
    // 1. كورس n8n (الأساسي)
    {
        id: 301, 
        titleAr: "كورس احتراف الأتمتة والذكاء الاصطناعي بـ n8n",
        titleEn: "Master Automation & AI with n8n (Karim)",
        desc: "دورة شاملة وعملية لتعلم الأتمتة (Automation) وبناء وكلاء الذكاء الاصطناعي.",
        img: "https://i.ytimg.com/vi/FBID4TaQ6OE/maxresdefault.jpg",
        status: "open",
        price: "مجاني",
        type: "video",
        lessons: [
            { id: 1, title: "001 | n8n from Business Perspective", url: "https://www.youtube.com/embed/FBID4TaQ6OE", duration: "10:00", type: "video" },
            { id: 2, title: "002 | ربط جوجل شيتس بالجيميل", url: "https://www.youtube.com/embed/HdU_jOthCDc", duration: "12:00", type: "video" },
            { id: 3, title: "003 | نظام طلبات مطعم بسيط", url: "https://www.youtube.com/embed/6EdFxcHjcwA", duration: "15:00", type: "video" },
            { id: 4, title: "004 | شرح الأساسيات", url: "https://www.youtube.com/embed/xv9gQkdPa5g", duration: "20:00", type: "video" },
            { id: 5, title: "005 | تشغيل n8n محلياً", url: "https://www.youtube.com/embed/QqKdGHgvvOI", duration: "08:00", type: "video" },
            { id: 6, title: "006 | ربط التطبيقات", url: "https://www.youtube.com/embed/BQKej719cx8", duration: "10:00", type: "video" },
            { id: 7, title: "007 | أنواع البيانات JSON", url: "https://www.youtube.com/embed/Lw-kEhbSSNs", duration: "12:00", type: "video" },
            { id: 8, title: "008 | شرح API للمبتدئين", url: "https://www.youtube.com/embed/ALMbLRbHMCE", duration: "18:00", type: "video" },
            { id: 9, title: "009 | إدارة المخزون بالتلجرام", url: "https://www.youtube.com/embed/bV0agV6RPUY", duration: "25:00", type: "video" },
            { id: 10, title: "010 | ربط المطعم بالمخزون", url: "https://www.youtube.com/embed/2mL7Hd0EXa4", duration: "22:00", type: "video" },
            { id: 11, title: "011 | مراجعة شاملة", url: "https://www.youtube.com/embed/hkTXn8Vc44c", duration: "30:00", type: "video" },
            { id: 12, title: "012 | الأتمتة بالذكاء الاصطناعي", url: "https://www.youtube.com/embed/ecCHtuyjz_o", duration: "15:00", type: "video" },
            { id: 13, title: "013 | AI Node in n8n", url: "https://www.youtube.com/embed/clhK654wnoE", duration: "14:00", type: "video" },
            { id: 14, title: "014 | بوت تلجرام ذكي", url: "https://www.youtube.com/embed/GYKbAt9Z7HY", duration: "20:00", type: "video" },
            { id: 15, title: "015 | تحليل الآراء (Sentiment)", url: "https://www.youtube.com/embed/-NYfMJVDiGI", duration: "16:00", type: "video" },
            { id: 16, title: "016 | مقدمة AI Agents", url: "https://www.youtube.com/embed/084OP5qdAmU", duration: "12:00", type: "video" },
            { id: 17, title: "017 | AI Agent Node", url: "https://www.youtube.com/embed/nARxq7jObNQ", duration: "18:00", type: "video" },
            { id: 18, title: "018 | وكيل تجميع البيانات", url: "https://www.youtube.com/embed/Sn7BHC0rdqo", duration: "25:00", type: "video" },
            { id: 19, title: "019 | شرح RAG", url: "https://www.youtube.com/embed/4t42DESCvjI", duration: "22:00", type: "video" },
            { id: 20, title: "020 | وكيل RAG AI", url: "https://www.youtube.com/embed/RgTwFgl50KI", duration: "30:00", type: "video" },
            { id: 21, title: "021 | مشروع أتمتة خدمة العملاء", url: "https://www.youtube.com/embed/uN4GsroBv8E", duration: "28:00", type: "video" },
            { id: 22, title: "022 | قصة نجاح", url: "https://www.youtube.com/embed/giqms3pkjGs", duration: "15:00", type: "video" },
            { id: 23, title: "023 | استضافة n8n (Self-host)", url: "https://www.youtube.com/embed/a7wYHAH9-NQ", duration: "20:00", type: "video" },
            { id: 24, title: "024 | العمل في الأتمتة", url: "https://www.youtube.com/embed/_gs-DIGfQJs", duration: "12:00", type: "video" },
            { id: 25, title: "025 | تسعير المشاريع", url: "https://www.youtube.com/embed/M__8C7QBT4k", duration: "10:00", type: "video" },
            { id: 26, title: "026 | تسليم المشاريع", url: "https://www.youtube.com/embed/2__u2NHX8D4", duration: "10:00", type: "video" }
        ],
        stats: { lessons: "26 فيديو", duration: "8 ساعات", level: "احترافي", language: "العربية" }
    },
    
    // 2. كورس الاستعداد لرمضان (جديد)
    {
        id: 401,
        titleAr: "دورة الاستعداد لرمضان: قلوبنا اشتاقت 🌙",
        titleEn: "Ramadan Preparation",
        desc: "دليل عملي وإيماني لاستقبال الشهر الكريم.",
        img: "images/ui/ramadan-bg.jpg", 
        status: "open",
        price: "مجاني",
        type: "text",
        lessons: [
            {
                id: 1, title: "كيف نستقبل رمضان؟", duration: "10 دقائق", type: "text",
                content: `<h3>الضيف العزيز اقترب.. فكيف نستقبله؟</h3><p>رمضان ليس مجرد شهر للصوم، بل دورة تدريبية...</p>`
            },
            {
                id: 2, title: "خطة العبادة", duration: "15 دقيقة", type: "text",
                content: `<h3>تنظيم الوقت</h3><p>كيف تجمع بين العمل والعبادة...</p>`
            }
        ],
        stats: { lessons: "حلقتين", duration: "25 دقيقة", level: "عام", language: "العربية" }
    }
];

window.kameshkahData = kameshkahCourses;