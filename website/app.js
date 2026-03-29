/* ═══════════════════════════════════════════════════════════════
   Page Interactivity
   Scroll reveals · FAQ toggles · Mobile nav · Smooth scroll
   ═══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ── Scroll Reveal ──────────────────────────────────────────── */
  const reveals = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.12 });

  reveals.forEach((el) => observer.observe(el));

  /* ── FAQ Accordion ──────────────────────────────────────────── */
  document.querySelectorAll('.faq-question').forEach((btn) => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      const isOpen = item.classList.contains('open');

      // Close all
      document.querySelectorAll('.faq-item').forEach((i) => i.classList.remove('open'));

      // Toggle clicked
      if (!isOpen) item.classList.add('open');
    });
  });

  /* ── Mobile Nav ─────────────────────────────────────────────── */
  const toggle = document.querySelector('.nav-toggle');
  const links  = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      links.classList.toggle('open');
    });

    // Close on link click
    links.querySelectorAll('a').forEach((a) => {
      a.addEventListener('click', () => links.classList.remove('open'));
    });
  }

  /* ── Navbar scroll state ────────────────────────────────────── */
  const navbar = document.querySelector('.navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 60) {
      navbar.style.background = 'rgba(14, 17, 23, 0.92)';
    } else {
      navbar.style.background = 'rgba(14, 17, 23, 0.75)';
    }
  });

  /* ── Typing animation in hero ───────────────────────────────── */
  const typeTarget = document.querySelector('.type-text');
  if (typeTarget) {
    const text = typeTarget.dataset.text;
    typeTarget.textContent = '';
    let i = 0;
    function typeChar() {
      if (i < text.length) {
        typeTarget.textContent += text[i];
        i++;
        setTimeout(typeChar, 50);
      }
    }
    // Delay start so hero renders first
    setTimeout(typeChar, 800);
  }
})();
