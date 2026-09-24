const allGames = [
    {
        name: "Spider-Peg",
        plan: "GRATIS",
        category: "Puzzle / Estrategia",
        image: "../assets/img/background-spiderman.jpg"
    },
    {
        name: "Grand Theft Auto V",
        plan: "PRO-GAMER",
        category: "Acción / Aventura",
        image: "../assets/img/background-GTAVI.jpg"
    },
    {
        name: "Red Dead Redemption 2",
        plan: "PRO-GAMER",
        category: "Acción / Aventura",
        image: "../assets/img/background-GT.jpg"
    },
    {
        name: "Fortnite",
        plan: "PRO-GAMER",
        category: "Disparos",
        image: "../assets/img/background-GOW.jpg"
    },
    {
        name: "Horizon Zero Dawn",
        plan: "GRATIS",
        category: "Acción / RPG",
        image: "../assets/img/background-zerodown.jpg"
    },
    {
        name: "Cyberpunk 2077",
        plan: "PRO-GAMER",
        category: "RPG",
        image: "../assets/img/background-spiderman.jpg"
    },
    {
        name: "God of War Ragnarök",
        plan: "PRO-GAMER",
        category: "Acción / Aventura",
        image: "../assets/img/background-GOW.jpg"
    },
    {
        name: "The Last of Us Part I",
        plan: "PRO-GAMER",
        category: "Acción / Aventura",
        image: "../assets/img/background-ghost.jpg"
    },
    {
        name: "EA Sports FC 26",
        plan: "GRATIS",
        category: "Deportes",
        image: "../assets/img/background-GT.jpg"
    },
    {
        name: "Need for Speed Heat",
        plan: "PRO-GAMER",
        category: "Conducción",
        image: "../assets/img/background-GTAVI.jpg"
    },
    {
        name: "Rocket League",
        plan: "PRO-GAMER",
        category: "Deportes",
        image: "../assets/img/background-ghost.jpg"
    },
    {
        name: "Hogwarts Legacy",
        plan: "PRO-GAMER",
        category: "RPG",
        image: "../assets/img/background-zerodown.jpg"
    }
];

const gamesContainer = document.querySelector("#all-games");

allGames.forEach(function (game) {
    gamesContainer.innerHTML += `
        <article class="game-card" data-title="${game.name}">
            <img src="${game.image}" alt="${game.name}">
            <div class="game-info">
                <strong>${game.plan}</strong>
                <h3>${game.name}</h3>
                <p>${game.category}</p>
            </div>
        </article>
    `;
});
