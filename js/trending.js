const imageRoute = "../assets/img/";

const games = [
    {
        name: "Spiderman ",
        image: imageRoute + "background-spiderman.jpg"
    },
    {
        name: "Grand Theft Auto VI",
        image: imageRoute + "background-GTAVI.jpg"
    },
    {
        name: "Grand Turismo 7",
        image: imageRoute + "background-GT.jpg"
    },
    {
        name: "Horizon Zero Down",
        image: imageRoute + "background-zerodown.jpg"
    },
    {
        name: "Ghost of Tsushima",
        image: imageRoute + "background-ghost.jpg"
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