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
        name: "Grand Turismo 7",
        image: trendingImageRoute + "background-GT.jpg"
    },
    {
        name: "Horizon Zero Down",
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



const next = document.querySelector(".carousel-next");
const prev = document.querySelector(".carousel-prev");

let position = 0;
let direction = -1;
const movement = 305;

function moveTrending() {
    const limit = Math.max(0, trending.scrollWidth - trending.parentElement.clientWidth + 90);

    position += movement * direction;

    if (Math.abs(position) >= limit) {
        position = -limit;
        direction = 1;
    }

    if (position >= 0) {
        position = 0;
        direction = -1;
    }

    trending.style.transform = `translateX(${position}px)`;
}

let carouselTimer = setInterval(moveTrending, 2500);

next.addEventListener("click", function () {
    direction = -1;
    moveTrending();
});

prev.addEventListener("click", function () {
    direction = 1;
    moveTrending();
});
