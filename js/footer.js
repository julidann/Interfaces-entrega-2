document.addEventListener("DOMContentLoaded", () => {
    const siteFooter = document.querySelector(".site-footer");
    if (!siteFooter) return;

    // Detecta si está dentro de la carpeta /pages/ para ajustar la ruta de imágenes
    const isPageInSubfolder = window.location.pathname.toLowerCase().includes("/pages/");
    const assetRoute = isPageInSubfolder ? "../assets/" : "assets/";

    siteFooter.innerHTML = `
        <div class="footer-top">
            <div class="footer-column">
                <h3>About GameZone</h3>
                <ul>
                    <li><a href="#">Sobre Nosotros</a></li>
                    <li><a href="#">Membresías Premium</a></li>
                    <li><a href="#">Catálogo de Juegos</a></li>
                    <li><a href="#">Destacados y Lanzamientos</a></li>
                    <li><a href="#">Términos de Uso</a></li>
                    <li><a href="#">Trabajá con Nosotros</a></li>
                </ul>
            </div>

            <div class="footer-column">
                <h3>Recursos</h3>
                <ul>
                    <li><a href="#">Comunidad y Foros</a></li>
                    <li><a href="#">Productos Recomendados</a></li>
                    <li><a href="#">Guía de Inicio Rápido</a></li>
                    <li><a href="#">Blog de Novedades</a></li>
                    <li><a href="#">Creadores de Contenido</a></li>
                    <li><a href="#">Eventos y Torneos</a></li>
                </ul>
            </div>

            <div class="footer-column">
                <h3>Soporte Técnico</h3>
                <ul>
                    <li><a href="#">Estado del Servicio</a></li>
                    <li><a href="#">Centro de Descargas</a></li>
                    <li><a href="#">Preguntas Frecuentes (FAQs)</a></li>
                    <li><a href="#">Requisitos de Sistema</a></li>
                    <li><a href="#">Soporte de Cuenta</a></li>
                    <li><a href="#">Reportar un Problema</a></li>
                </ul>
            </div>

            <div class="footer-column">
                <h3>Legales y Privacidad</h3>
                <ul>
                    <li><a href="#">Política de Privacidad</a></li>
                    <li><a href="#">Configuración de Cookies</a></li>
                    <li><a href="#">Política de Reembolsos</a></li>
                    <li><a href="#">Aviso Legal</a></li>
                    <li><a href="#">Derechos del Usuario</a></li>
                    <li><a href="#">Seguridad y Protección</a></li>
                </ul>
            </div>

            <div class="footer-column footer-newsletter">
                <h3>¡Unite a GameZone!</h3>
                <p class="newsletter-text">Enterate antes que nadie de las ofertas exclusivas y nuevos lanzamientos.</p>
                <form class="newsletter-form" onsubmit="event.preventDefault();">
                    <input type="email" placeholder="Tu correo electrónico..." required>
                    <button type="submit">Unirme</button>
                </form>
                <div class="footer-region">
                    <span class="region-icon">🌐</span>
                    <select name="language" id="footer-lang-select" aria-label="Seleccionar idioma">
                        <option value="es-AR">Español (Argentina)</option>
                        <option value="es-ES">Español (España)</option>
                        <option value="en-US">English (US)</option>
                    </select>
                </div>
            </div>
        </div>

        <div class="footer-bottom">
            <div class="footer-socials">
                <img src="${assetRoute}logo/GAMEZONE.png" alt="GameZone Logo">
                <img src="${assetRoute}img/marvel-logo.png" alt="Marvel Logo">
                <img src="${assetRoute}img/easports-logo.png" alt="EA Sports Logo">
            </div>

            

            <p>Seguinos en nuestras redes</p>
            <div class="social-icons">
                <a href="#" aria-label="Facebook"><img src="${assetRoute}icons/facebook.svg" alt="Facebook"></a>
                <a href="#" aria-label="Instagram"><img src="${assetRoute}icons/instagram.svg" alt="Instagram"></a>
                <a href="#" aria-label="Discord"><img src="${assetRoute}icons/discord.svg" alt="Discord"></a>
                <a href="#" aria-label="Twitter"><img src="${assetRoute}icons/x-twitter.png" alt="X Twitter"></a>
            </div>

            <p class="legal-disclaimer">
                GameZone es una marca registrada. Todos los derechos de las marcas y videojuegos pertenecen a sus respectivos desarrolladores.
            </p>
            <p class="copyright">© 2026 GAMEZONE - Todos los derechos reservados</p>
        </div>
    `;
});