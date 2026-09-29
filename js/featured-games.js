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
        <div class="adventure-cards" id="adventure-track"></div>
    `;

    const track = carouselContainer.querySelector("#adventure-track");

    function createCard(game, type) {
        const card = document.createElement("article");
        card.className = `adventure-card ${type}`;

        const buttonClass = type === "center" ? "primary" : "accent";

        card.innerHTML = `
            <img src="${game.image}" alt="${game.alt}">
            <h3>${game.title}</h3>
            <p>${game.description}</p>
            <button type="button" class="${buttonClass}">Jugar ahora</button>
        `;

        return card;
    }

    function renderCarousel() {
        const leftIndex = (currentIndex - 1 + featuredGames.length) % featuredGames.length;
        const rightIndex = (currentIndex + 1) % featuredGames.length;

        track.innerHTML = "";

        track.appendChild(createCard(featuredGames[leftIndex], "left"));

        const prevBtn = document.createElement("button");
        prevBtn.className = "carousel-btn prev";
        prevBtn.type = "button";
        prevBtn.setAttribute("aria-label", "Anterior");
        prevBtn.textContent = "‹";

        const centerCard = createCard(featuredGames[currentIndex], "center");

        const nextBtn = document.createElement("button");
        nextBtn.className = "carousel-btn next";
        nextBtn.type = "button";
        nextBtn.setAttribute("aria-label", "Siguiente");
        nextBtn.textContent = "›";

        track.appendChild(prevBtn);
        track.appendChild(centerCard);
        track.appendChild(nextBtn);
        track.appendChild(createCard(featuredGames[rightIndex], "right"));

        prevBtn.addEventListener("click", () => {
            currentIndex = (currentIndex - 1 + featuredGames.length) % featuredGames.length;
            renderCarousel();
        });

        nextBtn.addEventListener("click", () => {
            currentIndex = (currentIndex + 1) % featuredGames.length;
            renderCarousel();
        });
    }

    renderCarousel();
});
