document.addEventListener('DOMContentLoaded', () => {
    // Scroll Reveal Logic
    const observerOptions = {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                // Optional: stop observing once revealed
                // observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('[data-reveal]').forEach(el => observer.observe(el));

    // Parallax & Smooth Interactions
    const hero = document.querySelector('.stealth-hero');
    if (hero) {
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const bg = hero.querySelector('::before'); // Handled by CSS transition usually
            // Direct transform for smoother parallax on hero image
            const image = hero.querySelector('.hero-bg-wrapper');
            if (image) {
                image.style.transform = `translateY(${scrolled * 0.3}px) scale(${1 + scrolled * 0.0001})`;
            }
        });
        
        // Trigger initial hero reveal
        setTimeout(() => {
            hero.classList.add('revealed');
        }, 100);
    }
    
    // Smooth Reveal for sections
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
        section.setAttribute('data-reveal', '');
        observer.observe(section);
    });
});
