/* =========================================================
   /* =========================================================
      CHAT SEND BUTTON FIX - Prevents No-Op on Click/Enter
      ---------------------------------------------------------
      Ensures sending works reliably on click and Enter.
      Appends user message immediately as a visible fallback.
   ========================================================= */

   // These will be safely used in initChat()
   function handleSend(e) {
     // Prevent form submit if inside <form>
     if (e) e.preventDefault();

     // Defensive: get elements each time, in case of DOM changes
     const chatInput = document.getElementById('gm-chat-input');
     const chatMessages = document.getElementById('gm-chat-messages');
     if (!chatInput || !chatMessages) return; // Guards

     const userText = chatInput.value.trim();
     if (!userText) return; // Exit if empty

     // Create user message element and append immediately (fallback)
     const userMsgEl = document.createElement('div');
     userMsgEl.className = 'gm-chat-message gm-from-user';
     userMsgEl.textContent = userText;
     chatMessages.appendChild(userMsgEl);

     // Scroll to bottom
     chatMessages.scrollTop = chatMessages.scrollHeight;

     // Clear input quickly for better UX
     chatInput.value = '';

     // The API call structure remains untouched, so we simply trigger the handler as before:
     if (typeof window.gmHandleSendMessage === 'function') {
       window.gmHandleSendMessage(userText);
     }
   }

   // Attach listeners and prevent duplicate handlers only if DOM is ready
   function wireSendButtonAndInput() {
     const chatInput = document.getElementById('gm-chat-input');
     const chatSend = document.getElementById('gm-chat-send');
     if (!chatInput || !chatSend) return;

     // Defensive: wrap send button inside form if exists
     const sendForm = chatSend.closest('form');
     if (sendForm) {
       sendForm.addEventListener('submit', function(e) {
         e.preventDefault();
         handleSend(e);
       });
     }

     // Remove any existing listeners to prevent double fires
     chatSend.removeEventListener('click', handleSend);
     chatSend.addEventListener('click', handleSend);

     // ENTER key on input triggers send (but not on Shift+Enter/multiline/IME composition)
     chatInput.removeEventListener('keydown', chatInput._gmSendKeyHandler || (()=>{}));
     chatInput._gmSendKeyHandler = function(e) {
       if (
         e.key === 'Enter' && !e.shiftKey && !e.isComposing &&
         !e.ctrlKey && !e.altKey && !e.metaKey
       ) {
         e.preventDefault();
         handleSend(e);
       }
     };
     chatInput.addEventListener('keydown', chatInput._gmSendKeyHandler);
   }

   // Patch the chat initialization to wire up send
   const _origInitChat = window.initChat;
   window.initChat = function() {
     if (typeof _origInitChat === "function") _origInitChat();
     wireSendButtonAndInput();
   };

   // If already initialized, wire immediately
   if (window.gmChatInitialized) {
     wireSendButtonAndInput();
   }

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