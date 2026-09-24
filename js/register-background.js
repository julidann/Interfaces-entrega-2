const landing = document.querySelector(".landing-main");

const images = [
    "../assets/img/background-ghost.jpg",
    "../assets/img/background-GT.jpg",
    "../assets/img/background-GTAVI.jpg",
    "../assets/img/background-spiderman.jpg",
    "../assets/img/background-zerodown.jpg"
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
