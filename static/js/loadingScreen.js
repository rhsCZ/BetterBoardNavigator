let loadingInterval = null; 

function toggleLoadingDotsOn() {
    const dotsSpan = document.getElementById("loading-dots");

    if (loadingInterval !== null) {
        return;
    }

    let count = 0;
    loadingInterval = setInterval(() => {
        count = (count + 1) % 4;   // "" -> "." -> ".." -> "..." -> repeat
        dotsSpan.textContent = ".".repeat(count);
    }, 300);
}

function toggleLoadingDotsOff() {
    if (loadingInterval !== null) {
        clearInterval(loadingInterval);
        loadingInterval = null;
    }
}

function showLoadingScreen() {
    const loadingScreenDiv = document.getElementById("loading-screen");
    loadingScreenDiv.style.display = ""; // reverts back to value from css
}

function hideLoadingScreen() {
    const loadingScreenDiv = document.getElementById("loading-screen");
    loadingScreenDiv.style.display = "none";
}

function setLoadingScreenMessage(message) {
    const loadingScreenText = document.getElementById("loading-text");
    loadingScreenText.textContent = message;
}

function showLoadingDots() {
    const loadingScreenDots = document.getElementById("loading-dots");
    loadingScreenDots.style.display = "";
}

function hideLoadingDots() {
    const loadingScreenDots = document.getElementById("loading-dots");

    toggleLoadingDotsOff();
    loadingScreenDots.style.display = "none";
}