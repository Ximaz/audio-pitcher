import AudioMixer from "./AudioMixer.js";

/** @type {HTMLInputElement} */
const pitchSlider = document.querySelector("input#pitch");

/** @type {HTMLOutputElement} */
const pitchValue = document.querySelector("output#pitch-value");

function updatePitchValue() {
    pitchValue.textContent = parseFloat(pitchSlider.value).toFixed(2);
}

pitchSlider.oninput = function (ev) {
    updatePitchValue();
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
    playerButton.addEventListener("click", function (ev) {
        if (isPlaying()) {
            ev.currentTarget.textContent = "Play";
            pause();
        } else {
            ev.currentTarget.textContent = "Pause";
            play();
        }
    });
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
