/* =========================================================
   CHAT UI FINAL FIX
   - Mobile keyboard safe
   - Desktop + mobile CTA wiring
   - Button styling match
   ========================================================= */

   document.addEventListener('DOMContentLoaded', function () {

    /* -------------------------------------------------------
       CHAT ELEMENTS
    ------------------------------------------------------- */
    const chatPanel   = document.getElementById('gm-chat-panel');
    const chatInput   = document.getElementById('gm-chat-input');
    const chatMessages = document.getElementById('gm-chat-messages');
    const chatToggle  = document.getElementById('gm-chat-toggle');
  
    if (!chatPanel || !chatInput || !chatMessages) return;
  
    /* -------------------------------------------------------
       MOBILE-SAFE CHAT LAYOUT (CSS injected once)
    ------------------------------------------------------- */
    if (!document.getElementById('gm-chat-final-css')) {
      const style = document.createElement('style');
      style.id = 'gm-chat-final-css';
      style.textContent = `
        #gm-chat-panel {
          display: flex;
          flex-direction: column;
          height: 100%;
          max-height: 100%;
          pointer-events: none;
        }
        #gm-chat-panel.is-open {
          pointer-events: auto;
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
  
        /* Ask About Our Process button styling */
        .ask-about-process,
        #ask-about-process {
          background-color: #d6b26e;
          color: #000;
          border: none;
          border-radius: 8px;
          padding: 14px 20px;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.2s ease;
        }
        .ask-about-process:hover,
        #ask-about-process:hover {
          background-color: #c9a65f;
        }
      `;
      document.head.appendChild(style);
    }
  
    /* -------------------------------------------------------
       MOBILE KEYBOARD STABILITY
    ------------------------------------------------------- */
    const isMobile = () =>
      /android|iphone|ipad|ipod/i.test(navigator.userAgent);
  
    chatInput.addEventListener('focus', () => {
      if (!isMobile()) return;
      setTimeout(() => {
        chatMessages.scrollTop = chatMessages.scrollHeight;
      }, 300);
    });
  
    chatInput.addEventListener('blur', () => {
      setTimeout(() => {
        window.scrollTo(0, 0);
      }, 100);
    });
  
    /* -------------------------------------------------------
       OPEN CHAT FUNCTION (USED EVERYWHERE)
    ------------------------------------------------------- */
    function openChat() {
      chatPanel.classList.add('is-open');
      chatPanel.setAttribute('aria-hidden', 'false');
  
      if (chatToggle) {
        chatToggle.setAttribute('aria-expanded', 'true');
      }
  
      setTimeout(() => {
        chatInput.focus();
        chatMessages.scrollTop = chatMessages.scrollHeight;
      }, 300);
    }
  
    /* -------------------------------------------------------
       ASK ABOUT OUR PROCESS BUTTON (DESKTOP + MOBILE)
    ------------------------------------------------------- */
    const processBtn = document.querySelector(
      '.ask-about-process, #ask-about-process'
    );
  
    if (processBtn) {
      processBtn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        openChat();
      });
    }
  
  });
  