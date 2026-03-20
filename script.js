/* ============================================================
   SYNAPTIVE — Main Script
   ============================================================ */

// ── Nav scroll state ──────────────────────────────────────────
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 24);
}, { passive: true });

// ── Mobile nav toggle ─────────────────────────────────────────
const toggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');

toggle?.addEventListener('click', () => {
  navLinks.classList.toggle('open');
  const isOpen = navLinks.classList.contains('open');
  toggle.setAttribute('aria-expanded', isOpen);
});

// Close mobile nav on link click
navLinks?.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => navLinks.classList.remove('open'));
});

// ── Scroll reveal ─────────────────────────────────────────────
const revealEls = document.querySelectorAll(
  '.stat, .problem-card, .pillar, .timeline-item, .team-card, .finding, .paper-card, .research-context'
);

revealEls.forEach(el => el.setAttribute('data-reveal', ''));

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        // Stagger within a parent group
        const siblings = [...entry.target.parentElement.querySelectorAll('[data-reveal]')];
        const idx = siblings.indexOf(entry.target);
        setTimeout(() => {
          entry.target.classList.add('revealed');
        }, idx * 80);
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
);

revealEls.forEach(el => observer.observe(el));

// ── Active nav link on scroll ─────────────────────────────────
const sections = document.querySelectorAll('section[id]');
const navAnchors = document.querySelectorAll('.nav-links a[href^="#"]');

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navAnchors.forEach(a => {
          a.classList.toggle('active', a.getAttribute('href') === `#${id}`);
        });
      }
    });
  },
  { rootMargin: '-40% 0px -55% 0px' }
);

sections.forEach(s => sectionObserver.observe(s));

// ── Smooth scroll polyfill for older Safari ──────────────────
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const offset = target.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: offset, behavior: 'smooth' });
    }
  });
});

// ── Formspree form submission ──────────────────────────────────
const FORMSPREE_URL = 'https://formspree.io/f/xeerdlle';

async function submitToFormspree(form, successId, errorId) {
  const btn = form.querySelector('button[type="submit"]');
  const originalText = btn.textContent;
  btn.disabled = true;
  btn.textContent = 'Sending…';

  const data = {};
  new FormData(form).forEach((val, key) => { data[key] = val; });

  try {
    const res = await fetch(FORMSPREE_URL, {
      method: 'POST',
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      form.reset();
      document.getElementById(successId).hidden = false;
      btn.textContent = 'Sent!';
    } else {
      document.getElementById(errorId).hidden = false;
      btn.disabled = false;
      btn.textContent = originalText;
    }
  } catch {
    document.getElementById(errorId).hidden = false;
    btn.disabled = false;
    btn.textContent = originalText;
  }
}

document.getElementById('adoptersForm')?.addEventListener('submit', e => {
  e.preventDefault();
  submitToFormspree(e.target, 'adopters-success', 'adopters-error');
});

document.getElementById('contactForm')?.addEventListener('submit', e => {
  e.preventDefault();
  submitToFormspree(e.target, 'contact-success', 'contact-error');
});

// ── Voices tab switching ───────────────────────────────────────
const voicesTabs   = document.querySelectorAll('.voices-tab');
const voicesPanels = document.querySelectorAll('.voices-panel');

voicesTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    const target = tab.dataset.tab;
    voicesTabs.forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
    voicesPanels.forEach(p => p.classList.remove('active'));
    tab.classList.add('active');
    tab.setAttribute('aria-selected', 'true');
    const panel = document.getElementById('tab-' + target);
    if (panel) panel.classList.add('active');
  });
});
