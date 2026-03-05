/**
 * Hope Station — Main JS
 * Handles: scroll reveals, counters, mobile nav, sticky nav, FAQ, contact form
 */

(function () {
  'use strict';

  // ─── Hero zoom effect ───
  const heroImg = document.getElementById('hero-img');
  if (heroImg) {
    if (heroImg.complete) {
      heroImg.classList.add('loaded');
    } else {
      heroImg.addEventListener('load', () => heroImg.classList.add('loaded'));
    }
  }

  // ─── Sticky nav on scroll ───
  const navbar = document.getElementById('navbar');
  if (navbar) {
    const onScroll = () => {
      navbar.classList.toggle('scrolled', window.scrollY > 60);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // ─── Mobile menu ───
  const menuToggle = document.getElementById('menu-toggle');
  const menuClose = document.getElementById('menu-close');
  const mobileMenu = document.getElementById('mobile-menu');

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', () => {
      mobileMenu.classList.remove('translate-x-full');
      document.body.style.overflow = 'hidden';
    });

    const closeMenu = () => {
      mobileMenu.classList.add('translate-x-full');
      document.body.style.overflow = '';
    };

    if (menuClose) menuClose.addEventListener('click', closeMenu);

    mobileMenu.querySelectorAll('.mobile-link').forEach(link => {
      link.addEventListener('click', closeMenu);
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !mobileMenu.classList.contains('translate-x-full')) {
        closeMenu();
      }
    });
  }

  // ─── Scroll reveal (IntersectionObserver) ───
  const revealEls = document.querySelectorAll('.reveal, .reveal-left');
  if (revealEls.length && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    revealEls.forEach((el) => observer.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('revealed'));
  }

  // ─── Animated counters ───
  const counters = document.querySelectorAll('.counter[data-target]');
  if (counters.length && 'IntersectionObserver' in window) {
    const counterObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target;
            const target = parseInt(el.dataset.target, 10);
            const duration = 1600;
            const start = performance.now();

            const animate = (now) => {
              const elapsed = now - start;
              const progress = Math.min(elapsed / duration, 1);
              const eased = 1 - Math.pow(1 - progress, 3);
              el.textContent = Math.round(target * eased);
              if (progress < 1) requestAnimationFrame(animate);
            };

            requestAnimationFrame(animate);
            counterObserver.unobserve(el);
          }
        });
      },
      { threshold: 0.5 }
    );
    counters.forEach((c) => counterObserver.observe(c));
  }

  // ─── FAQ accordion ───
  document.querySelectorAll('.faq-trigger').forEach((trigger) => {
    trigger.addEventListener('click', () => {
      const item = trigger.closest('.faq-item');
      const isOpen = item.classList.contains('active');

      // Close all
      document.querySelectorAll('.faq-item.active').forEach((open) => {
        open.classList.remove('active');
        open.querySelector('.faq-trigger').setAttribute('aria-expanded', 'false');
      });

      // Toggle clicked
      if (!isOpen) {
        item.classList.add('active');
        trigger.setAttribute('aria-expanded', 'true');
      }
    });
  });

  // ─── Smooth scroll for anchor links ───
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const offset = navbar ? navbar.offsetHeight : 0;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  // ─── Contact form ───
  const form = document.getElementById('contact-form');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      const origText = btn.textContent;
      btn.textContent = 'Sending...';
      btn.disabled = true;

      const data = Object.fromEntries(new FormData(form));

      try {
        // Try Airtable if config exists
        if (window.SITE_CONFIG && window.SITE_CONFIG.airtable && window.SITE_CONFIG.airtable.token) {
          const cfg = window.SITE_CONFIG.airtable;
          await fetch(`https://api.airtable.com/v0/${cfg.baseId}/${encodeURIComponent(cfg.tableName || 'Enquiries')}`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${cfg.token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              records: [{
                fields: {
                  Name: data.name,
                  Email: data.email,
                  Phone: data.phone || '',
                  'Event Type': data.event_type || '',
                  Message: data.message,
                  Source: 'Website',
                },
              }],
            }),
          });
        }

        // Success
        form.reset();
        btn.textContent = 'Sent!';
        btn.classList.remove('bg-green-700', 'hover:bg-green-600');
        btn.classList.add('bg-sage', 'text-green-900');
        showToast('Thank you! We\'ll be in touch within 24 hours.');
        setTimeout(() => {
          btn.textContent = origText;
          btn.disabled = false;
          btn.classList.add('bg-green-700', 'hover:bg-green-600');
          btn.classList.remove('bg-sage', 'text-green-900');
        }, 3000);
      } catch (err) {
        console.error('Form error:', err);
        btn.textContent = origText;
        btn.disabled = false;
        showToast('Something went wrong. Please try again or email us directly.', true);
      }
    });
  }

  // ─── Toast notification ───
  function showToast(message, isError) {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = `toast fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] px-6 py-3 rounded-xl text-sm font-medium shadow-xl transition-all duration-500 ${
      isError ? 'bg-red-600 text-white' : 'bg-green-800 text-white'
    }`;
    toast.textContent = message;
    document.body.appendChild(toast);

    requestAnimationFrame(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateX(-50%) translateY(0)';
    });

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(-50%) translateY(10px)';
      setTimeout(() => toast.remove(), 500);
    }, 4000);
  }
})();
