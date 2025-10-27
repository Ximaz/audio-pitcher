import AudioPlayer from "./AudioPlayer.js";

class AudioMixer {
    /** @type {File} */
    #file;

    /** @type {AudioPlayer} */
    #audioPlayer = new AudioPlayer();

    /**
     * @param {File} file
     */
    constructor(file) {
        if (0 === file.size || "audio/mpeg" !== file.type) {
            throw new Error("File is either empty or unknowned format.");
        }
        this.#file = file;
    }

    /**
     * Return the current audio player.
     * @returns {AudioPlayer}
     */
    getPlayer() {
        return this.#audioPlayer;
    }

    /**
     * Create a constructor and destructor for the new 'audio' HTML element.
     */
    toAudioElement() {
        const urlConstructor = window.URL ?? window.webkitURL;
        if (undefined === urlConstructor) {
            throw new Error("Unable to get a valid URL constructor API.");
        }

        const blobUrl = urlConstructor.createObjectURL(file);

        const constructor = () => {
            const audioElement = document.createElement("audio");
            audioElement.src = blobUrl;
            audioElement.preservesPitch = true;
            return audioElement;
        };

        const destructor = () => {
            urlConstructor.revokeObjectURL(blobUrl);
        };

        return { constructor, destructor };
    }

    /**
     * @return {Promise<AudioBuffer>}
     */
    async loadAudioBuffer() {
        await this.#audioPlayer.loadAudioBufferFromFile(this.#file);
    }

    /**
     * Create a constructor and destructor for the audio blob export.
     * @param {Number | undefined} pitch
     */
    async export(pitch) {
        const urlConstructor = window.URL ?? window.webkitURL;
        if (undefined === urlConstructor) {
            throw new Error("Unable to get a valid URL constructor API.");
        }
        const blob = await this.#audioPlayer.createExport(pitch);
        const blobUrl = urlConstructor.createObjectURL(blob);

        const constructor = () => blobUrl;

        const destructor = () => urlConstructor.revokeObjectURL(blobUrl);

        return { constructor, destructor };
    }
}

export default AudioMixer;
