document.addEventListener('DOMContentLoaded', function () {
    /* 
     * Mobile Navigation Logic 
     */
    const mobileToggle = document.querySelector('.mobile-toggle');
    const mobileMenu = document.querySelector('.mobile-menu-overlay');

    if (mobileToggle && mobileMenu) {
        // Accessibility setup
        mobileToggle.setAttribute('aria-label', 'Toggle Navigation');
        mobileToggle.setAttribute('aria-expanded', 'false');

        // Toggle function
        function toggleMenu(forceClose = false) {
            const isActive = mobileMenu.classList.contains('active');

            if (isActive || forceClose) {
                mobileMenu.classList.remove('active');
                mobileToggle.setAttribute('aria-expanded', 'false');
                mobileToggle.innerHTML = '&#9776;'; // Hamburger
                document.body.style.overflow = ''; // Restore scroll
            } else {
                mobileMenu.classList.add('active');
                mobileToggle.setAttribute('aria-expanded', 'true');
                mobileToggle.innerHTML = '&times;'; // Close X
                document.body.style.overflow = 'hidden'; // Lock scroll
            }
        }

        // Event Listeners
        mobileToggle.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent immediate body click close
            toggleMenu();
        });

        const menuLinks = mobileMenu.querySelectorAll('a');
        menuLinks.forEach(link => {
            link.addEventListener('click', () => toggleMenu(true));
        });

        document.body.addEventListener('click', (e) => {
            if (mobileMenu.classList.contains('active') && !mobileMenu.contains(e.target) && e.target !== mobileToggle) {
                toggleMenu(true);
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && mobileMenu.classList.contains('active')) {
                toggleMenu(true);
            }
        });
    }

    /* 
     * Hero Slideshow Logic - Optimized Lazy Loading
     */
    const slides = document.querySelectorAll('.hero-slide');
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (slides.length > 1 && !prefersReducedMotion) {
        let currentSlide = 0;
        const intervalTime = 5000; // 5 seconds (2 seconds slower than before)

        // Helper function to ensure a slide is loaded
        const ensureSlideLoaded = (slide) => {
            const dataBg = slide.getAttribute('data-bg');
            if (dataBg) {
                slide.style.backgroundImage = `url('${dataBg}')`;
                slide.removeAttribute('data-bg'); // Remove to prevent reloading
            }
        };

        // Load first slide immediately
        ensureSlideLoaded(slides[0]);

        // Preload next 1-2 slides after a short delay
        setTimeout(() => {
            if (slides[1]) ensureSlideLoaded(slides[1]);
            if (slides[2]) ensureSlideLoaded(slides[2]);
        }, 1000);

        // Slideshow interval
        setInterval(() => {
            slides[currentSlide].classList.remove('active');
            currentSlide = (currentSlide + 1) % slides.length;

            // Ensure current slide is loaded before showing
            ensureSlideLoaded(slides[currentSlide]);
            slides[currentSlide].classList.add('active');

            // Preload next slide
            const nextSlide = (currentSlide + 1) % slides.length;
            ensureSlideLoaded(slides[nextSlide]);
        }, intervalTime);
    }

    /* 
     * FAQ / Accordion Logic 
     */
    const faqTriggers = document.querySelectorAll('.faq-trigger');
    faqTriggers.forEach(trigger => {
        trigger.addEventListener('click', () => {
            const content = trigger.nextElementSibling;
            const isExpanded = trigger.getAttribute('aria-expanded') === 'true';

            // Close all other items
            faqTriggers.forEach(otherTrigger => {
                if (otherTrigger !== trigger) {
                    otherTrigger.setAttribute('aria-expanded', 'false');
                    const otherContent = otherTrigger.nextElementSibling;
                    otherContent.classList.remove('active');
                    otherContent.setAttribute('aria-hidden', 'true');
                    const otherIcon = otherTrigger.querySelector('.faq-icon');
                    if (otherIcon) otherIcon.innerText = '+';
                }
            });

            // Toggle current
            const newExpandedState = !isExpanded;
            trigger.setAttribute('aria-expanded', newExpandedState);
            content.classList.toggle('active');
            content.setAttribute('aria-hidden', !newExpandedState);

            const icon = trigger.querySelector('.faq-icon');
            if (icon) icon.innerText = newExpandedState ? '−' : '+';
        });

        // Keyboard support (Enter/Space) - standard button behavior usually handles this, 
        // but explicit check for aria-expanded update if needed.
    });

    /*
     * Floating Chat UI Logic
     */
    const chatWidget = document.getElementById('gm-chat-widget');
    if (chatWidget) {
        const chatToggle = document.getElementById('gm-chat-toggle');
        const chatPanel = document.getElementById('gm-chat-panel');
        const chatMessages = document.getElementById('gm-chat-messages');
        const chatInput = document.getElementById('gm-chat-input');
        const chatSend = document.getElementById('gm-chat-send');

        if (chatToggle && chatPanel && chatMessages && chatInput && chatSend) {
            const setChatOpen = (isOpen) => {
                chatPanel.classList.toggle('is-open', isOpen);
                chatPanel.setAttribute('aria-hidden', String(!isOpen));
                chatToggle.setAttribute('aria-expanded', String(isOpen));
                if (isOpen) {
                    chatInput.focus();
                }
            };

            const appendMessage = (text, type) => {
                const message = document.createElement('div');
                message.className = `gm-chat-message gm-chat-message--${type}`;
                message.textContent = text;
                chatMessages.appendChild(message);
                chatMessages.scrollTop = chatMessages.scrollHeight;
            };

            chatToggle.addEventListener('click', () => {
                const isOpen = chatPanel.classList.contains('is-open');
                setChatOpen(!isOpen);
            });

            const sendMessage = async () => {
                const messageText = chatInput.value.trim();
                if (!messageText) {
                    return;
                }

                appendMessage(messageText, 'user');
                chatInput.value = '';

                try {
                    const response = await fetch('/.netlify/functions/gemini-chat', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            messages: [
                                { role: 'user', content: messageText }
                            ]
                        })
                    });

                    const data = await response.json();
                    if (data && typeof data.reply === 'string') {
                        appendMessage(data.reply, 'bot');
                    } else {
                        appendMessage('Sorry, I could not generate a response right now.', 'bot');
                    }
                } catch (error) {
                    appendMessage('Sorry, something went wrong. Please try again shortly.', 'bot');
                }
            };

            chatSend.addEventListener('click', sendMessage);
            chatInput.addEventListener('keydown', (event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault();
                    sendMessage();
                }
            });
        }
    }

});



