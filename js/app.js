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

function getPtichPlayer () {
    const pitch = parseFloat(pitchSlider.value);
    const { play, pause, isPlaying } = currentMixer.getPlayer(currentBuffer, pitch);
    return { play, pause, isPlaying };
}

function updatePitchValue() {
    pitchValue.textContent = parseFloat(pitchSlider.value).toFixed(2);
}

/** @param {Event} ev */
function playPauseHandler(ev) {
    const { play, pause, isPlaying } = currentPlayer || getPtichPlayer();
    if (isPlaying()) {
        ev.currentTarget.textContent = "Play";
        pause();
    } else {
        ev.currentTarget.textContent = "Pause";
        play();
    }
}

pitchSlider.oninput = function (ev) {
    updatePitchValue();
    currentPlayer.pause();
    playerButton.removeEventListener("click", playPauseHandler);
    currentPlayer = getPtichPlayer();
    playerButton.addEventListener("click", playPauseHandler);
};

updatePitchValue();

const fileInput = document.querySelector("input#audio");
const playerButton = document.querySelector("button#player-button");
const exportButton = document.querySelector("button#export");

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
    playerButton.addEventListener("click", playPauseHandler);
    exportButton.addEventListener("click", async function (ev) {
        const url = await audioMixer.export(audioBuffer, pitch);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${file.name.split(".").slice(0, -1).join(".")} ${
            pitch < 1 ? "(Slowed down)" : "(Sped Up)"
        }.wav`;
        a.click();
    });
};
