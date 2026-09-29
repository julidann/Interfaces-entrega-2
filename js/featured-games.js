document.addEventListener("DOMContentLoaded", () => {
    const carouselContainer = document.querySelector("#adventure-carousel");
    if (!carouselContainer) return;

    const isPageInSubfolder = window.location.pathname.includes("/pages/");
    const imgRoute = isPageInSubfolder ? "../assets/img/" : "assets/img/";

    const featuredGames = [
        {
            title: "Horizon Zero Dawn",
            image: imgRoute + "background-zerodown.jpg",
            description: "Explorá un mundo dominado por máquinas y descubrí los secretos del pasado de Aloy.",
            alt: "Horizon Zero Dawn"
        },
        {
            title: "God of War - Ragnarok",
            image: imgRoute + "background-GOW.jpg",
            description: "Embárcate en un viaje épico por los Nueve Reinos mientras Kratos y Atreus se enfrentan a dioses y monstruos.",
            alt: "God of War Ragnarok"
        },
        {
            title: "Ghost of Tsushima",
            image: imgRoute + "background-ghost.jpg",
            description: "Recorré la isla de Tsushima y luchá como samurái para defender tu hogar de la invasión.",
            alt: "Ghost of Tsushima"
        }
    ];

    let currentIndex = 1;

    carouselContainer.innerHTML = `
        <div class="adventure-cards" id="adventure-track">
            <article class="adventure-card left"></article>

            <button class="carousel-btn prev" type="button" aria-label="Anterior">‹</button>

            <article class="adventure-card center"></article>

            <button class="carousel-btn next" type="button" aria-label="Siguiente">›</button>

            <article class="adventure-card right"></article>
        </div>
    `;

    const track = carouselContainer.querySelector("#adventure-track");
    const leftCard = track.querySelector(".left");
    const centerCard = track.querySelector(".center");
    const rightCard = track.querySelector(".right");
    const prevBtn = track.querySelector(".prev");
    const nextBtn = track.querySelector(".next");

    const cards = [leftCard, centerCard, rightCard];

    function fillCard(card, game, buttonClass) {
        card.innerHTML = `
            <img src="${game.image}" alt="${game.alt}">
            <h3>${game.title}</h3>
            <p>${game.description}</p>
            <button type="button" class="${buttonClass}">Jugar ahora</button>
        `;
    }

    function renderCards() {
        const leftIndex = (currentIndex - 1 + featuredGames.length) % featuredGames.length;
        const rightIndex = (currentIndex + 1) % featuredGames.length;

        fillCard(leftCard, featuredGames[leftIndex], "accent");
        fillCard(centerCard, featuredGames[currentIndex], "primary");
        fillCard(rightCard, featuredGames[rightIndex], "accent");
    }

    function moveCarousel(direction) {
        const oldLeft = featuredGames[(currentIndex - 1 + featuredGames.length) % featuredGames.length];
        const oldCenter = featuredGames[currentIndex];
        const oldRight = featuredGames[(currentIndex + 1) % featuredGames.length];

        cards.forEach(card => {
            card.classList.remove("slide-left", "slide-right");
        });

        if (direction === "next") {
            currentIndex = (currentIndex + 1) % featuredGames.length;
            track.classList.add("moving-next");
        } else {
            currentIndex = (currentIndex - 1 + featuredGames.length) % featuredGames.length;
            track.classList.add("moving-prev");
        }

        setTimeout(() => {
            renderCards();

            requestAnimationFrame(() => {
                track.classList.remove("moving-next", "moving-prev");
            });
        }, 250);
    }

    nextBtn.addEventListener("click", () => moveCarousel("next"));
    prevBtn.addEventListener("click", () => moveCarousel("prev"));

    renderCards();
});
