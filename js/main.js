/* ==========================================================================
   أسامة للبرمجيات — ملف التفاعل
   كل قسم هنا مستقل عن غيره، فتستطيع تعديله أو حذفه بأمان.
   ========================================================================== */

/* ===== الإعدادات — عدّل هذه القيم فقط ===== */
const CONFIG = {
  // رقم الواتساب بصيغة دولية: رمز الدولة + الرقم، بدون + وبدون صفر أول وبدون مسافات
  whatsappNumber: '966500000000',
  // الرسالة التي تظهر عند الضغط على زر واتساب العائم
  whatsappGreeting: 'مرحبًا أسامة للبرمجيات 👋 أرغب في الاستفسار عن خدماتكم.'
};

document.addEventListener('DOMContentLoaded', () => {

  /* ------------------------------------------------------------------
     1) الترويسة: ظل عند التمرير
     ------------------------------------------------------------------ */
  const header = document.getElementById('header');

  const onScroll = () => {
    header.classList.toggle('is-scrolled', window.scrollY > 20);
    toTop.classList.toggle('is-shown', window.scrollY > 500);
    highlightActiveLink();
  };

  /* ------------------------------------------------------------------
     2) قائمة الجوال (زر الثلاث شرطات)
     ------------------------------------------------------------------ */
  const burger = document.getElementById('burger');
  const nav = document.getElementById('nav');

  const closeMenu = () => {
    nav.classList.remove('is-open');
    burger.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'فتح القائمة');
  };

  burger.addEventListener('click', () => {
    const willOpen = !nav.classList.contains('is-open');
    nav.classList.toggle('is-open', willOpen);
    burger.classList.toggle('is-open', willOpen);
    burger.setAttribute('aria-expanded', String(willOpen));
    burger.setAttribute('aria-label', willOpen ? 'إغلاق القائمة' : 'فتح القائمة');
  });

  // إغلاق القائمة بعد اختيار رابط، أو عند الضغط على Escape
  nav.addEventListener('click', (e) => {
    if (e.target.closest('a')) closeMenu();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });

  /* ------------------------------------------------------------------
     3) تمييز رابط القسم الظاهر حاليًا في القائمة
     ------------------------------------------------------------------ */
  const navLinks = Array.from(document.querySelectorAll('.nav__link'));
  const sections = navLinks
    .map(link => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);

  function highlightActiveLink() {
    const line = window.scrollY + window.innerHeight * 0.3;
    let current = sections[0];

    for (const section of sections) {
      if (section.offsetTop <= line) current = section;
    }
    navLinks.forEach(link => {
      link.classList.toggle('is-active', link.getAttribute('href') === '#' + current.id);
    });
  }

  /* ------------------------------------------------------------------
     4) ظهور العناصر بحركة ناعمة عند التمرير
     ------------------------------------------------------------------ */
  const revealItems = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, i) => {
        if (!entry.isIntersecting) return;
        // تأخير بسيط متتابع ليظهر العنصر تلو الآخر
        setTimeout(() => entry.target.classList.add('is-visible'), i * 70);
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

    revealItems.forEach(el => observer.observe(el));
  } else {
    // متصفح قديم: أظهر كل شيء مباشرة
    revealItems.forEach(el => el.classList.add('is-visible'));
  }

  /* ------------------------------------------------------------------
     5) عدّاد الأرقام في الواجهة الرئيسية
     ------------------------------------------------------------------ */
  const counters = document.querySelectorAll('.counter');

  function runCounter(el) {
    const target = Number(el.dataset.target) || 0;
    const duration = 1600;
    const start = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      // تباطؤ في النهاية ليبدو طبيعيًا
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(target * eased);
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  if ('IntersectionObserver' in window) {
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        runCounter(entry.target);
        counterObserver.unobserve(entry.target);
      });
    }, { threshold: 0.5 });

    counters.forEach(el => counterObserver.observe(el));
  } else {
    counters.forEach(runCounter);
  }

  /* ------------------------------------------------------------------
     6) تصفية معرض الأعمال حسب التصنيف
     ------------------------------------------------------------------ */
  const filterBtns = document.querySelectorAll('.filter-btn');
  const works = document.querySelectorAll('.work');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');

      const filter = btn.dataset.filter;
      works.forEach(work => {
        const show = filter === 'all' || work.dataset.cat === filter;
        work.classList.toggle('is-hidden', !show);
      });
    });
  });

  /* ------------------------------------------------------------------
     7) الأسئلة الشائعة (فتح وإغلاق)
     ------------------------------------------------------------------ */
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const question = item.querySelector('.faq-q');
    const answer = item.querySelector('.faq-a');

    question.addEventListener('click', () => {
      const isOpen = item.classList.contains('is-open');

      // أغلق كل الأسئلة الأخرى أولًا
      faqItems.forEach(other => {
        other.classList.remove('is-open');
        other.querySelector('.faq-a').style.maxHeight = null;
        other.querySelector('.faq-q').setAttribute('aria-expanded', 'false');
      });

      if (!isOpen) {
        item.classList.add('is-open');
        answer.style.maxHeight = answer.scrollHeight + 'px';
        question.setAttribute('aria-expanded', 'true');
      }
    });
  });

  // إعادة حساب ارتفاع الإجابة المفتوحة عند تغيير حجم النافذة
  window.addEventListener('resize', () => {
    const openItem = document.querySelector('.faq-item.is-open .faq-a');
    if (openItem) openItem.style.maxHeight = openItem.scrollHeight + 'px';
  });

  /* ------------------------------------------------------------------
     8) أزرار الباقات: تختار الباقة تلقائيًا في النموذج
     ------------------------------------------------------------------ */
  document.querySelectorAll('[data-plan]').forEach(btn => {
    btn.addEventListener('click', () => {
      const select = document.getElementById('service');
      const wanted = btn.dataset.plan;
      const option = Array.from(select.options).find(o => o.text === wanted);
      if (option) select.value = option.value || option.text;
    });
  });

  /* ------------------------------------------------------------------
     9) نموذج التواصل: تحقق من البيانات ثم فتح واتساب
     ------------------------------------------------------------------ */
  const form = document.getElementById('contactForm');
  const successBox = document.getElementById('formSuccess');

  const setError = (input, hasError) => {
    input.closest('.field').classList.toggle('has-error', hasError);
    return !hasError;
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name    = form.name;
    const phone   = form.phone;
    const email   = form.email;
    const service = form.service;
    const budget  = form.budget;
    const details = form.details;

    // قواعد بسيطة وواضحة للتحقق
    const digits = phone.value.replace(/\D/g, '');
    const checks = [
      setError(name,    name.value.trim().length < 2),
      setError(phone,   digits.length < 9),
      setError(email,   email.value.trim() !== '' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.value.trim())),
      setError(service, service.value === ''),
      setError(details, details.value.trim().length < 10)
    ];

    if (checks.includes(false)) {
      form.querySelector('.has-error input, .has-error select, .has-error textarea').focus();
      return;
    }

    // تجهيز نص الرسالة لواتساب
    const lines = [
      '*طلب خدمة جديد من الموقع*',
      '',
      'الاسم: ' + name.value.trim(),
      'الهاتف: ' + phone.value.trim(),
      email.value.trim() ? 'البريد: ' + email.value.trim() : null,
      'الخدمة المطلوبة: ' + service.value,
      budget.value ? 'الميزانية: ' + budget.value : null,
      '',
      'تفاصيل المشروع:',
      details.value.trim()
    ].filter(Boolean);

    const url = 'https://wa.me/' + CONFIG.whatsappNumber + '?text=' + encodeURIComponent(lines.join('\n'));
    window.open(url, '_blank', 'noopener');

    successBox.classList.add('is-shown');
    form.reset();
    setTimeout(() => successBox.classList.remove('is-shown'), 8000);
  });

  // إخفاء رسالة الخطأ فور تصحيح الحقل
  form.querySelectorAll('input, select, textarea').forEach(input => {
    input.addEventListener('input', () => input.closest('.field').classList.remove('has-error'));
  });

  /* ------------------------------------------------------------------
     10) زر واتساب العائم
     ------------------------------------------------------------------ */
  document.getElementById('whatsappFloat').href =
    'https://wa.me/' + CONFIG.whatsappNumber + '?text=' + encodeURIComponent(CONFIG.whatsappGreeting);

  /* ------------------------------------------------------------------
     11) زر العودة إلى الأعلى
     ------------------------------------------------------------------ */
  const toTop = document.getElementById('toTop');
  toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  /* ------------------------------------------------------------------
     12) سنة حقوق النشر تتحدث تلقائيًا
     ------------------------------------------------------------------ */
  document.getElementById('year').textContent = new Date().getFullYear();

  /* ------------------------------------------------------------------
     تشغيل مستمع التمرير (في النهاية حتى تكون كل العناصر جاهزة)
     ------------------------------------------------------------------ */
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
});
