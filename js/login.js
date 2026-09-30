document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.querySelector("#login-form");
    if (!loginForm) return;

    const userInput = document.querySelector("#login-user");
    const passInput = document.querySelector("#login-password");
    const submitBtn = loginForm.querySelector("button[type='submit']");
    const messageP = document.querySelector("#login-message");

    loginForm.addEventListener("submit", (e) => {
        e.preventDefault(); // Evita que se recargue la página ya que no hay backend
        let isValid = true;

        // Validar campo de usuario / email
        const userField = userInput.closest(".form-field");
        if (userInput.value.trim() === "") {
            userField.classList.add("error");
            isValid = false;
        } else {
            userField.classList.remove("error");
        }

        // Validar campo de contraseña
        const passField = passInput.closest(".form-field");
        if (passInput.value.trim() === "") {
            passField.classList.add("error");
            isValid = false;
        } else {
            passField.classList.remove("error");
        }

        // Si hay errores, mostramos mensaje y cortamos
        if (!isValid) {
            if (messageP) {
                messageP.textContent = "Por favor, completá los campos obligatorios.";
                messageP.style.color = "#D6006A";
            }
            return;
        }

        // Si todo está correcto, limpiamos mensaje y aplicamos animación de éxito
        if (messageP) messageP.textContent = "";
        
        submitBtn.classList.add("loading");
        //submitBtn.textContent = "Loading";

        // Redirigimos a la home después de 1 segundo para que se luzca la animación
        setTimeout(() => {
            window.location.href = "home.html";
        }, 1000);
    });
});