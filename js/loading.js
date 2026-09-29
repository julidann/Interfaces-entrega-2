document.addEventListener("DOMContentLoaded", () => {

    const loader = document.querySelector("#home-loader");
    const percentageText = document.querySelector("#loader-percentage");

    if (!loader) return;

    let currentProgress = 0;

    const totalTime = 5000;
    const intervalTime = 50;

    const increment = (intervalTime / totalTime) * 100;

    const progressInterval = setInterval(() => {

        currentProgress += increment;

        if (currentProgress >= 100) {

            currentProgress = 100;

            clearInterval(progressInterval);

            loader.classList.add("hidden");
        }

        percentageText.textContent =
            `${Math.round(currentProgress)}%`;

    }, intervalTime);

});