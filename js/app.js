import AudioMixer from "./AudioMixer.js";

/** @type {HTMLInputElement} */
const pitchSlider = document.querySelector("input#pitch");

/** @type {HTMLOutputElement} */
const pitchValue = document.querySelector("output#pitch-value");

/** @type {AudioMixer | null} */
let currentMixer = null;

/** @type {String | null} */
let currentFilename = null;

/** @type {HTMLInputElement | null} */
const fileInput = document.querySelector("input#audio");

/** @type {HTMLButtonElement | null} */
const playerButton = document.querySelector("button#player-button");

/** @type {HTMLButtonElement | null} */
const exportButton = document.querySelector("button#export");

/** @type {HTMLParagraphElement | null} */
const processIndicator = document.querySelector("p#process-indicator");

function updatePitchValue() {
    const pitchValue = parseFloat(pitchSlider.value);
    processIndicator.textContent = pitchValue.toFixed(2);
    const player = currentMixer.getPlayer();
    player.setPitch(pitchValue);
}

/** @param {Event} ev */
function playPauseHandler(ev) {
    const player = currentMixer.getPlayer();
    console.log(player.isReady());
    player.setLoop(true);
    if (player.isPlaying()) {
        ev.currentTarget.textContent = "Play";
        player.pause();
    } else {
        ev.currentTarget.textContent = "Pause";
        player.resume();
    }
}

async function exportModifiedSource(_ev) {
    exportButton.disabled = true;
    pitchSlider.disabled = true;
    processIndicator.textContent = "Exporting...";

    const pitch = parseFloat(pitchSlider.value);
    const { constructor, destructor } = await currentMixer.export(pitch);

    const a = document.createElement("a");
    a.href = constructor();

    const pitchState = pitch < 1 ? "(Slowed down)" : "(Sped Up)";
    a.download = `${currentFilename} ${pitchState}.wav`;
    a.click();

    destructor();
    processIndicator.textContent = "";
    pitchSlider.disabled = false;
    exportButton.disabled = false;
}

pitchSlider.oninput = (_ev) => {
    playerButton.disabled = true;
    updatePitchValue();
    playerButton.disabled = false;
};

fileInput.oninput = async (ev) => {
    if (1 !== ev.currentTarget.files.length) return;

    /** @type {File[]} */
    const files = ev.currentTarget.files;
    const file = files[0];

    currentMixer = new AudioMixer(file);
    await currentMixer.loadAudioBuffer();
    updatePitchValue();
    currentFilename = file.name.split(".").slice(0, -1).join(".");
};

playerButton.onclick = playPauseHandler;
exportButton.onclick = exportModifiedSource;
