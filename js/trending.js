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
        }
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
        const maximoScroll = track.scrollWidth - viewport.clientWidth;

        posicion += anchoDeUnaTarjeta();

        // Si no hay más tarjetas para mostrar, volvemos al principio
        if (posicion > maximoScroll) {
            posicion = 0;
        }

        track.style.transform = `translateX(${-posicion}px)`;
    }

    if (track && viewport) {
        setInterval(avanzar, INTERVALO_MS);
    }

})();