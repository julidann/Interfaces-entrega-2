document.addEventListener("DOMContentLoaded", () => {
    const carouselContainer = document.querySelector("#adventure-carousel");
    if (!carouselContainer) return;

    const isPageInSubfolder = window.location.pathname.includes("/pages/");
    const imgRoute = isPageInSubfolder ? "../assets/img/" : "assets/img/";

    const featuredGames = [
        {
            title: "FlappySpider",
            image: imgRoute + "FlappySpider.jpg",
            description: "¡Ayuda a la araña a volar a través de los obstáculos y alcanzar nuevas alturas! Controla su vuelo con precisión y evita chocar con los obstáculos.",
            alt: "FlappySpider"
        },
        {
            title: "Spider Peg Solitaire",
            image: imgRoute + "SpiderPeg-2.jpg",
            description: "El peligro acecha en cada rincón de la cuadrícula. En Peg Solitaire: Shadow Protocol, no estás simplemente moviendo fichas"
        },
        {
            title: "Spider Blocka",
            image: imgRoute + "SpiderBlocka.png",
            description: "¡Pondrás a prueba tu rapidez y visión espacial! Encajá cada fragmento en su posición exacta para reconstruir las imágenes por completo.",
            alt: "Spider Blocka"
        }
        
    ];

    let currentIndex = 1;

    carouselContainer.innerHTML = `
        <div class="adventure-cards" id="adventure-track">
            <article class="adventure-card" data-index="0"></article>

            <button class="carousel-btn prev" type="button" aria-label="Anterior">
                ‹
            </button>

            <article class="adventure-card" data-index="1"></article>

            <button class="carousel-btn next" type="button" aria-label="Siguiente">
                ›
            </button>

            <article class="adventure-card" data-index="2"></article>
        </div>
    `;

    const track = carouselContainer.querySelector("#adventure-track");
    const prevBtn = track.querySelector(".prev");
    const nextBtn = track.querySelector(".next");
    const cards = track.querySelectorAll(".adventure-card");

    function fillCard(card, game, buttonClass) {
        card.innerHTML = `
            <img src="${game.image}" alt="${game.alt}">
            <h3>${game.title}</h3>
            <p>${game.description}</p>
            <button type="button" class="${buttonClass}">
                Jugar ahora
            </button>
        `;
    }

    function updateCarouselClasses() {
    cards.forEach((card, index) => {
        // --- CÁLCULO DE POSICIÓN (Igual que antes, no lo toques) ---
        let position =
            (index - currentIndex + featuredGames.length) %
            featuredGames.length;

        card.classList.remove(
            "left",
            "center",
            "right",
            "hidden",
            "featured"
        );

        // --- GESTIÓN DEL BOTÓN (MEJORA IMPORTANTE) ---
        const btn = card.querySelector("button");

        // SIEMPRE limpia las clases del botón antes de añadir una nueva.
        btn.className = "";

        // SIEMPRE elimina el evento click anterior para que no se acumulen
        // (Es vital hacer esto para que el evento anterior no se ejecute cuando no debe)
        btn.replaceWith(btn.cloneNode(true));
        const cleanBtn = card.querySelector("button"); // Obtenemos la referencia nueva

        // --- ASIGNACIÓN SEGÚN POSICIÓN ---
        if (position === 0) {
            card.classList.add("center", "featured");
            cleanBtn.classList.add("primary");
            cleanBtn.innerText = "¡Jugar Ahora!"; // Opcional: cambia el texto del botón

           // --- ASIGNACIÓN SEGÚN TÍTULO DEL JUEGO ---
            const featuredGameData = featuredGames[index];
            let gameUrl = "game.html"; // URL por defecto

            switch (featuredGameData.title) {
                case "FlappySpider":
                    gameUrl = "flappyspider.html";
                    break;
                case "Spider Peg Solitaire": // O como esté escrito exactamente en el título de tu array
                case "SpiderPeg":
                    gameUrl = "spiderpeg.html";
                    break;
                default:
                    gameUrl = "game.html"; // Para Spider Blocka u otros
                    break;
            }

            cleanBtn.addEventListener("click", () => {
                window.location.href = gameUrl;
            });
        } else if (position === 1) {
            card.classList.add("right");
            cleanBtn.classList.add("accent");
            cleanBtn.innerText = "Ver Info"; // Opcional
            // A los juegos de los lados les quitamos la funcionalidad de jugar,
            // o los llevamos a una página de detalles (esto lo decides tú).
            cleanBtn.addEventListener("click", () => {
                console.log("Click en juego lateral (sin acción por ahora)");
            });
        } else {
            card.classList.add("left");
            cleanBtn.classList.add("accent");
            cleanBtn.innerText = "Ver Info";
            cleanBtn.addEventListener("click", () => {
               console.log("Click en juego lateral (sin acción por ahora)");
            });
        }
    });
}

    function renderCards() {
        cards.forEach((card, index) => {
            fillCard(
                card,
                featuredGames[index],
                "accent"
            );
        });

        updateCarouselClasses();
    }

    nextBtn.addEventListener("click", () => {
        currentIndex =
            (currentIndex + 1 + featuredGames.length) %
            featuredGames.length;

        updateCarouselClasses();
    });

    prevBtn.addEventListener("click", () => {
        currentIndex =
            (currentIndex - 1) %
            featuredGames.length;

        updateCarouselClasses();
    });

    renderCards();
});