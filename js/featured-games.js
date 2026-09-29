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
    let isMoving = false;

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

    function changePositions(direction) {
        if (direction === "next") {
            leftCard.className = "adventure-card center";
            centerCard.className = "adventure-card right";
            rightCard.className = "adventure-card left";
            currentIndex = (currentIndex + 1) % featuredGames.length;
        } else {
            leftCard.className = "adventure-card right";
            centerCard.className = "adventure-card left";
            rightCard.className = "adventure-card center";
            currentIndex = (currentIndex - 1 + featuredGames.length) % featuredGames.length;
        }

        const leftIndex = (currentIndex - 1 + featuredGames.length) % featuredGames.length;
        const rightIndex = (currentIndex + 1) % featuredGames.length;

        leftCard.querySelector("button").className =
            leftCard.classList.contains("center") ? "primary" : "accent";
        centerCard.querySelector("button").className =
            centerCard.classList.contains("center") ? "primary" : "accent";
        rightCard.querySelector("button").className =
            rightCard.classList.contains("center") ? "primary" : "accent";
    }

    function moveCarousel(direction) {
        if (isMoving) return;

        isMoving = true;
        track.classList.add(direction === "next" ? "moving-next" : "moving-prev");

        setTimeout(() => {
            changePositions(direction);
            track.classList.remove("moving-next", "moving-prev");
            isMoving = false;
        }, 500);
    }

    nextBtn.addEventListener("click", () => moveCarousel("next"));
    prevBtn.addEventListener("click", () => moveCarousel("prev"));

    renderCards();
});