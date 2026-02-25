/**
 * Hero Slideshow - Auto-rotating image slides with dot navigation
 * Lightweight, no dependencies, touch-friendly
 */
(function() {
  'use strict';

  const INTERVAL_MS = 6000;
  const slides = document.querySelectorAll('.hero-slide');
  const dots = document.querySelectorAll('.hero-dot');
  if (!slides.length) return;

  let currentIndex = 0;
  let slideTimer = null;

  function goToSlide(index) {
    if (index < 0) index = slides.length - 1;
    if (index >= slides.length) index = 0;
    currentIndex = index;

    slides.forEach(function(s, i) {
      s.classList.toggle('active', i === currentIndex);
    });
    dots.forEach(function(d, i) {
      d.classList.toggle('active', i === currentIndex);
    });

    // Reset and animate progress bar
    const bar = document.querySelector('.hero-progress-bar');
    if (bar) {
      bar.style.transition = 'none';
      bar.style.width = '0%';
      // Force reflow
      void bar.offsetWidth;
      bar.style.transition = `width ${INTERVAL_MS}ms linear`;
      bar.style.width = '100%';
    }
  }

  function next() {
    goToSlide(currentIndex + 1);
  }

  function startTimer() {
    if (slideTimer) clearInterval(slideTimer);
    slideTimer = setInterval(function() {
      next();
    }, INTERVAL_MS);
  }

  function stopTimer() {
    if (slideTimer) {
      clearInterval(slideTimer);
      slideTimer = null;
    }
  }

  // Dot click
  dots.forEach(function(dot, i) {
    dot.addEventListener('click', function() {
      goToSlide(i);
      stopTimer();
      startTimer();
    });
  });

  function init() {
    goToSlide(0);
    startTimer();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
