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

