(function () {

    const isTrendingPage = window.location.pathname.includes("/pages/");
    const trendingImageRoute = isTrendingPage ? "../assets/img/" : "assets/img/";

    const games = [
        {
            name: "Spiderman ",
            image: trendingImageRoute + "background-spiderman.jpg"
        },
        {
            name: "Grand Theft Auto VI",
            image: trendingImageRoute + "background-GTAVI.jpg"
        },
        {
            name: "Gran Turismo 7",
            image: trendingImageRoute + "background-GT.jpg"
        },
        {
            name: "Horizon Zero Dawn",
            image: trendingImageRoute + "background-zerodown.jpg"
        },
        {
            name: "Ghost of Tsushima",
            image: trendingImageRoute + "background-ghost.jpg"
        },
        {
            name: "Alan Wake II",
            image: trendingImageRoute + "allgames-alanwake2.jpg"
        },
        {
            name: "DIRT 5",
            image: trendingImageRoute + "allgames-dirt5.jpg"
        },
        {
            name: "Far Cry 6",
            image: trendingImageRoute + "allgames-farcry6.jpg"
        },

    ];

    const trending = document.querySelector("#trending");

    games.forEach(function (game) {

        trending.innerHTML += `
            <article class="card">
                <img src="${game.image}" alt="${game.name}">
                <p>${game.name}</p>
            </article>
        `;

    });

    /* ---------- Carrusel automático de "Tendencias actuales" ---------- */

    const INTERVALO_MS = 3000;

    const viewport = document.querySelector(".trending-section .carousel-viewport");
    const track = document.querySelector("#trending");

    let posicion = 0;

    function anchoDeUnaTarjeta() {
        const primeraTarjeta = track.firstElementChild;
        if (!primeraTarjeta) return 0;

        const gap = parseFloat(getComputedStyle(track).gap) || 0;
        return primeraTarjeta.getBoundingClientRect().width + gap;
    }



    function avanzar() {
        const ancho = anchoDeUnaTarjeta();
        // Movemos una tarjeta hacia la izquierda 
        track.style.transition = "transform 1s cubic-bezier(0.16, 1, 0.3, 1)";
        track.style.transform = `translateX(-${ancho}px)`;
        // Cuando termina el movimiento 
        track.addEventListener("transitionend", function moverTarjeta() {
            track.appendChild(track.firstElementChild);
            track.style.transition = "none";
            track.style.transform = "translateX(0)";
            track.removeEventListener("transitionend", moverTarjeta);
        });
    }

    track.addEventListener("click", function (e) {

        if (e.target.closest(".card img")) {
            avanzar();
        }

    });

    if (track && viewport) {
        setInterval(avanzar, INTERVALO_MS);
    }

})();