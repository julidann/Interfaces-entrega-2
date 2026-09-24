const background = document.querySelector(".landing-main");

const isPage = window.location.pathname.includes("/pages/");
const imageRoute  = isPage ? "../assets/img/" : "assets/img/";

let images;

if (window.location.pathname.includes("home.html")) {
    images = [
        imageRoute + "SpiderPeg-1.jpg",
        imageRoute + "SpiderPeg-2.jpg",
        imageRoute + "SpiderPeg-3.jpg"
    ];
} else {
    images = [
        imageRoute + "background-ghost.jpg",
        imageRoute + "background-GT.jpg",
        imageRoute + "background-GTAVI.jpg",
        imageRoute + "background-spiderman.jpg",
        imageRoute + "background-zerodown.jpg"
    ];
}

let pos = 0;

background.style.backgroundImage = `url("${images[pos]}")`;

setInterval(function () {
    pos++;

    if (pos >= images.length) {
        pos = 0;
    }

    background.style.backgroundImage = `url("${images[pos]}")`;

}, 4000);