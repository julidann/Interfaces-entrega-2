const menuButton = document.querySelector(".menu-button");
const hamburgerMenu = document.querySelector("#hamburger-menu");
const userButton = document.querySelector(".user-button");
const profileMenu = document.querySelector("#profile-menu");

menuButton.addEventListener("click", function () {
    hamburgerMenu.classList.toggle("show");
    profileMenu.classList.remove("show");
});

userButton.addEventListener("click", function () {
    profileMenu.classList.toggle("show");
    hamburgerMenu.classList.remove("show");
});
