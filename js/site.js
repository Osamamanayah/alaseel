/* ==========================================================================
   الأصيل للبرمجيات — ملف التفاعل (نسخة قالب Editorial)

   ما الفرق عن js/main.js القديم؟
   حُذفت منه أربعة أجزاء لأنها لا تنتمي إلى تنسيق قالب Editorial:
     • زر القائمة (الثلاث شرطات) وفتح/إغلاق القائمة  → صار في العمود الجانبي
     • تمييز رابط القسم الظاهر في الترويسة          → لا توجد ترويسة ثابتة الآن
     • مؤشر الفأرة المخصص (النقطة والحلقة الحمراء)  → القالب يستخدم مؤشر النظام
     • حركة ظهور العناصر عند التمرير                → القالب يعرض محتواه مباشرة

   وكل ما عدا ذلك منقول كما هو: العدّادات، عارض الشرائح، الأسئلة الشائعة،
   أزرار الباقات، نموذج التواصل، زر واتساب، زر العودة للأعلى، وسنة الحقوق.

   كل قسم هنا مستقل عن غيره، فتستطيع تعديله أو حذفه بأمان.
   ========================================================================== */

/* ===== الإعدادات — عدّل هذه القيم فقط ===== */
const CONFIG = {
  // رقم الواتساب بصيغة دولية: رمز الدولة + الرقم، بدون + وبدون صفر أول وبدون مسافات
  whatsappNumber: '962772499064',
  // الرسالة التي تظهر عند الضغط على زر واتساب العائم
  whatsappGreeting: 'مرحبًا، أرغب في الاستفسار عن خدمات الأصيل للبرمجيات 👋'
};

/* ==========================================================================
   أرقام الهواتف الأردنية

   شبكات الجوال في الأردن تبدأ بـ 07 يليها 7 أو 8 أو 9، ثم سبعة أرقام.
   أي أن الرقم المحلي عشر خانات:  07X XXX XXXX

   نقبل من الزائر كل الصيغ المتداولة ونوحّدها:
       0791234567        محلي
       791234567         بلا الصفر
       +962791234567     دولي
       00962791234567    دولي بصيغة الاتصال
       079-123-4567      بفواصل أو مسافات
   ========================================================================== */

/* ترجع الرقم بالصيغة الدولية بلا علامة + ، أو null إذا لم يكن أردنيًا صحيحًا */
function normalizeJordanMobile(raw) {
  let d = String(raw).replace(/\D/g, '');        // نُبقي الأرقام فقط
  if (d.startsWith('00962'))    d = d.slice(5);
  else if (d.startsWith('962')) d = d.slice(3);
  else if (d.startsWith('0'))   d = d.slice(1);
  // ما بقي يجب أن يكون تسع خانات تبدأ بـ 7 ثم 7 أو 8 أو 9
  return /^7[789]\d{7}$/.test(d) ? '962' + d : null;
}

/* تعرض الرقم بشكل مقروء في رسالة واتساب: +962 79 123 4567 */
function formatJordanMobile(intl) {
  return '+' + intl.slice(0, 3) + ' ' + intl.slice(3, 5) + ' ' +
         intl.slice(5, 8) + ' ' + intl.slice(8);
}

