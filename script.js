window.CHAT_DISABLED = true;

(function () {
  var key = 'gm_urgency_bar_dismissed';
  var bar = document.getElementById('gm-urgency-bar');
  if (!bar) return;
  try {
    if (localStorage.getItem(key) === '1') {
      bar.classList.add('hidden');
      return;
    }
  } catch (e) { }
  var closeBtn = bar.querySelector('.gm-urgency-bar-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', function () {
      bar.classList.add('hidden');
      try { localStorage.setItem(key, '1'); } catch (e) { }
    });
  }
  var link = bar.querySelector('a');
  if (link && link.getAttribute('href')) {
    link.addEventListener('click', function (e) {
      var href = link.getAttribute('href');
      if (href && href.indexOf('#') > -1) {
        var id = href.split('#')[1];
        var el = document.getElementById(id);
        if (el) {
          e.preventDefault();
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    });
  }
})();

document.addEventListener('DOMContentLoaded', () => {
  const triggers = document.querySelectorAll('.faq-trigger');
  if (triggers.length) {
    triggers.forEach(trigger => {
      if (trigger.dataset.faqBound === 'true') return;
      trigger.dataset.faqBound = 'true';

      const item = trigger.closest('.faq-item');
      if (!item) return;
      const content = item.querySelector('.faq-answer, .faq-content');
      if (!content) return;

      trigger.setAttribute('aria-expanded', 'false');
      content.setAttribute('aria-hidden', 'true');

      trigger.addEventListener('click', event => {
        event.preventDefault();
        const isActive = item.classList.toggle('active');
        content.classList.toggle('active', isActive);
        trigger.setAttribute('aria-expanded', String(isActive));
        content.setAttribute('aria-hidden', String(!isActive));

        const icon = trigger.querySelector('.faq-icon');
        if (icon) {
          icon.textContent = isActive ? '-' : '+';
        }
      });
    });
  }

  // Mobile dropdown toggle for Services and Resources on mobile/tablet
  const isMobile = window.innerWidth < 900;
  if (isMobile) {
    const navDropdowns = document.querySelectorAll('.desktop-nav .nav-dropdown');
    navDropdowns.forEach(dropdown => {
      const trigger = dropdown.querySelector('a');
      if (trigger && !trigger.dataset.dropdownBound) {
        trigger.dataset.dropdownBound = 'true';
        trigger.addEventListener('click', (e) => {
          e.preventDefault();
          dropdown.classList.toggle('active');
        });
      }
    });
  }

  const mobileToggleAg = document.querySelector('.mobile-toggle-ag');
  const mobileToggleLegacy = document.querySelector('.mobile-toggle');
  const mobileMenu = document.querySelector('.mobile-menu-overlay');
  const servicesTrigger = document.getElementById('mobile-services-trigger');
  const servicesWrap = document.querySelector('.mobile-nav-services-wrap');
  const servicesPanel = document.getElementById('mobile-services-panel');

  function closeMobileMenu() {
    if (mobileMenu) mobileMenu.classList.remove('active');
    if (mobileToggleAg) mobileToggleAg.setAttribute('aria-expanded', 'false');
    if (mobileToggleLegacy) mobileToggleLegacy.setAttribute('aria-expanded', 'false');
    if (mobileMenu) mobileMenu.setAttribute('aria-hidden', 'true');
    if (servicesWrap) {
      servicesWrap.classList.remove('is-open');
      if (servicesTrigger) servicesTrigger.setAttribute('aria-expanded', 'false');
      if (servicesPanel) servicesPanel.setAttribute('aria-hidden', 'true');
    }
  }

  function openMobileMenu() {
    if (mobileMenu) {
      mobileMenu.classList.add('active');
      mobileMenu.setAttribute('aria-hidden', 'false');
    }
    if (mobileToggleAg) mobileToggleAg.setAttribute('aria-expanded', 'true');
    if (mobileToggleLegacy) mobileToggleLegacy.setAttribute('aria-expanded', 'true');
    if (servicesWrap) {
      servicesWrap.classList.remove('is-open');
      if (servicesTrigger) servicesTrigger.setAttribute('aria-expanded', 'false');
      if (servicesPanel) servicesPanel.setAttribute('aria-hidden', 'true');
    }
  }

  function toggleMenu(event) {
    if (event) event.preventDefault();
    if (mobileMenu && mobileMenu.classList.contains('active')) {
      closeMobileMenu();
    } else {
      openMobileMenu();
    }
  }

  if (mobileToggleAg) mobileToggleAg.addEventListener('click', toggleMenu);
  if (mobileToggleLegacy) mobileToggleLegacy.addEventListener('click', toggleMenu);

  if (mobileMenu) {
    closeMobileMenu();
    if (servicesTrigger && servicesWrap && servicesPanel) {
      servicesTrigger.addEventListener('click', () => {
        const isOpen = servicesWrap.classList.toggle('is-open');
        servicesTrigger.setAttribute('aria-expanded', String(isOpen));
        servicesPanel.setAttribute('aria-hidden', String(!isOpen));
      });
    }

    mobileMenu.addEventListener('click', event => {
      if (event.target.closest('[data-close-menu]')) {
        closeMobileMenu();
      }
    });
  }

  if (window.CHAT_DISABLED) return;

  const panel = document.getElementById('gm-chat-panel');
  const toggle = document.getElementById('gm-chat-toggle');
  const input = document.getElementById('gm-chat-input');
  const send = document.getElementById('gm-chat-send');
  const messages = document.getElementById('gm-chat-messages');
  const ctas = document.querySelectorAll('.ask-about-process');
  const closeBtn = document.getElementById('gm-chat-close');

  if (!panel || !toggle || !input || !send || !messages) return;

  let openedOnce = false;

  function openChat() {
    panel.classList.add('is-open');
    panel.setAttribute('aria-hidden', 'false');
    document.body.classList.add('chat-open');
    input.focus();

    if (!openedOnce) {
      const welcome = document.createElement('div');
      welcome.className = 'gm-chat-message bot';
      welcome.textContent = '👋 Welcome! How can we help with your project?';
      messages.appendChild(welcome);
      openedOnce = true;
    }
  }

  toggle.addEventListener('click', e => {
    e.preventDefault();
    openChat();
  });

  ctas.forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      openChat();
    });
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      panel.classList.remove('is-open');
      panel.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('chat-open');
    });
  }

  async function sendMessage() {
    const text = input.value.trim();
    if (!text) return;

    const user = document.createElement('div');
    user.className = 'gm-chat-message user';
    user.textContent = text;
    messages.appendChild(user);
    input.value = '';

    const res = await fetch('/.netlify/functions/gemini-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: [{ role: 'user', content: text }] })
    });

    const data = await res.json();
    const bot = document.createElement('div');
    bot.className = 'gm-chat-message bot';
    bot.textContent = data.reply || 'Sorry, something went wrong.';
    messages.appendChild(bot);
    messages.scrollTop = messages.scrollHeight;
  }

  send.addEventListener('click', sendMessage);
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      sendMessage();
    }
  });
});

