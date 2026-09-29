const isPageInSubfolder = window.location.pathname.includes("/pages/");
const imgRoute = isPageInSubfolder ? "../assets/img/" : "assets/img/";

const featuredGames = [
    {
        title: "Horizon Zero Dawn",
        image: imgRoute + "background-zerodown.jpg",
        description: "Explorá un mundo dominado por máquinas y descubrí los secretos del pasado de Aloy.",
        buttonClass: "accent",
        alt: "Horizon Zero Dawn"
    },
    {
        title: "God of War - Ragnarok",
        image: imgRoute + "background-GOW.jpg",
        description: "Embárcate en un viaje épico por los Nueve Reinos mientras Kratos y Atreus se enfrentan a dioses y monstruos.",
        buttonClass: "primary",
        alt: "God of War Ragnarok"
    },
    {
        title: "Ghost of Tsushima",
        image: imgRoute + "background-ghost.jpg",
        description: "Recorré la isla de Tsushima y luchá como samurái para defender tu hogar de la invasión.",
        buttonClass: "accent",
        alt: "Ghost of Tsushima"
    }
];

const adventureTrack = document.querySelector("#adventure-track");

if (adventureTrack) {
    adventureTrack.innerHTML = "";

    featuredGames.forEach((game, index) => {
        // Podés ajustar qué tarjeta arranca con la clase 'center featured' por defecto si lo necesitás
        const cardClass = index === 1 ? "adventure-card center featured" : "adventure-card";

        adventureTrack.innerHTML += `
            <article class="${cardClass}">
                <img src="${game.image}" alt="${game.alt}">
                <h3>${game.title}</h3>
                <p>${game.description}</p>
                <button class="${game.buttonClass}" type="button">Jugar ahora</button>
            </article>
        `;
    });
}