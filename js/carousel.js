function initCarousel(carousel) {
    const viewport = carousel.querySelector('.carousel-viewport');
    const track = viewport.querySelector('.carousel-track');
    const prevBtn = carousel.querySelector('.carousel-btn.prev');
    const nextBtn = carousel.querySelector('.carousel-btn.next');

    let position = 0; // cuántos px nos movimos hacia la derecha

    // Ancho de una tarjeta + el gap entre tarjetas
    function cardStep() {
        const firstCard = track.firstElementChild;
        if (!firstCard) return 0;

        const trackStyle = getComputedStyle(track);
        const gap = parseFloat(trackStyle.gap) || 0;

        return firstCard.getBoundingClientRect().width + gap;
    }

    function move(direction) {
        // direction: -1 (izquierda) o 1 (derecha)
        const maxScroll = track.scrollWidth - viewport.clientWidth;

        position += direction * cardStep();

        if (position < 0) position = 0;
        if (position > maxScroll) position = maxScroll;

        track.style.transform = `translateX(${-position}px)`;
    }

    prevBtn.addEventListener('click', () => move(-1));
    nextBtn.addEventListener('click', () => move(1));
}

// Inicializa TODOS los carruseles que haya en la página
document.querySelectorAll('.carousel').forEach(initCarousel);