/* Gallery Carousel (gallery page only) */
document.addEventListener('DOMContentLoaded', () => {
  const grid = document.getElementById('gm-gallery-grid');
  const carousel = document.getElementById('gm-gallery-carousel');
  const carouselImg = document.getElementById('gm-carousel-img');
  const carouselCounter = document.getElementById('gm-carousel-counter');
  const closeBtn = document.querySelector('.gm-carousel-close');
  const prevBtn = document.querySelector('.gm-carousel-prev');
  const nextBtn = document.querySelector('.gm-carousel-next');

  if (!grid || !carousel || !carouselImg) return;

  const items = grid.querySelectorAll('.gallery-item');
  const images = Array.from(items).map(btn => {
    const img = btn.querySelector('img');
    return img ? img.src : '';
  }).filter(Boolean);

  let currentIndex = 0;

  function showImage(index) {
    if (index < 0) index = images.length - 1;
    if (index >= images.length) index = 0;
    currentIndex = index;
    carouselImg.src = images[currentIndex];
    carouselImg.alt = items[currentIndex]?.querySelector('img')?.alt || '';
    if (carouselCounter) carouselCounter.textContent = (currentIndex + 1) + ' / ' + images.length;
  }

  function openCarousel(index) {
    currentIndex = index;
    showImage(currentIndex);
    carousel.classList.add('is-open');
    carousel.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeCarousel() {
    carousel.classList.remove('is-open');
    carousel.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  items.forEach((btn, i) => {
    btn.addEventListener('click', () => openCarousel(i));
  });

  if (closeBtn) closeBtn.addEventListener('click', closeCarousel);
  if (prevBtn) prevBtn.addEventListener('click', () => showImage(currentIndex - 1));
  if (nextBtn) nextBtn.addEventListener('click', () => showImage(currentIndex + 1));

  carousel.addEventListener('click', (e) => {
    if (e.target === carousel) closeCarousel();
  });

  document.addEventListener('keydown', (e) => {
    if (!carousel.classList.contains('is-open')) return;
    if (e.key === 'Escape') closeCarousel();
    if (e.key === 'ArrowLeft') showImage(currentIndex - 1);
    if (e.key === 'ArrowRight') showImage(currentIndex + 1);
  });
});