/* ============================================
   HOPE STATION V2 — Main JavaScript
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  // ---- Page Loader ----
  const loader = document.querySelector('.page-loader');
  if (loader) {
    window.addEventListener('load', () => {
      setTimeout(() => loader.classList.add('loaded'), 300);
    });
    // Fallback if load fires before DOMContentLoaded listener
    if (document.readyState === 'complete') {
      setTimeout(() => loader.classList.add('loaded'), 300);
    }
  }

  // ---- Mobile Navigation ----
  const hamburger = document.querySelector('.nav__hamburger');
  const mobileMenu = document.querySelector('.mobile-menu');
  const overlay = document.querySelector('.mobile-overlay');

  function closeMobile() {
    hamburger?.classList.remove('open');
    mobileMenu?.classList.remove('open');
    overlay?.classList.remove('open');
    document.body.style.overflow = '';
  }

  hamburger?.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.toggle('open');
    hamburger.classList.toggle('open');
    overlay.classList.toggle('open');
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  overlay?.addEventListener('click', closeMobile);
  mobileMenu?.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMobile));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMobile(); });

  // ---- Sticky Header ----
  const nav = document.querySelector('.nav');
  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (y > 60) {
      nav?.classList.add('scrolled');
    } else {
      nav?.classList.remove('scrolled');
    }
    lastScroll = y;
  }, { passive: true });

  // ---- Hero Loaded (slow zoom) ----
  const hero = document.querySelector('.hero');
  if (hero) {
    window.addEventListener('load', () => {
      setTimeout(() => hero.classList.add('loaded'), 100);
    });
    if (document.readyState === 'complete') {
      setTimeout(() => hero.classList.add('loaded'), 100);
    }
  }

  // ---- Scroll Reveal ----
  const reveals = document.querySelectorAll('.reveal');
  if (reveals.length && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(el => observer.observe(el));
  } else {
    reveals.forEach(el => el.classList.add('visible'));
  }

  // ---- FAQ Accordion ----
  document.querySelectorAll('.faq-item__question').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      const answer = item.querySelector('.faq-item__answer');
      const isActive = item.classList.contains('active');

      // Close all
      document.querySelectorAll('.faq-item').forEach(i => {
        i.classList.remove('active');
        i.querySelector('.faq-item__answer').style.maxHeight = null;
      });

      // Open clicked (if was closed)
      if (!isActive) {
        item.classList.add('active');
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });

    // Keyboard support
    btn.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        btn.click();
      }
    });
  });

  // ---- Active Nav Link ----
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav__links a, .mobile-menu a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      a.classList.add('active');
    }
  });

  // ---- Smooth Scroll ----
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const offset = nav?.offsetHeight || 80;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  // ---- Toast Notifications ----
  window.showToast = function(message, type = 'success') {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = `toast ${type === 'error' ? 'toast--error' : ''}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    requestAnimationFrame(() => toast.classList.add('show'));
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 400);
    }, 4000);
  };

  // ---- Contact Form ----
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const data = Object.fromEntries(new FormData(contactForm));
      const btn = contactForm.querySelector('button[type="submit"]');
      const originalText = btn.textContent;

      // Basic validation
      if (!data.name?.trim() || !data.email?.trim() || !data.message?.trim()) {
        showToast('Please fill in all required fields.', 'error');
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        showToast('Please enter a valid email address.', 'error');
        return;
      }

      btn.textContent = 'Sending...';
      btn.disabled = true;

      try {
        const config = window.HOPESTATION_CONFIG || {};
        if (config.airtableToken && config.airtableBaseId) {
          await fetch(`https://api.airtable.com/v0/${config.airtableBaseId}/${encodeURIComponent(config.airtableTableName || 'Enquiries')}`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${config.airtableToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              fields: {
                Name: data.name,
                Email: data.email,
                Phone: data.phone || '',
                Message: data.message,
                Source: 'Website Contact Form',
                Status: 'New',
                'Created At': new Date().toISOString(),
              }
            })
          });
        }
        contactForm.reset();
        showToast('Message sent successfully. We\'ll be in touch soon.');
      } catch (err) {
        // Fallback: mailto
        const subject = encodeURIComponent('Website Enquiry from ' + data.name);
        const body = encodeURIComponent(`Name: ${data.name}\nEmail: ${data.email}\nPhone: ${data.phone || 'N/A'}\n\n${data.message}`);
        window.location.href = `mailto:info@hopestation.co.za?subject=${subject}&body=${body}`;
        showToast('Opening your email client...');
      } finally {
        btn.textContent = originalText;
        btn.disabled = false;
      }
    });
  }
});
