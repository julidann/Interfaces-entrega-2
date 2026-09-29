document.addEventListener("DOMContentLoaded", () => {
    const mainImage = document.querySelector("#gallery-main-image");
    const thumbnails = document.querySelectorAll(".gallery-thumbs img");

    if (!mainImage || !thumbnails.length) return;

    thumbnails.forEach((thumbnail) => {
        thumbnail.addEventListener("click", () => {
            mainImage.classList.remove("gallery-change");
            void mainImage.offsetWidth;
            mainImage.src = thumbnail.src;
            mainImage.classList.add("gallery-change");
        });
    });
});
