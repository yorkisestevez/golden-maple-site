document.addEventListener('DOMContentLoaded', () => {
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