/* ==========================================================================
   الأصيل للبرمجيات — ملف التفاعل
   كل قسم هنا مستقل عن غيره، فتستطيع تعديله أو حذفه بأمان.
   ========================================================================== */

/* ===== الإعدادات — عدّل هذه القيم فقط ===== */
const CONFIG = {
  // رقم الواتساب بصيغة دولية: رمز الدولة + الرقم، بدون + وبدون صفر أول وبدون مسافات
  whatsappNumber: '962772499064',
  // الرسالة التي تظهر عند الضغط على زر واتساب العائم
  whatsappGreeting: 'مرحبًا، أرغب في الاستفسار عن خدمات الأصيل للبرمجيات 👋'
};

document.addEventListener('DOMContentLoaded', () => {

  /* ------------------------------------------------------------------
     0) مؤشر الفأرة المخصص (نقطة + حلقة تتبعها بتأخير)
        يعمل فقط على الأجهزة التي فيها فأرة حقيقية — لا على الجوال واللمس.
     ------------------------------------------------------------------ */
  const hasMouse = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const calmMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (hasMouse && !calmMotion) {
    const dot  = document.createElement('div');
    const ring = document.createElement('div');
    dot.className = 'cursor-dot';
    ring.className = 'cursor-ring';
    document.body.append(dot, ring);

    /* ملاحظة مهمة: لا نُخفي مؤشر الفأرة الأصلي إلا بعد أن يظهر المؤشر المخصص
       فعلًا ويستقر في مكانه. لو أخفيناه من البداية وحدث أي خلل، سيبقى الزائر
       بلا أي مؤشر على الإطلاق — وهذا أسوأ من عدم وجود مؤشر مخصص أصلًا. */
    let cursorReady = false;

    let mouseX = 0, mouseY = 0;   // مكان الفأرة الحقيقي
    let ringX  = 0, ringY  = 0;   // مكان الحلقة (يلحق بالفأرة تدريجيًا)

    /* معايرة نقطة الصفر.
       في الصفحة العربية يقع شريط التمرير على اليسار، فيصبح موضع
       "top:0 left:0" مزاحًا عن الصفر بمقدار عرض الشريط. بدل تخمين هذا
       المقدار نقيسه مرة واحدة من المتصفح نفسه، فيضبط الكود نفسه على أي جهاز. */
    let originX = 0, originY = 0;

    const calibrate = () => {
      dot.style.transform = 'translate3d(0px,0px,0)';
      const box = dot.getBoundingClientRect();
      originX = box.left;
      originY = box.top;
    };
    calibrate();
    window.addEventListener('resize', calibrate);

    /* نضع العنصر عند إحداثيات الفأرة ثم نُرجعه نصف حجمه بـ translate(-50%,-50%)،
       فيبقى مركزه على الفأرة تمامًا مهما تغيّر حجمه (كتضخّم الحلقة فوق الأزرار). */
    const placeAt = (el, x, y) =>
      el.style.transform = 'translate3d(' + (x - originX) + 'px,' + (y - originY) + 'px,0) translate(-50%,-50%)';

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      placeAt(dot, mouseX, mouseY);
      dot.classList.add('is-on');
      ring.classList.add('is-on');

      // تحقّق مرة واحدة أن النقطة رُسمت فعلًا تحت الفأرة، ثم أخفِ المؤشر الأصلي
      if (!cursorReady) {
        const box = dot.getBoundingClientRect();
        const onTarget = Math.abs(box.left + box.width / 2 - mouseX) < 6 &&
                         Math.abs(box.top + box.height / 2 - mouseY) < 6;
        if (onTarget) {
          document.body.classList.add('has-custom-cursor');
          cursorReady = true;
        }
      }
    });

    // الحلقة تتحرك 15% من المسافة في كل إطار، فتبدو وكأنها تسبح خلف الفأرة
    const followMouse = () => {
      ringX += (mouseX - ringX) * 0.15;
      ringY += (mouseY - ringY) * 0.15;
      placeAt(ring, ringX, ringY);
      requestAnimationFrame(followMouse);
    };
    followMouse();

    // تكبُر الحلقة فوق أي عنصر قابل للضغط
    const clickable = 'a, button, input, select, textarea, .showcase__dot, .faq-q';
    document.addEventListener('mouseover', (e) => ring.classList.toggle('is-hot', !!e.target.closest(clickable)));

    // أخفِ المؤشر عند خروج الفأرة من النافذة
    document.addEventListener('mouseleave', () => {
      dot.classList.remove('is-on');
      ring.classList.remove('is-on');
    });
  }

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
     6) عارض شرائح الأعمال في الواجهة الرئيسية
     ------------------------------------------------------------------ */
  const showcase = document.getElementById('showcase');

  if (showcase) {
    const slides = [...showcase.querySelectorAll('.slide')];
    const dots   = [...showcase.querySelectorAll('.showcase__dot')];
    const DELAY  = 4500;               // مدة بقاء كل صورة بالميلي ثانية
    let index = 0, timer = null;

    // هل طلب المستخدم تقليل الحركة من إعدادات جهازه؟ عندها لا نشغّل التبديل التلقائي
    const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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

    // تحميل تدريجي: الصورة الأولى فقط تُحمَّل مع الصفحة، والباقي عند الحاجة.
    // السبب: الصور كبيرة، وتحميلها كلها دفعة واحدة يُبطئ فتح الموقع.
    const loadImage = (i) => {
      const img = slides[i % slides.length].querySelector('img[data-src]');
      if (!img) return;
      img.src = img.dataset.src;
      img.removeAttribute('data-src');
    };

    const play  = () => { if (!calm) timer = setInterval(() => show(index + 1), DELAY); };
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
    const STEP = 150;                  // كم بكسل تمرير تحتاج لتبديل شريحة

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
     7) صور معرض الأعمال: احذف الصورة إذا لم يوجد ملفها
        الفائدة: يظهر الرسم التوضيحي مكانها بدل أيقونة الصورة المكسورة،
        فيبقى الموقع مرتبًا قبل أن تضع صورك الحقيقية في مجلد assets/works.
     ------------------------------------------------------------------ */
  document.querySelectorAll('.work__thumb img').forEach(img => {
    // الحالة الأولى: المتصفح حاول التحميل وفشل قبل تشغيل هذا الكود
    if (img.complete && img.naturalWidth === 0) {
      img.remove();
      return;
    }
    // الحالة الثانية: الملف ما زال قيد التحميل — ننتظر نتيجة المحاولة
    img.addEventListener('error', () => img.remove());
  });

  /* ------------------------------------------------------------------
     8) تصفية معرض الأعمال حسب التصنيف
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
     9) الأسئلة الشائعة (فتح وإغلاق)
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
     10) أزرار الباقات: تختار الباقة تلقائيًا في النموذج
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
     11) نموذج التواصل: تحقق من البيانات ثم فتح واتساب
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
    // حقل اختياري: قد يكون محذوفًا من الصفحة، لذلك نتحقق من وجوده أولًا
    const budget  = form.budget || null;
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

  /* ------------------------------------------------------------------
     12) زر واتساب العائم
     ------------------------------------------------------------------ */
  document.getElementById('whatsappFloat').href =
    'https://wa.me/' + CONFIG.whatsappNumber + '?text=' + encodeURIComponent(CONFIG.whatsappGreeting);

  /* ------------------------------------------------------------------
     13) زر العودة إلى الأعلى
     ------------------------------------------------------------------ */
  const toTop = document.getElementById('toTop');
  toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  /* ------------------------------------------------------------------
     14) سنة حقوق النشر تتحدث تلقائيًا
     ------------------------------------------------------------------ */
  document.getElementById('year').textContent = new Date().getFullYear();

  /* ------------------------------------------------------------------
     تشغيل مستمع التمرير (في النهاية حتى تكون كل العناصر جاهزة)
     ------------------------------------------------------------------ */
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
});
