/**
 * Golden Maple - Before/After Slider
 * Lightweight, touch-enabled, no dependencies
 */
(function() {
  function initSlider(container) {
    if (!container) return;
    var inner = container.querySelector('.gm-ba-slider-inner');
    var afterImg = container.querySelector('.gm-ba-after');
    var handle = container.querySelector('.gm-ba-slider-handle');
    if (!inner || !afterImg || !handle) return;

    var pos = 50;
    var isDragging = false;

    function setPos(p) {
      pos = Math.max(0, Math.min(100, p));
      afterImg.style.clipPath = 'inset(0 0 0 ' + pos + '%)';
      handle.style.left = pos + '%';
    }

    function onMove(clientX) {
      if (!isDragging) return;
      var rect = container.getBoundingClientRect();
      var x = clientX - rect.left;
      setPos((x / rect.width) * 100);
    }

    handle.addEventListener('mousedown', function(e) {
      e.preventDefault();
      isDragging = true;
      document.body.style.cursor = 'ew-resize';
      document.body.style.userSelect = 'none';
    });
    document.addEventListener('mousemove', function(e) { onMove(e.clientX); });
    document.addEventListener('mouseup', function() {
      if (isDragging) {
        isDragging = false;
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      }
    });

    handle.addEventListener('touchstart', function(e) {
      e.preventDefault();
      isDragging = true;
    }, { passive: false });
    document.addEventListener('touchmove', function(e) {
      if (isDragging && e.touches[0]) onMove(e.touches[0].clientX);
    }, { passive: true });
    document.addEventListener('touchend', function() { isDragging = false; });

    container.addEventListener('click', function(e) {
      if (e.target === handle || handle.contains(e.target)) return;
      var rect = container.getBoundingClientRect();
      var x = e.clientX - rect.left;
      setPos((x / rect.width) * 100);
    });

    setPos(50);
  }

  function init() {
    document.querySelectorAll('.gm-ba-slider').forEach(initSlider);
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
