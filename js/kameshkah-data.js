/* Path: js/kameshkah-data.js */

const kameshkahCourses = [
    {
        id: 301, // ID مميز للكورس
        titleAr: "كورس احتراف الأتمتة والذكاء الاصطناعي بـ n8n",
        titleEn: "Master Automation & AI with n8n (Karim)",
        desc: "دورة شاملة وعملية لتعلم الأتمتة (Automation) وبناء وكلاء الذكاء الاصطناعي (AI Agents) باستخدام n8n. من الصفر حتى بناء مشاريع حقيقية.",
        img: "https://i.ytimg.com/vi/FBID4TaQ6OE/maxresdefault.jpg", // صورة أول فيديو كغلاف
        status: "open",
        price: "مجاني",
        type: "video",
        
        // قائمة الدروس الكاملة (26 حلقة)
        lessons: [
            { id: 1, title: "001 | n8n from Business Perspective", url: "https://www.youtube.com/embed/FBID4TaQ6OE", duration: "10:00", type: "video" },
            { id: 2, title: "002 | ربط جوجل شيتس بالجيميل (Google Sheets to Gmail)", url: "https://www.youtube.com/embed/HdU_jOthCDc", duration: "12:00", type: "video" },
            { id: 3, title: "003 | نظام طلبات مطعم بسيط (Simple Orders System)", url: "https://www.youtube.com/embed/6EdFxcHjcwA", duration: "15:00", type: "video" },
            { id: 4, title: "004 | شرح الأساسيات (Nodes, Triggers, Workflows)", url: "https://www.youtube.com/embed/xv9gQkdPa5g", duration: "20:00", type: "video" },
            { id: 5, title: "005 | تشغيل n8n على جهازك مجاناً (Local n8n)", url: "https://www.youtube.com/embed/QqKdGHgvvOI", duration: "08:00", type: "video" },
            { id: 6, title: "006 | ربط التطبيقات المختلفة (On App Event Trigger)", url: "https://www.youtube.com/embed/BQKej719cx8", duration: "10:00", type: "video" },
            { id: 7, title: "007 | أنواع البيانات (JSON)", url: "https://www.youtube.com/embed/Lw-kEhbSSNs", duration: "12:00", type: "video" },
            { id: 8, title: "008 | شرح API للمبتدئين (اربط أي حاجة)", url: "https://www.youtube.com/embed/ALMbLRbHMCE", duration: "18:00", type: "video" },
            { id: 9, title: "009 | نظام إدارة المخزون باستخدام التلجرام", url: "https://www.youtube.com/embed/bV0agV6RPUY", duration: "25:00", type: "video" },
            { id: 10, title: "010 | ربط أوردرات المطعم بالمطبخ والمخزون", url: "https://www.youtube.com/embed/2mL7Hd0EXa4", duration: "22:00", type: "video" },
            { id: 11, title: "011 | مراجعة شاملة (Revision)", url: "https://www.youtube.com/embed/hkTXn8Vc44c", duration: "30:00", type: "video" },
            { id: 12, title: "012 | الأتمتة بالذكاء الاصطناعي (AI Automation)", url: "https://www.youtube.com/embed/ecCHtuyjz_o", duration: "15:00", type: "video" },
            { id: 13, title: "013 | شرح AI Node in n8n", url: "https://www.youtube.com/embed/clhK654wnoE", duration: "14:00", type: "video" },
            { id: 14, title: "014 | بوت ذكاء اصطناعي للتلجرام (AI Telegram Bot)", url: "https://www.youtube.com/embed/GYKbAt9Z7HY", duration: "20:00", type: "video" },
            { id: 15, title: "015 | تحليل آراء العملاء (Sentiment Analysis)", url: "https://www.youtube.com/embed/-NYfMJVDiGI", duration: "16:00", type: "video" },
            { id: 16, title: "016 | مقدمة عن وكلاء الذكاء الاصطناعي (AI Agents)", url: "https://www.youtube.com/embed/084OP5qdAmU", duration: "12:00", type: "video" },
            { id: 17, title: "017 | شرح AI Agent Node", url: "https://www.youtube.com/embed/nARxq7jObNQ", duration: "18:00", type: "video" },
            { id: 18, title: "018 | وكيل تجميع بيانات العملاء (Lead Qualification Agent)", url: "https://www.youtube.com/embed/Sn7BHC0rdqo", duration: "25:00", type: "video" },
            { id: 19, title: "019 | شرح RAG (فهم الملفات)", url: "https://www.youtube.com/embed/4t42DESCvjI", duration: "22:00", type: "video" },
            { id: 20, title: "020 | وكيل RAG AI (الرد من الداتا الخاصة)", url: "https://www.youtube.com/embed/RgTwFgl50KI", duration: "30:00", type: "video" },
            { id: 21, title: "021 | مشروع أتمتة خدمة العملاء لمطعم", url: "https://www.youtube.com/embed/uN4GsroBv8E", duration: "28:00", type: "video" },
            { id: 22, title: "022 | قصة نجاح: أول ألف دولار من n8n", url: "https://www.youtube.com/embed/giqms3pkjGs", duration: "15:00", type: "video" },
            { id: 23, title: "023 | استضافة n8n على سيرفرك (Self-host)", url: "https://www.youtube.com/embed/a7wYHAH9-NQ", duration: "20:00", type: "video" },
            { id: 24, title: "024 | إزاي تشتغل في مجال الأتمتة؟", url: "https://www.youtube.com/embed/_gs-DIGfQJs", duration: "12:00", type: "video" },
            { id: 25, title: "025 | تسعير مشاريع n8n", url: "https://www.youtube.com/embed/M__8C7QBT4k", duration: "10:00", type: "video" },
            { id: 26, title: "026 | تسليم مشاريع n8n", url: "https://www.youtube.com/embed/2__u2NHX8D4", duration: "10:00", type: "video" }
        ],

        attachments: [
            { name: "ملفات المشاريع (Workflow Files)", link: "#", type: "zip" }
        ],
        
        quiz: [
            { q: "ما هي الأداة المستخدمة لربط التطبيقات ببعضها؟", options: ["n8n", "Photoshop", "Excel"], correct: 0 },
            { q: "نوع البيانات الأساسي في n8n هو:", options: ["XML", "JSON", "CSV"], correct: 1 },
            { q: "يمكن استخدام n8n لبناء وكلاء ذكاء اصطناعي (AI Agents)؟", options: ["نعم", "لا"], correct: 0 }
        ],
        
        stats: {
            lessons: "26 فيديو تطبيقي",
            duration: "8 ساعات تقريباً",
            level: "من الصفر للاحتراف",
            language: "العربية"
        }
    }
];

window.kameshkahData = kameshkahCourses;