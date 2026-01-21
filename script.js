/* =========================================================
   CHATBOT TOGGLE FIX - Production Safe
   ---------------------------------------------------------
   Robust open/close toggle for desktop and mobile
   ========================================================= */

(function() {
  'use strict';
  
  // Prevent duplicate initialization
  if (window.gmChatInitialized) return;
  window.gmChatInitialized = true;

  function initChat() {
    /* -------------------------------------------------------
       CHAT ELEMENTS - Safe Query
    ------------------------------------------------------- */
    const chatPanel = document.getElementById('gm-chat-panel');
    const chatInput = document.getElementById('gm-chat-input');
    const chatMessages = document.getElementById('gm-chat-messages');
    const chatToggle = document.getElementById('gm-chat-toggle');
  
    // Exit gracefully if elements missing
    if (!chatPanel || !chatInput || !chatMessages || !chatToggle) {
      return;
    }

    /* -------------------------------------------------------
       Z-INDEX HARDENING - Ensure visibility above all content
    ------------------------------------------------------- */
    if (!document.getElementById('gm-chat-zindex-fix')) {
      const zIndexStyle = document.createElement('style');
      zIndexStyle.id = 'gm-chat-zindex-fix';
      zIndexStyle.textContent = `
        #gm-chat-widget {
          position: fixed;
          z-index: 9999 !important;
        }
        #gm-chat-panel {
          position: fixed;
          z-index: 9999 !important;
        }
      `;
      document.head.appendChild(zIndexStyle);
    }
  
    /* -------------------------------------------------------
       MOBILE-SAFE CHAT LAYOUT (CSS injected once)
    ------------------------------------------------------- */
    if (!document.getElementById('gm-chat-final-css')) {
      const style = document.createElement('style');
      style.id = 'gm-chat-final-css';
      style.textContent = `
        #gm-chat-panel {
          display: flex !important;
          flex-direction: column;
          height: auto;
          max-height: 70vh;
          pointer-events: none;
        }
        #gm-chat-panel.is-open {
          pointer-events: auto !important;
          opacity: 1 !important;
          visibility: visible !important;
          display: flex !important;
        }
        #gm-chat-messages {
          flex: 1;
          overflow-y: auto;
          -webkit-overflow-scrolling: touch;
        }
        #gm-chat-input {
          font-size: 16px;
        }
      `;
      document.head.appendChild(style);
    }
  
    /* -------------------------------------------------------
       MOBILE KEYBOARD STABILITY
    ------------------------------------------------------- */
    const isMobile = () =>
      /android|iphone|ipad|ipod/i.test(navigator.userAgent);
  
    chatInput.addEventListener('focus', function() {
      if (!isMobile()) return;
      setTimeout(function() {
        if (chatMessages) {
          chatMessages.scrollTop = chatMessages.scrollHeight;
        }
      }, 300);
    });
  
    chatInput.addEventListener('blur', function() {
      if (!isMobile()) return;
      setTimeout(function() {
        window.scrollTo(0, 0);
      }, 100);
    });
  
    /* -------------------------------------------------------
       TOGGLE CHAT FUNCTION - ROBUST OPEN/CLOSE
    ------------------------------------------------------- */
    function toggleChat() {
      if (!chatPanel) return;

      const isOpen = chatPanel.classList.contains('is-open');
      
      if (isOpen) {
        // CLOSE
        chatPanel.classList.remove('is-open');
        chatPanel.setAttribute('aria-hidden', 'true');
        chatPanel.style.opacity = '0';
        chatPanel.style.visibility = 'hidden';
        chatPanel.style.pointerEvents = 'none';
        
        if (chatToggle) {
          chatToggle.setAttribute('aria-expanded', 'false');
        }
      } else {
        // OPEN
        chatPanel.classList.add('is-open');
        chatPanel.setAttribute('aria-hidden', 'false');
        chatPanel.style.display = 'flex';
        chatPanel.style.opacity = '1';
        chatPanel.style.visibility = 'visible';
        chatPanel.style.pointerEvents = 'auto';
        
        if (chatToggle) {
          chatToggle.setAttribute('aria-expanded', 'true');
        }
  
        setTimeout(function() {
          if (chatInput) {
            chatInput.focus();
          }
          if (chatMessages) {
            chatMessages.scrollTop = chatMessages.scrollHeight;
          }
        }, 300);
      }
    }

    // Expose toggle function globally for inline handlers
    window.toggleChat = toggleChat;
  
    /* -------------------------------------------------------
       BUTTON WIRING - Primary Toggle Button
    ------------------------------------------------------- */
    chatToggle.removeEventListener('click', toggleChat);
    chatToggle.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      toggleChat();
    });
  
    /* -------------------------------------------------------
       ADDITIONAL CTA BUTTONS - Wire to toggle
    ------------------------------------------------------- */
    const additionalCtas = document.querySelectorAll('.ask-about-process, #ask-about-process');
    additionalCtas.forEach(function(cta) {
      if (cta === chatToggle) return;
      
      cta.removeEventListener('click', toggleChat);
      cta.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        // Only open if closed
        if (!chatPanel.classList.contains('is-open')) {
          toggleChat();
        }
      });
    });
  }

  /* -------------------------------------------------------
     DOM READY SAFETY - Single initialization
  ------------------------------------------------------- */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initChat);
  } else {
    initChat();
  }

})();