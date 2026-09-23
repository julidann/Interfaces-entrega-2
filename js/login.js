const loginform = document.querySelector("#login-form");

loginform.addEventListener("submit", function(event) {
    event.preventDefault();

    window.location.href = "home.html";
});

