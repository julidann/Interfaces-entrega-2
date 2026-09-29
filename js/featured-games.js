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

    // Inyectamos la estructura base limpia
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

    track.innerHTML = featuredGames.map((game, index) => {
        return `
            <article class="adventure-card" data-index="${index}">
                <img src="${game.image}" alt="${game.alt}">
                <h3>${game.title}</h3>
                <p>${game.description}</p>
                <button type="button">Jugar ahora</button>
            </article>
        `;
    }).join("");

    const cards = track.querySelectorAll(".adventure-card");

    function updateCarouselClasses() {
        cards.forEach((card, index) => {
            let position = (index - currentIndex + featuredGames.length) % featuredGames.length;
            
            card.classList.remove("left", "center", "right", "hidden", "featured");
            const btn = card.querySelector("button");
            btn.className = "";

            if (position === 0) {
                card.classList.add("center", "featured");
                btn.classList.add("primary");
            } else if (position === 1) {
                card.classList.add("right");
                btn.classList.add("accent");
            } else {
                card.classList.add("left");
                btn.classList.add("accent");
            }
        });
    }

    // Botones con la dirección correcta corregida
    nextBtn.addEventListener("click", () => {
        currentIndex = (currentIndex - 1 + featuredGames.length) % featuredGames.length;
        updateCarouselClasses();
    });

    prevBtn.addEventListener("click", () => {
        currentIndex = (currentIndex + 1 + featuredGames.length) % featuredGames.length;
        updateCarouselClasses();
    });

    updateCarouselClasses();
});