document.addEventListener('DOMContentLoaded', () => {

  /* ------------------------------------------------------------------
     1) عدّاد الأرقام في الواجهة الرئيسية
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
     2) عارض شرائح الأعمال في الواجهة الرئيسية
     ------------------------------------------------------------------ */
  const showcase = document.getElementById('showcase');

  if (showcase) {
    const slides = [...showcase.querySelectorAll('.slide')];
    const dots   = [...showcase.querySelectorAll('.showcase__dot')];
    const DELAY  = 4500;               // مدة بقاء كل صورة بالميلي ثانية
    let index = 0, timer = null;

    // هل طلب المستخدم تقليل الحركة من إعدادات جهازه؟ عندها لا نشغّل التبديل التلقائي
    const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // تحميل تدريجي: الصورة الأولى فقط تُحمَّل مع الصفحة، والباقي عند الحاجة.
    // السبب: الصور كبيرة، وتحميلها كلها دفعة واحدة يُبطئ فتح الموقع.
    const loadImage = (i) => {
      const img = slides[i % slides.length].querySelector('img[data-src]');
      if (!img) return;
      img.src = img.dataset.src;
      img.removeAttribute('data-src');
    };

    /* الانتقال الانزلاقي:
       dir = 1  → للأمام: الشريحة الجديدة تدخل من اليسار والقديمة تخرج يمينًا
       dir = -1 → للخلف : العكس تمامًا                                        */
    const show = (i, dir = 1) => {
      const next = (i + slides.length) % slides.length;
      if (next === index && slides[index].classList.contains('is-active')) return;

      const current = slides[index];
      const incoming = slides[next];
      loadImage(next);                 // تأكّد أن صورة الشريحة القادمة جاهزة

      // ضع الشريحة القادمة خارج الإطار بلا حركة مرئية
      incoming.classList.add('no-anim');
      incoming.style.transform = 'translateX(' + (dir === 1 ? -100 : 100) + '%)';
      incoming.style.opacity = '0';
      void incoming.offsetWidth;       // يجبر المتصفح على تطبيق الموضع فورًا
      incoming.classList.remove('no-anim');

      // حرّك الاثنتين في نفس اللحظة
      incoming.classList.add('is-active');
      incoming.style.transform = 'translateX(0)';
      incoming.style.opacity = '1';

      current.classList.remove('is-active');
      current.style.transform = 'translateX(' + (dir === 1 ? 100 : -100) + '%)';
      current.style.opacity = '0';

      index = next;
      dots.forEach((d, n) => d.classList.toggle('is-active', n === index));
      loadImage(index + 1);            // جهّز التي بعدها مسبقًا
    };

    const play  = () => { if (!calm && !timer) timer = setInterval(() => show(index + 1), DELAY); };
    const pause = () => { clearInterval(timer); timer = null; };

    dots.forEach(dot => dot.addEventListener('click', () => {
      const target = Number(dot.dataset.index);
      pause();
      show(target, target > index ? 1 : -1);
      play();
    }));

    /* التبديل بالتمرير: كلما نزل الزائر للأسفل مسافة معيّنة تنزلق الشريحة
       التالية، وإذا صعد للأعلى ترجع السابقة. يعمل فقط والعارض ظاهر أمامه. */
    let lastScrollY = window.scrollY;
    let scrolled = 0;
    /* كم بكسل تمرير تحتاج لتبديل شريحة.
       على الجوال نضاعف المسافة تقريبًا: شاشته أقصر، والتمرير باللمس له
       اندفاع (momentum) يقطع مسافة كبيرة بلمسة واحدة — فلو تركناها 150
       لتقافزت الصور بسرعة مزعجة. */
    const STEP = window.matchMedia('(max-width: 860px)').matches ? 280 : 150;

    window.addEventListener('scroll', () => {
      const move = window.scrollY - lastScrollY;
      lastScrollY = window.scrollY;

      const box = showcase.getBoundingClientRect();
      const isVisible = box.bottom > 60 && box.top < window.innerHeight - 60;
      if (!isVisible) { scrolled = 0; return; }

      scrolled += move;
      if (Math.abs(scrolled) < STEP) return;

      const dir = scrolled > 0 ? 1 : -1;   // موجب = ينزل للأسفل
      scrolled = 0;
      pause();                             // أوقف المؤقّت حتى لا يتعارض مع التمرير
      show(index + dir, dir);
      play();                              // ثم أعد تشغيله من جديد
    }, { passive: true });

    // أوقف التبديل عند مرور الفأرة أو التركيز بلوحة المفاتيح، وعند مغادرة التبويب
    showcase.addEventListener('mouseenter', pause);
    showcase.addEventListener('mouseleave', play);
    showcase.addEventListener('focusin', pause);
    showcase.addEventListener('focusout', play);
    document.addEventListener('visibilitychange', () => document.hidden ? pause() : play());

    // حمّل باقي الصور بهدوء بعد أن تكتمل الصفحة
    window.addEventListener('load', () => slides.forEach((_, i) => setTimeout(() => loadImage(i), i * 400)));

    play();
  }

  /* ------------------------------------------------------------------
     3) الأسئلة الشائعة (فتح وإغلاق)
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
     4) أزرار الباقات: تختار الباقة تلقائيًا في النموذج
     ------------------------------------------------------------------ */
  document.querySelectorAll('[data-plan]').forEach(btn => {
    btn.addEventListener('click', () => {
      const select = document.getElementById('service');
      if (!select) return;
      const wanted = btn.dataset.plan;
      const option = Array.from(select.options).find(o => o.text === wanted);
      if (option) select.value = option.value || option.text;
    });
  });

  /* ------------------------------------------------------------------
     5) نموذج التواصل: تحقق من البيانات ثم فتح واتساب
     ------------------------------------------------------------------ */
  const form = document.getElementById('contactForm');
  const successBox = document.getElementById('formSuccess');

  if (form) {
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
      // حقل اختياري: قد يكون محذوفًا من الصفحة، لذلك نتحقق من وجوده أولًا
      const budget  = form.budget || null;
      const details = form.details;

      // قواعد بسيطة وواضحة للتحقق.
      // الهاتف: نقبله فقط إذا كان رقم جوال أردنيًا صحيحًا (07 ثم 7/8/9).
      const phoneIntl = normalizeJordanMobile(phone.value);
      const checks = [
        setError(name,    name.value.trim().length < 2),
        setError(phone,   phoneIntl === null),
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
        'الهاتف: ' + formatJordanMobile(phoneIntl),
        email.value.trim() ? 'البريد: ' + email.value.trim() : null,
        'الخدمة المطلوبة: ' + service.value,
        budget && budget.value ? 'الميزانية: ' + budget.value : null,
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
  }

  /* ------------------------------------------------------------------
     6) زر واتساب العائم
     ------------------------------------------------------------------ */
  const whatsappFloat = document.getElementById('whatsappFloat');
  if (whatsappFloat) {
    whatsappFloat.href =
      'https://wa.me/' + CONFIG.whatsappNumber + '?text=' + encodeURIComponent(CONFIG.whatsappGreeting);
  }

  /* ------------------------------------------------------------------
     7) زر العودة إلى الأعلى
     ------------------------------------------------------------------ */
  const toTop = document.getElementById('toTop');

  if (toTop) {
    toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

    const onScroll = () => toTop.classList.toggle('is-shown', window.scrollY > 500);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ------------------------------------------------------------------
     8) سنة حقوق النشر تتحدث تلقائيًا
     ------------------------------------------------------------------ */
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

});
