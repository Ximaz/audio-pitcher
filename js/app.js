import AudioMixer from "./AudioMixer.js";

/** @type {HTMLInputElement} */
const pitchSlider = document.querySelector("input#pitch");

/** @type {HTMLOutputElement} */
const pitchValue = document.querySelector("output#pitch-value");

/** @type {AudioMixer | null} */
let currentMixer = null;

/** @type {AudioBuffer | null} */
let currentBuffer = null;

/** @type {Object | null} */
let currentPlayer = null;

/** @type {String | null} */
let currentFilename = null;


const fileInput = document.querySelector("input#audio");
const playerButton = document.querySelector("button#player-button");
const exportButton = document.querySelector("button#export");
const processIndicator = document.querySelector("p#process-indicator");

function getPitchPlayer () {
    const pitch = parseFloat(pitchSlider.value);
    const { play, pause, isPlaying } = currentMixer.getPlayer(currentBuffer, pitch);
    return { play, pause, isPlaying };
}

function updatePitchValue() {
    pitchValue.textContent = parseFloat(pitchSlider.value).toFixed(2);
}

/** @param {Event} ev */
function playPauseHandler(ev) {
    const { play, pause, isPlaying } = currentPlayer || getPitchPlayer();
    if (isPlaying()) {
        ev.currentTarget.textContent = "Play";
        pause();
    } else {
        ev.currentTarget.textContent = "Pause";
        play();
    }
}

async function exportModifiedSource(ev) {
    exportButton.disabled = true;
    pitchSlider.disabled = true;
    processIndicator.textContent = "Exporting...";

    const pitch = parseFloat(pitchSlider.value);
    const url = await currentMixer.export(currentBuffer, pitch);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${currentFilename.split(".").slice(0, -1).join(".")} ${
        pitch < 1 ? "(Slowed down)" : "(Sped Up)"
    }.wav`;
    a.click();

    exportButton.disabled = false;
    pitchSlider.disabled = false;
    processIndicator.textContent = "";
}


pitchSlider.oninput = function (ev) {
    updatePitchValue();
    if (!currentPlayer) return;
    currentPlayer.pause();
    playerButton.removeEventListener("click", playPauseHandler);
    currentPlayer = getPitchPlayer();
    playerButton.addEventListener("click", playPauseHandler);
};

updatePitchValue();


fileInput.oninput = async function (ev) {
    if (1 !== ev.currentTarget.files.length) return;
    /** @type {File} */
    const file = ev.currentTarget.files[0];
    const audioMixer = new AudioMixer(file);
    const audioBuffer = await audioMixer.getAudioBuffer();
    const pitch = parseFloat(pitchSlider.value);
    const { play, pause, isPlaying } = audioMixer.getPlayer(audioBuffer, pitch);
    currentMixer = audioMixer;
    currentBuffer = audioBuffer;
    currentPlayer = { play, pause, isPlaying };
    currentFilename = file.name;
    playerButton.addEventListener("click", playPauseHandler);
    exportButton.addEventListener("click", exportModifiedSource);
};
