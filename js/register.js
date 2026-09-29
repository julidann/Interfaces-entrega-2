document.addEventListener("DOMContentLoaded", () => {
    const registerForm = document.querySelector("#register-form");
    if (!registerForm) return;

    // Seleccionamos los inputs típicos de un registro (ajustá los IDs si usás otros en tu HTML)
    const nameInput = document.querySelector("#register-name") || document.querySelector("#name");
    const userInput = document.querySelector("#register-user") || document.querySelector("#email");
    const passInput = document.querySelector("#register-password") || document.querySelector("#password");
    
    const submitBtn = registerForm.querySelector("button[type='submit']");
    const messageP = document.querySelector("#register-message");

    registerForm.addEventListener("submit", (e) => {
        e.preventDefault(); // Evita que se recargue la página ya que no hay backend
        let isValid = true;

        // 1. Validar Nombre (si existe en el form)
        if (nameInput) {
            const nameField = nameInput.closest(".form-field");
            if (nameInput.value.trim() === "") {
                if (nameField) nameField.classList.add("error");
                isValid = false;
            } else {
                if (nameField) nameField.classList.remove("error");
            }
        }

        // 2. Validar Usuario / Email
        if (userInput) {
            const userField = userInput.closest(".form-field");
            if (userInput.value.trim() === "") {
                if (userField) userField.classList.add("error");
                isValid = false;
            } else {
                if (userField) userField.classList.remove("error");
            }
        }

        // 3. Validar Contraseña
        if (passInput) {
            const passField = passInput.closest(".form-field");
            if (passInput.value.trim() === "") {
                if (passField) passField.classList.add("error");
                isValid = false;
            } else {
                if (passField) passField.classList.remove("error");
            }
        }

        // Si hay errores, mostramos mensaje general y cortamos
        if (!isValid) {
            if (messageP) {
                messageP.textContent = "Por favor, completá todos los campos obligatorios.";
                messageP.style.color = "#D6006A";
            }
            return;
        }

        // Si todo está correcto, limpiamos mensaje y aplicamos animación de éxito
        if (messageP) messageP.textContent = "";
        
        if (submitBtn) {
            submitBtn.classList.add("success");
            submitBtn.textContent = "Registrando...";
        }

        // Redirigimos después de 1 segundo para que se luzca la animación
        setTimeout(() => {
            window.location.href = "home.html"; // O "login.html" según prefieras
        }, 1000);
    });
});