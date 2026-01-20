/* === MOBILE CHAT FIX (SAFE FOR script.js) === */
document.addEventListener('DOMContentLoaded', function () {
  const input = document.getElementById('gm-chat-input');
  const messages = document.getElementById('gm-chat-messages');

  if (!input || !messages) return;

  // Inject required mobile CSS once
  if (!document.getElementById('gm-chat-mobile-fix')) {
    const style = document.createElement('style');
    style.id = 'gm-chat-mobile-fix';
    style.textContent = `
      #gm-chat-panel {
        display: flex;
        flex-direction: column;
        height: 100%;
        max-height: 100%;
      }
      #gm-chat-messages {
        flex: 1;
        overflow-y: auto;
        -webkit-overflow-scrolling: touch;
        padding: 16px;
      }
      #gm-chat-input-wrapper {
        position: relative;
        display: flex;
        gap: 8px;
        padding: 12px;
        background: #fff;
        border-top: 1px solid rgba(0,0,0,0.08);
        padding-bottom: calc(12px + env(safe-area-inset-bottom));
      }
      #gm-chat-input {
        font-size: 16px;
      }
    `;
    document.head.appendChild(style);
  }

  const isMobile = () =>
    /android|iphone|ipad|ipod/i.test(navigator.userAgent);

  // Scroll messages when keyboard opens
  input.addEventListener('focus', () => {
    if (!isMobile()) return;
    setTimeout(() => {
      messages.scrollTop = messages.scrollHeight;
    }, 300);
  });

  // Reset scroll when keyboard closes
  input.addEventListener('blur', () => {
    setTimeout(() => {
      window.scrollTo(0, 0);
    }, 100);
  });
});
