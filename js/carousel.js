function initCarousel(carousel) {
    const cards = carousel.querySelectorAll('.adventure-card');
    const prevBtn = carousel.querySelector('.carousel-btn.prev');
    const nextBtn = carousel.querySelector('.carousel-btn.next');

    let current = 1;

    function updateCarousel() {
        cards.forEach(function (card, index) {
            card.classList.remove('left', 'center', 'right', 'hidden', 'featured');

            let position = (index - current + cards.length) % cards.length;

            if (position === 0) {
                card.classList.add('center');
            } else if (position === 1) {
                card.classList.add('right');
            } else if (position === cards.length - 1) {
                card.classList.add('left');
            } else {
                card.classList.add('hidden');
            }
        });
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

    updateCarousel();
}

document.querySelectorAll('.carousel').forEach(initCarousel);