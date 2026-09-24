const games = [
    {
        name: "Spiderman ",
        image: "assets/img/background-spiderman.jpg"
    },
    {
        name: "Grand Theft Auto VI",
        image: "assets/img/background-GTAVI.jpg"
    },
    {
        name: "Grand Turismo 7",
        image: "assets/img/background-GT.jpg"
    },
    {
        name: "Horizon Zero Down",
        image: "assets/img/background-zerodown.jpg"
    },
    {
        name: "Ghost of Tsushima",
        image: "assets/img/background-ghost.jpg"
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