// =========================================================
// GOLDEN MAPLE CHAT: Minimal, single-controller implementation

(function() {
  // Element selectors
  const PANEL_ID = 'gm-chat-panel';
  const TOGGLE_ID = 'gm-chat-toggle';
  const INPUT_ID = 'gm-chat-input';
  const SEND_ID = 'gm-chat-send';
  const MESSAGES_ID = 'gm-chat-messages';
  const WELCOME_KEY = 'gm-chat-welcome-shown';

  let chatPanel, chatToggle, chatInput, chatSend, chatMessages;
  let welcomeShown = false;

  function getElements() {
    chatPanel    = document.getElementById(PANEL_ID);
    chatToggle   = document.getElementById(TOGGLE_ID);
    chatInput    = document.getElementById(INPUT_ID);
    chatSend     = document.getElementById(SEND_ID);
    chatMessages = document.getElementById(MESSAGES_ID);
  }

  function appendMessage({ text, from = 'bot', extraClass = '' }) {
    if (!chatMessages) return;
    const msg = document.createElement('div');
    msg.className = 'gm-chat-message ' +
      (from === 'user' ? 'gm-from-user' : 'gm-from-bot') +
      (extraClass ? ' ' + extraClass : '');
    msg.textContent = text;
    chatMessages.appendChild(msg);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function showWelcomeMessage() {
    if (welcomeShown) return;
    appendMessage({
      text: '👋 Welcome! How can I help you today?',
      from: 'bot',
      extraClass: 'gm-welcome'
    });
    welcomeShown = true;
  }

  function toggleChat() {
    if (!chatPanel) return;
    chatPanel.classList.toggle('is-open');
    if (chatPanel.classList.contains('is-open')) {
      showWelcomeMessage();
      setTimeout(() => { chatInput && chatInput.focus(); }, 250);
    }
  }

  async function sendMessage() {
    if (!chatInput || !chatMessages) return;
    const text = chatInput.value.trim();
    if (!text) return;
    // Show user message immediately
    appendMessage({ text, from: 'user' });
    chatInput.value = '';
    chatInput.focus();

    try {
      // NOTE: Use existing backend endpoint; keep API call unchanged.
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text })
      });
      let botText = '...';
      if (res.ok) {
        const data = await res.json();
        botText = data.reply ? data.reply : 'Sorry, no reply.';
      } else {
        botText = 'Sorry, there was a problem. Please try again.';
      }
      appendMessage({ text: botText, from: 'bot' });
    } catch (err) {
      appendMessage({ text: 'Error: Unable to get reply.', from: 'bot' });
    }
  }

  function preventFormSubmission() {
    if (!chatInput) return;
    const form = chatInput.closest('form');
    if (form) {
      form.addEventListener('submit', function(e) { e.preventDefault(); });
    }
  }

  function initChat() {
    getElements();
    if (!(chatPanel && chatToggle && chatInput && chatSend && chatMessages)) return;

    // Toggle button
    chatToggle.addEventListener('click', function(e) {
      e.preventDefault();
      toggleChat();
    });

    // Send button
    chatSend.addEventListener('click', function(e) {
      e.preventDefault();
      sendMessage();
    });

    // Prevent <form> submission if input is in a form
    preventFormSubmission();

    // Enter (no Shift) sends
    chatInput.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initChat);
  } else {
    initChat();
  }
})();
   // Utility: Get the true chat messages container safely and log fallback errors
   function getChatMessagesContainer() {
     const el = document.getElementById('gm-chat-messages');
     if (!el) {
       // Fallback error log and visible message for devs
       console.error('[GM-CHAT] Could not find chat messages container (#gm-chat-messages).');
       const errDiv = document.createElement('div');
       errDiv.style.color = 'red';
       errDiv.style.fontWeight = 'bold';
       errDiv.textContent = 'Error: Chat not available (missing #gm-chat-messages).';
       document.body.appendChild(errDiv);
     }
     return el;
   }

   // Append ANY message (bot, user, system) to the correct messages container
   function appendMessage({ text, from = 'bot', extraClass = '' }) {
     const chatMessages = getChatMessagesContainer();
     if (!chatMessages) return;

     const msgEl = document.createElement('div');
     msgEl.className = 'gm-chat-message ' + (from === 'user' ? 'gm-from-user' : 'gm-from-bot') + (extraClass ? ' ' + extraClass : '');
     msgEl.textContent = text;
     chatMessages.appendChild(msgEl);
     chatMessages.scrollTop = chatMessages.scrollHeight;
   }

   // Show guaranteed welcome message (only once)
   function showWelcomeMessageIfNeeded() {
     const chatMessages = getChatMessagesContainer();
     if (!chatMessages) return;
     if (!chatMessages.dataset.gmWelcomeShown) {
       appendMessage({ text: '👋 Welcome! How can I help you today?', from: 'bot', extraClass: 'gm-welcome' });
       chatMessages.dataset.gmWelcomeShown = '1';
     }
   }

   // Core send function (safely handles user input)
   function sendMessage(e) {
     if (e) e.preventDefault();

     const chatInput = document.getElementById('gm-chat-input');
     const chatMessages = getChatMessagesContainer();
     if (!chatInput || !chatMessages) {
       console.warn('[GM-CHAT] Missing input or messages container.');
       return;
     }

     const userText = chatInput.value.trim();
     if (!userText) return;

     // Immediately display user message
     appendMessage({ text: userText, from: 'user' });

     chatInput.value = '';
     chatInput.focus();

     if (typeof window.gmHandleSendMessage === 'function') {
       window.gmHandleSendMessage(userText);
     }
   }

   // Setup all chat input UI interactions using event delegation & guards
   function wireSendButtonAndInput() {
     const chatInput = document.getElementById('gm-chat-input');
     const chatSend = document.getElementById('gm-chat-send');

     // Defensive: both input and send button must exist
     if (!chatInput || !chatSend) {
       console.warn('[GM-CHAT] Missing #gm-chat-input or #gm-chat-send in DOM.');
       return;
     }

     // (5) Prevent form submission reloading page
     const sendForm = chatSend.closest('form');
     if (sendForm && !sendForm.dataset.gmSubmitWired) {
       sendForm.addEventListener('submit', function(e) {
         e.preventDefault();
         sendMessage(e);
       });
       sendForm.dataset.gmSubmitWired = '1';
     }

     // (4) Use event delegation via parent for send button click for robustness
     const parent = chatSend.parentElement || document;
     if (!parent.dataset.gmDelegated) {
       parent.addEventListener('click', function(e) {
         // Allow for dynamic DOM: always query fresh
         const liveSendBtn = document.getElementById('gm-chat-send');
         if (
           (e.target === liveSendBtn) ||
           (e.target && liveSendBtn && e.target.closest && e.target.closest('#gm-chat-send'))
         ) {
           e.preventDefault();
           sendMessage(e);
         }
       });
       parent.dataset.gmDelegated = '1';
     }

     // (6) Enter key for sending, but not Shift+Enter
     if (!chatInput.dataset.gmEnterWired) {
       chatInput.addEventListener('keydown', function(e) {
         if (e.key === 'Enter' && !e.shiftKey) {
           e.preventDefault();
           sendMessage(e);
         }
       });
       chatInput.dataset.gmEnterWired = '1';
     }
   }

   // Guaranteed chat initialization: show welcome and wire up inputs
   function initChat() {
     showWelcomeMessageIfNeeded();
     wireSendButtonAndInput();
   }

   // Auto-initialize if chat panel is opened. Replace this with 
   // your existing chat "open" handler as needed:
   document.addEventListener('DOMContentLoaded', function() {
     initChat();
   });

   // If your chat is dynamically opened, call initChat() after opening panel.
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