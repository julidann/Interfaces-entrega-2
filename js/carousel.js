function initCarousel(carousel) {
    const viewport = carousel.querySelector('.carousel-viewport');
    const track = viewport.querySelector('.carousel-track');
    const cards = track.querySelectorAll('.adventure-card');
    const prevBtn = carousel.querySelector('.carousel-btn.prev');
    const nextBtn = carousel.querySelector('.carousel-btn.next');

    let current = cards.length > 1 ? 1 : 0;

    function updateCarousel() {
        cards.forEach((card, index) => {
            card.classList.toggle('featured', index === current);
        });

        const activeCard = cards[current];

        if (!activeCard) {
            return;
        }

        // Centra la tarjeta destacada dentro del carrusel.
        const cardCenter = activeCard.offsetLeft + activeCard.offsetWidth / 2;
        const viewportCenter = viewport.clientWidth / 2;
        let position = cardCenter - viewportCenter;

        const maxPosition = Math.max(0, track.scrollWidth - viewport.clientWidth);

        if (position < 0) {
            position = 0;
        }

        if (position > maxPosition) {
            position = maxPosition;
        }

        track.style.transform = 'translateX(' + (-position) + 'px)';
    }

    nextBtn.addEventListener('click', function () {
        current++;

        if (current >= cards.length) {
            current = 0;
        }

        updateCarousel();
    });

    prevBtn.addEventListener('click', function () {
        current--;

        if (current < 0) {
            current = cards.length - 1;
        }

        updateCarousel();
    });

    window.addEventListener('resize', updateCarousel);

    updateCarousel();
}

// Inicializa todos los carruseles que haya en la página.
document.querySelectorAll('.carousel').forEach(initCarousel);