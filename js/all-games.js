const allGames = [
    {
        name: "Alan Wake 2",
        plan: "PRO-GAMER",
        category: "Acción / Aventura",
        image: "../assets/img/allgames-alanwake2.jpg"
    },
    {
        name: "Assassin's Creed Valhalla",
        plan: "PRO-GAMER",
        category: "Acción / Aventura",
        image: "../assets/img/allgames-assassins.jpg"
    },
    {
        name: "Batman Arkham Knight",
        plan: "PRO-GAMER",
        category: "Acción / Aventura",
        image: "../assets/img/allgames-batman.jpg"
    },
    {
        name: "Battlefield 6",
        plan: "PRO-GAMER",
        category: "Disparos",
        image: "../assets/img/allgames-battlefield.jpg"
    },
    {
        name: "Cities: Skylines 2",
        plan: "PRO-GAMER",
        category: "Simuladores",
        image: "../assets/img/allgames-cities.jpg"
    },
    {
        name: "Cyberpunk 2077",
        plan: "PRO-GAMER",
        category: "RPG",
        image: "../assets/img/allgames-cyberpunk.jpg"
    },
    {
        name: "Death Stranding",
        plan: "GRATIS",
        category: "Acción / Aventura",
        image: "../assets/img/allgames-deathstranding.jpg"
    },
    {
        name: "DIRT 5",
        plan: "PRO-GAMER",
        category: "Conducción",
        image: "../assets/img/allgames-dirt5.jpg"
    },
    {
        name: "EA SPORTS FC 27",
        plan: "PRO-GAMER",
        category: "Deportes",
        image: "../assets/img/allgames-fc27.jpg"
    },
    {
        name: "Far Cry 6",
        plan: "PRO-GAMER",
        category: "Disparos",
        image: "../assets/img/allgames-farcry6.jpg"
    },
    {
        name: "Hogwarts Legacy",
        plan: "PRO-GAMER",
        category: "RPG",
        image: "../assets/img/allgames-legacy.jpg"
    },
    {
        name: "Little Nightmares III",
        plan: "PRO-GAMER",
        category: "Aventura",
        image: "../assets/img/allgames-littlenightmares.jpg"
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
