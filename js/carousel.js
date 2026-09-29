/*document.addEventListener("DOMContentLoaded", () => {
    const carousel = document.querySelector("#adventure-carousel");
    if (!carousel) return;

    const track = carousel.querySelector("#adventure-track");
    const prevBtn = carousel.querySelector(".carousel-btn.prev");
    const nextBtn = carousel.querySelector(".carousel-btn.next");

    let currentIndex = 1; // Empieza en God of War (índice 1)

    function updateCarousel() {
        const cards = track.querySelectorAll(".adventure-card");
        if (!cards.length) return;

        cards.forEach((card, index) => {
            // Limpiamos clases previas
            card.classList.remove("left", "center", "right", "hidden", "featured");

            // Calculamos la posición relativa respecto al índice actual
            let position = (index - currentIndex + cards.length) % cards.length;

            if (position === 0) {
                card.classList.add("center", "featured");
            } else if (position === 1) {
                card.classList.add("right");
            } else if (position === cards.length - 1) {
                card.classList.add("left");
            } else {
                card.classList.add("hidden");
            }
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener("click", () => {
            const cards = track.querySelectorAll(".adventure-card");
            currentIndex = (currentIndex + 1) % cards.length;
            updateCarousel();
        });
    }

    if (prevBtn) {
        prevBtn.addEventListener("click", () => {
            const cards = track.querySelectorAll(".adventure-card");
            currentIndex = (currentIndex - 1 + cards.length) % cards.length;
            updateCarousel();
        });
    }

    // Le damos un pequeño respiro para asegurarnos de que el script de featured-games ya haya inyectado las cards
    setTimeout(updateCarousel, 50);
});*/