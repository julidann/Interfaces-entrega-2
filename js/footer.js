document.addEventListener("DOMContentLoaded", () => {
    const siteFooter = document.querySelector(".site-footer");
    if (!siteFooter) return;

    const isPageInSubfolder = window.location.pathname.includes("/pages/");
    const assetRoute = isPageInSubfolder ? "../assets/" : "assets/";

    siteFooter.innerHTML = `
        <div class="footer-top">
            <div class="footer-column">
                <h3>About</h3>
                <ul>
                    <li><a href="#">Premium Memberships</a></li>
                    <li><a href="#">Games</a></li>
                    <li><a href="#">Release Highlights</a></li>
                    <li><a href="#">Terms of Use</a></li>
                </ul>
            </div>

            <div class="footer-column">
                <h3>Resources</h3>
                <ul>
                    <li><a href="#">Forums</a></li>
                    <li><a href="#">Recommended Products</a></li>
                    <li><a href="#">Quick Start Guide</a></li>
                </ul>
            </div>

            <div class="footer-column">
                <h3>Support</h3>
                <ul>
                    <li><a href="#">Service Status</a></li>
                    <li><a href="#">Download</a></li>
                    <li><a href="#">FAQs</a></li>
                    <li><a href="#">System Requirements</a></li>
                    <li><a href="#">Technical Support</a></li>
                </ul>
            </div>

            <div class="footer-column">
                <h3>Legal</h3>
                <ul>
                    <li><a href="#">Privacy Policy</a></li>
                    <li><a href="#">Cookies Settings</a></li>
                    <li><a href="#">Refund Policy</a></li>
                </ul>
            </div>
        </div>

        <div class="footer-bottom">
            <div class="footer-socials">
                <img src="${assetRoute}logo/GAMEZONE.png" alt="logo">
                <img src="${assetRoute}img/marvel-logo.png" alt="marvel">
                <img src="${assetRoute}img/easports-logo.png" alt="easports">
            </div>
            <p>Seguinos en nuestras redes</p>
            <div class="social-icons">
                <img src="${assetRoute}icons/facebook.svg" alt="facebook">
                <img src="${assetRoute}icons/instagram.svg" alt="instagram">
                <img src="${assetRoute}icons/discord.svg" alt="discord">
                <img src="${assetRoute}icons/x-twitter.png" alt="x-twitter">
            </div>
            <p class="copyright">2026 - todos los derechos reservados</p>
        </div>
    `;
});