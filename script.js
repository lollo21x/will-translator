async function query(data) {
    const response = await fetch(
        "https://api-inference.huggingface.co/models/Helsinki-NLP/opus-mt-it-en",
        {
            headers: {
                "Authorization": "Bearer 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",
                "Content-Type": "application/json",
            },
            method: "POST",
            body: JSON.stringify(data),
        }
    );
    const result = await response.json();
    return result;
}

const translateButton = document.getElementById("translate-button");
const translationInput = document.getElementById("translation-input");
const translationOutput = document.getElementById("translation-output");
const copyButton = document.getElementById("copy-button");
const copySuccessMessage = document.querySelector(".copy-success");
const languageLabelInput = document.getElementById("language-label-input");
const languageLabelOutput = document.getElementById("language-label-output");

// Inizialmente disabilita il pulsante "Traduci"
translateButton.disabled = true;

// Funzione per abilitare/disabilitare il pulsante "Traduci" in base al contenuto dell'input
translationInput.addEventListener("input", () => {
    if (translationInput.value.trim().length > 0) {
        translateButton.disabled = false;
    } else {
        translateButton.disabled = true;
    }
});

translationInput.addEventListener("focus", () => {
    languageLabelInput.classList.add("bold");
    languageLabelOutput.classList.remove("bold");
});

function translateText() {
    languageLabelInput.classList.remove("bold");
    languageLabelOutput.classList.add("bold");

    const inputText = translationInput.value;
    translationOutput.value = "Translation in progress...";

    query({ "inputs": inputText }).then((response) => {
        const translatedText = response[0].translation_text;
        translationOutput.value = translatedText;
    });
}

translateButton.addEventListener("click", translateText);

translationInput.addEventListener("keydown", (event) => {
    if (event.keyCode === 13) {
        event.preventDefault();
        translateText();
    }
});

copyButton.addEventListener("click", () => {
    translationOutput.select();
    document.execCommand("copy");
    copySuccessMessage.style.display = "block";
    setTimeout(() => {
        copySuccessMessage.style.display = "none";
    }, 2000);
});
