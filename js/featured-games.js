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
            buttonClass: "accent",
            alt: "Horizon Zero Dawn"
        },
        {
            title: "God of War - Ragnarok",
            image: imgRoute + "background-GOW.jpg",
            description: "Embárcate en un viaje épico por los Nueve Reinos mientras Kratos y Atreus se enfrentan a dioses y monstruos.",
            buttonClass: "primary",
            alt: "God of War Ragnarok"
        },
        {
            title: "Ghost of Tsushima",
            image: imgRoute + "background-ghost.jpg",
            description: "Recorré la isla de Tsushima y luchá como samurái para defender tu hogar de la invasión.",
            buttonClass: "accent",
            alt: "Ghost of Tsushima"
        }
    ];

    let currentIndex = 1; // Empieza en God of War (al centro)

    // Inyectamos la estructura base dentro del carrusel
    carouselContainer.innerHTML = `
        <button class="carousel-btn prev" type="button" aria-label="Anterior">‹</button>
        <div class="carousel-viewport">
            <div class="adventure-cards carousel-track" id="adventure-track"></div>
        </div>
        <button class="carousel-btn next" type="button" aria-label="Siguiente">›</button>
    `;

    const track = carouselContainer.querySelector("#adventure-track");
    const prevBtn = carouselContainer.querySelector(".carousel-btn.prev");
    const nextBtn = carouselContainer.querySelector(".carousel-btn.next");

    function renderCarousel() {
        track.innerHTML = "";

        featuredGames.forEach((game, index) => {
            let position = (index - currentIndex + featuredGames.length) % featuredGames.length;
            
            let cardClass = "adventure-card";
            if (position === 0) {
                cardClass += " center featured";
                game.buttonClass = "primary"; // Botón destacado para el juego central
            } else if (position === 1) {
                cardClass += " right";
                game.buttonClass = "accent"; // Botón secundario para el juego a la derecha
            } else {
                // Cualquier otro caso (en un array de 3, será el índice 2) pasa a ser la izquierda
                cardClass += " left";
                game.buttonClass = "accent"; // Botón secundario para el juego a la izquierda
            }

            track.innerHTML += `
                <article class="${cardClass}">
                    <img src="${game.image}" alt="${game.alt}">
                    <h3>${game.title}</h3>
                    <p>${game.description}</p>
                    <button class="${game.buttonClass}" type="button">Jugar ahora</button>
                </article>
            `;
        });
    }

    nextBtn.addEventListener("click", () => {
        currentIndex = (currentIndex + 1) % featuredGames.length;
        renderCarousel();
    });

    prevBtn.addEventListener("click", () => {
        currentIndex = (currentIndex - 1 + featuredGames.length) % featuredGames.length;
        renderCarousel();
    });

    // Render inicial
    renderCarousel();
});