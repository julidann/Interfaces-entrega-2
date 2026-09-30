document.addEventListener("DOMContentLoaded", () => {
    const registerForm = document.querySelector("#register-form");
    if (!registerForm) return;

    const passInput = document.querySelector("#password");
    const repeatPassInput = document.querySelector("#repeat-password");

    const submitBtn = registerForm.querySelector("button[type='submit']");
    const messageP = document.querySelector("#register-message");

    registerForm.addEventListener("submit", (e) => {
        e.preventDefault(); // Evita que se recargue la página ya que no hay backend
        let isValid = true;

        // Validamos los campos obligatorios
        const fields = registerForm.querySelectorAll(".form-field input");

        fields.forEach((input) => {
            const field = input.closest(".form-field");

            if (input.value.trim() === "") {
                field.classList.add("error");
                isValid = false;
            } else {
                field.classList.remove("error");
            }
        });

        // Verificamos que las contraseñas coincidan
        if (passInput.value !== repeatPassInput.value) {
            repeatPassInput.closest(".form-field").classList.add("error");
            isValid = false;
        }

        // Si hay errores, mostramos mensaje y cortamos
        if (!isValid) {
            messageP.textContent = "Por favor, revisá los campos obligatorios.";
            messageP.style.color = "#D6006A";
            return;
        }

        // Si todo está correcto, limpiamos mensaje y aplicamos animación de éxito
        messageP.textContent = "";
        submitBtn.classList.add("success");
        submitBtn.textContent = "Registrando...";

        // Redirigimos después de 1 segundo para que se luzca la animación
        setTimeout(() => {
            window.location.href = "home.html";
        }, 1000);
    });
});
