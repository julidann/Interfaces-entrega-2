const landing = document.querySelector(".landing-main");

const isPage = window.location.pathname.includes("/pages/");
const path = isPage ? "../assets/img/" : "assets/img/";

const images = [
    path + "background-ghost.jpg",
    path + "background-GT.jpg",
    path + "background-GTAVI.jpg",
    path + "background-spiderman.jpg",
    path + "background-zerodown.jpg"
];

let position = 0;

landing.style.backgroundImage = `url("${images[position]}")`;

setInterval(function () {
    position++;

    if (position >= images.length) {
        position = 0;
    }

    landing.style.backgroundImage = `url("${images[position]}")`;
}, 6000);