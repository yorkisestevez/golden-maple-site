document.addEventListener('DOMContentLoaded', () => {
    const header = document.querySelector('header');

    window.addEventListener('scroll', () => {
        if (!header) return;
        if (window.scrollY > 50) {
            header.style.background = 'rgba(5, 5, 5, 0.98)';
            header.style.padding = '12px 0';
        } else {
            header.style.background = 'rgba(10, 10, 10, 0.95)';
            header.style.padding = '20px 0';
        }
    });

    const magneticBtns = document.querySelectorAll('.btn:not(.btn-outline)');
    magneticBtns.forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            btn.style.transform = `translate(${x * 0.12}px, ${y * 0.12}px)`;
        });

        btn.addEventListener('mouseleave', () => {
            btn.style.transform = '';
        });
    });

    const leadForms = document.querySelectorAll('form');
    leadForms.forEach(form => {
        form.addEventListener('submit', () => {
            const btn = form.querySelector('button[type="submit"]');
            if (btn) {
                btn.innerHTML = '<span class="loading-dots">Processing</span>';
                btn.style.opacity = '0.7';
                btn.style.pointerEvents = 'none';
            }
        });

        const inputs = form.querySelectorAll('input, select');
        inputs.forEach(input => {
            input.addEventListener('blur', () => {
                if (input.hasAttribute('required') && !input.value) {
                    input.classList.add('error');
                } else {
                    input.classList.remove('error');
                }
            });
        });
    });

    const observerOptions = { threshold: 0.12 };
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                revealObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('[data-reveal]').forEach(el => revealObserver.observe(el));

    console.log('Golden Maple UI Precision Engine Active');
});