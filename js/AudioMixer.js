import { pitchToSpeed } from "./maths.js";
import WaveConvertor from "./WaveConvertor.js";

class AudioMixer {
    /** @type {File} */
    #file;

    /** @type {AudioContext} */
    #audioContext;

    /** @type {String} */
    #blob;

    /** @type {HTMLAudioElement} */
    #audioElement;

    /** @type {Boolean} */
    #playerIsPlaying;

    /** @type {AudioBuffer} */
    #cachedAudioBuffer;

    /**
     * @param {File} file
     */
    constructor(file) {
        this.#file = file;
        if (0 === file.size || "audio/mpeg" !== file.type)
            throw new Error("File is either empty or unknowned format.");
        this.#audioContext = new (window.AudioContext ||
            window.webkitAudioContext)();
        this.#blob = (window.URL || window.webkitURL).createObjectURL(file);
        this.#audioElement = document.createElement("audio");
        this.#audioElement.src = this.#blob;
        this.#audioElement.preservesPitch = true;
        this.#playerIsPlaying = false;
        this.#cachedAudioBuffer = null;
    }

    /**
     * @return {String}
     */
    get blob() {
        return this.#blob;
    }

    /**
     * @return {HTMLAudioElement}
     */
    get audioElement() {
        return this.#audioElement;
    }

    /**
     * @param {AudioBuffer} buffer
     * @param {Number} [pitch]
     * @return {Promise<string>}
     */
    async export(buffer, pitch = 1.0) {
        const playbackRate = pitchToSpeed(pitch);
        const audioContext = new OfflineAudioContext({
            numberOfChannels: buffer.numberOfChannels,
            length: buffer.sampleRate * buffer.duration,
            sampleRate: buffer.sampleRate,
        });
        const source = new AudioBufferSourceNode(audioContext, {
            buffer,
            playbackRate,
        });
        source.connect(audioContext.destination);
        source.start();
        const renderedBuffer = await audioContext.startRendering();
        const duration = Math.floor(buffer.duration / playbackRate);
        const waveBuffer = new WaveConvertor(renderedBuffer, duration).toBlob();
        return (window.URL || window.webkitURL).createObjectURL(waveBuffer);
    }

    /**
     * @return {Promise<AudioBuffer>}
     */
    getAudioBuffer() {
        const self = this;
        return new Promise(function (resolve, reject) {
            if (null !== self.#cachedAudioBuffer)
                return self.#cachedAudioBuffer;

            const reader = new FileReader();
            reader.onloadend = function (ev) {
                self.#audioContext.decodeAudioData(
                    ev.target.result,
                    function (buffer) {
                        self.#cachedAudioBuffer = buffer;
                        return resolve(self.#cachedAudioBuffer);
                    }
                );
            };
            reader.onerror = reject;
            reader.readAsArrayBuffer(self.#file);
        });
    }

    /**
     * @param {AudioBuffer} buffer
     * @param {Number} [pitch]
     */
    getPlayer(buffer, pitch = 1.0) {
        /** @type {AudioBufferSourceNode | null} */
        let source = null;
        let pausedAt = 0;
        let playedAt = 0;
        let loop = false;

        return {
            play: () => {
                source = this.#audioContext.createBufferSource();
                source.buffer = buffer;
                source.detune.value = pitch * 100;
                source.connect(this.#audioContext.destination);
                source.loop = loop;
                source.start(0, pausedAt);
                this.#playerIsPlaying = true;
                playedAt = this.#audioContext.currentTime - pausedAt;
                pausedAt = 0;
            },
            pause: () => {
                const elapsed =
                    (source?.context.currentTime || playedAt) - playedAt;
                source?.stop();
                source?.disconnect();
                playedAt = 0;
                pausedAt = elapsed;
                this.#playerIsPlaying = false;
            },
            reset: () => {
                source?.stop();
                pausedAt = 0;
                playedAt = 0;
                this.#playerIsPlaying = false;
            },
            isPlaying: () => this.#playerIsPlaying,
            loop: (isLooping = false) => (loop = isLooping),
        };
    }
}

export default AudioMixer;
