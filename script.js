async function query(data) {
    try {
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

        if (!response.ok) {
            const errorText = await response.text(); // Ottieni il testo dell'errore
            console.error("Response Error:", errorText); // Log dell'errore
            throw new Error(`HTTP error! Status: ${response.status}, Details: ${errorText}`);
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error("Error during fetch:", error.message); // Mostra l'errore nella console
        throw error; // Rilancia l'errore per essere gestito nel chiamante
    }
}

const translateButton = document.getElementById("translate-button");
const translationInput = document.getElementById("translation-input");
const translationOutput = document.getElementById("translation-output");
const copyButton = document.getElementById("copy-button");
const copySuccessMessage = document.querySelector(".copy-success");
const languageLabelInput = document.getElementById("language-label-input");
const languageLabelOutput = document.getElementById("language-label-output");
const timeoutPopup = document.getElementById("timeout-popup");

let timeoutId = null; // ID del timeout
let timeoutActive = false; // Flag per controllare se il timeout è attivo

// Inizialmente disabilita il pulsante "Traduci" e "Copia"
translateButton.disabled = true;
copyButton.disabled = true;

// Funzione per abilitare/disabilitare il pulsante "Traduci" e "Copia"
function updateButtons() {
    if (translationInput.value.trim().length > 0) {
        translateButton.disabled = false;
    } else {
        translateButton.disabled = true;
    }

    if (translationOutput.value.trim().length > 0) {
        copyButton.disabled = false;
    } else {
        copyButton.disabled = true;
    }
}

translationInput.addEventListener("input", updateButtons);
translationInput.addEventListener("focus", () => {
    languageLabelInput.classList.add("bold");
});
translationInput.addEventListener("blur", () => {
    languageLabelInput.classList.remove("bold");
});

translateButton.addEventListener("click", () => {
    // Mostra il popup e avvia il timeout
    timeoutPopup.style.display = "none"; // Nascondi il popup all'inizio
    timeoutActive = true; // Timeout attivo

    // Timeout di 15 secondi per avvisare l'utente se la traduzione richiede troppo tempo
    timeoutId = setTimeout(() => {
        if (timeoutActive) {
            timeoutPopup.querySelector("h2").textContent = "The translation is taking longer than expected.";
            timeoutPopup.querySelector("button").textContent = "Reload page";
            timeoutPopup.style.display = "block";
        }
    }, 15000); // 15 secondi di timeout

    query({ "inputs": translationInput.value }).then((response) => {
        timeoutActive = false; // Timeout non più attivo
        clearTimeout(timeoutId); // Cancella il timeout

        const translatedText = response[0].translation_text;
        translationOutput.value = translatedText;
        timeoutPopup.style.display = "none"; // Nasconde il popup se la traduzione è completata
        updateButtons(); // Abilita/disabilita il pulsante "Copia" dopo la traduzione
    }).catch((error) => {
        timeoutActive = false; // Timeout non più attivo
        clearTimeout(timeoutId); // Cancella il timeout

        translationOutput.value = "An error occurred during translation";
        timeoutPopup.querySelector("h2").textContent = "An error occurred during translation, we suggest you to reload the page, if the error persists you can check your browser console for details";
        timeoutPopup.querySelector("button").textContent = "Reload page";
        timeoutPopup.style.display = "block"; // Mostra il popup con il messaggio di errore

        console.error("Translation Error:", error.message); // Mostra l'errore nella console
    });
});

// Aggiungi evento per il pulsante di refresh nel popup
timeoutPopup.querySelector("button").addEventListener("click", () => {
    location.reload(); // Ricarica la pagina
});

copyButton.addEventListener("click", () => {
    navigator.clipboard.writeText(translationOutput.value).then(() => {
        copySuccessMessage.style.display = "block";
        setTimeout(() => {
            copySuccessMessage.style.display = "none";
        }, 2000);
    }).catch((error) => {
        console.error("Failed to copy text:", error.message); // Mostra l'errore nella console
    });
});
