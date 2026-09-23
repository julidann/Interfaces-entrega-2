const registerform = document.querySelector("#register-form");

registerform.addEventListener("submit", function(event) {
    event.preventDefault();

    window.location.href = "home.html";
});