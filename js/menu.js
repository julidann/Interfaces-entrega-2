const menuButton = document.querySelector(".menu-button");
const hamburgerMenu = document.querySelector("#hamburger-menu");

menuButton.addEventListener("click", function () {
    hamburgerMenu.classList.toggle("show");
});
