// =============================================
//  IGLESIA LUZ Y VIDA — SCRIPTS
// =============================================

// ── Sticky header shadow on scroll ──
const header = document.getElementById('site-header');
window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 20);
});

// ── Mobile nav toggle ──
const navToggle = document.getElementById('nav-toggle');
const mainNav   = document.getElementById('main-nav');

navToggle.addEventListener('click', () => {
  const open = mainNav.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', open);
});

// Close mobile nav when a link is clicked
mainNav.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    mainNav.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  });
});

// ── Smooth active nav link highlighting ──
const sections = document.querySelectorAll('section[id]');
const navLinks  = document.querySelectorAll('.main-nav a');

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(link => {
        link.classList.toggle(
          'active',
          link.getAttribute('href') === '#' + entry.target.id
        );
      });
    }
  });
}, { rootMargin: '-40% 0px -55% 0px' });

sections.forEach(s => observer.observe(s));

// ── Contact form (demo handler) ──
const form    = document.getElementById('contact-form');
const success = document.getElementById('form-success');

form.addEventListener('submit', e => {
  e.preventDefault();

  // Basic validation
  const name    = form.name.value.trim();
  const email   = form.email.value.trim();
  const message = form.message.value.trim();

  if (!name || !email || !message) {
    alert('Por favor complete todos los campos requeridos.');
    return;
  }

  // Simulate a send — replace with real backend / mailto / Formspree etc.
  const btn = form.querySelector('button[type="submit"]');
  btn.disabled = true;
  btn.textContent = 'Enviando…';

  setTimeout(() => {
    form.reset();
    btn.disabled = false;
    btn.textContent = 'Enviar Mensaje';
    success.hidden = false;
    setTimeout(() => { success.hidden = true; }, 5000);
  }, 900);
});

// ── Hero background slideshow ──
(function () {
  const slides = Array.from(document.querySelectorAll('.hero-slide'));
  if (!slides.length) return;

  const TOTAL       = slides.length;  // 5 images
  const HOLD_MS     = 4000;           // seconds each image stays on screen
  const ENTER_MS    = 480;            // fast slide-in from right
  const EXIT_MS     = 480;            // fast slide-out to left
  const FIRST_DELAY = 700;            // wait before very first image enters
  const MAX_CYCLES  = 3;              // stop on slide 1 after this many full loops

  let current    = -1;   // nothing visible yet
  let cyclesDone = 0;
  let finished   = false;

  // Park all slides off-screen to the right
  slides.forEach(s => {
    s.style.transition = 'none';
    s.style.transform  = 'translateX(100%)';
  });

  function showNext() {
    if (finished) return;

    const prevIndex = current;
    current = (current + 1) % TOTAL;

    // Completed a full loop when we wrap back to slide 0
    if (current === 0 && prevIndex !== -1) {
      cyclesDone++;
      if (cyclesDone >= MAX_CYCLES) {
        finished = true;   // slide 0 will enter and stay forever
      }
    }

    const incoming = slides[current];
    const outgoing  = prevIndex >= 0 ? slides[prevIndex] : null;

    // ── ENTER: snap in from right ──
    incoming.style.transition = 'none';
    incoming.style.transform  = 'translateX(100%)';
    incoming.offsetWidth;                            // force reflow
    incoming.style.transition = `transform ${ENTER_MS}ms cubic-bezier(0.16, 1, 0.3, 1)`;
    incoming.style.transform  = 'translateX(0)';

    // ── EXIT: snap out to left (simultaneous) ──
    if (outgoing) {
      outgoing.style.transition = `transform ${EXIT_MS}ms cubic-bezier(0.7, 0, 0.84, 0)`;
      outgoing.style.transform  = 'translateX(-100%)';

      // Reset outgoing off-screen right after it fully exits (ready for reuse)
      setTimeout(() => {
        outgoing.style.transition = 'none';
        outgoing.style.transform  = 'translateX(100%)';
      }, EXIT_MS + 60);
    }

    // ── Schedule next transition (hold time + enter duration) ──
    if (!finished) {
      setTimeout(showNext, HOLD_MS + ENTER_MS);
    }
    // If finished, incoming (slide 0) simply stays on screen permanently
  }

  // Kick off the first slide after a short initial delay
  setTimeout(showNext, FIRST_DELAY);
})();

// ── Sermon YouTube thumbnails & embeds ──
// Accepts a full YouTube URL (any format) or a bare 11-character video ID.
function extractYouTubeId(input) {
  const match = input.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/))([A-Za-z0-9_-]{11})/
  );
  return match ? match[1] : input.trim();
}

document.querySelectorAll('.sermon-video-wrap').forEach(wrap => {
  const raw = (wrap.dataset.yt || '').trim();
  const id  = extractYouTubeId(raw);

  // Skip cards that still have the placeholder text
  if (!id || id.toUpperCase().startsWith('PEGA')) return;

  // Build thumbnail with play overlay
  wrap.innerHTML = `
    <img src="https://img.youtube.com/vi/${id}/hqdefault.jpg"
         alt="Ver sermón" loading="lazy" />
    <div class="sermon-play-overlay"><span>&#9654;</span></div>`;

  // On click: swap thumbnail for the live iframe
  wrap.addEventListener('click', () => {
    wrap.innerHTML = `<iframe
      src="https://www.youtube.com/embed/${id}?autoplay=1&rel=0"
      allow="autoplay; encrypted-media; picture-in-picture"
      allowfullscreen
      title="Sermón"></iframe>`;
    wrap.style.cursor = 'default';
  }, { once: true });
});

// ── Fade-in on scroll ──
const fadeEls = document.querySelectorAll(
  '.sermon-card, .welcome-item, .pastor-card, .schedule-card, .location-card, .contact-form'
);

const fadeObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity  = '1';
      entry.target.style.transform = 'translateY(0)';
      fadeObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

fadeEls.forEach(el => {
  el.style.opacity    = '0';
  el.style.transform  = 'translateY(24px)';
  el.style.transition = 'opacity .55s ease, transform .55s ease';
  fadeObserver.observe(el);
});
