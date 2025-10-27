import WaveConvertor from "./WaveConvertor.js";
import { pitchToSpeed } from "./maths.js";

export default class AudioPlayer {
    static DEFAULT_SEEK_POSITION = 0;

    static DEFAULT_PITCH = 1;

    /** @type {AudioBuffer | null} */
    #audioBuffer = null;

    /** @type {Number} */
    #seekPosition = AudioPlayer.DEFAULT_SEEK_POSITION;

    /** @type {Number} */
    #pitch = AudioPlayer.DEFAULT_PITCH;

    /** @type {AudioContext} */
    #audioContext;

    /** @type {AudioBufferSourceNode | null}  */
    #playerSource = null;

    /** @type {boolean} */
    #isPlaying = false;

    /**
     * AudioPlayer constructor
     * @param {AudioBuffer | null} audioBuffer
     */
    constructor(audioBuffer = null) {
        if (this.#audioBuffer !== null) {
            this.setAudioBuffer(audioBuffer);
        }

        this.#setupAudioContext();
    }

    #setupAudioContext() {
        const audioContextConstructor =
            window.AudioContext ?? window.webkitAudioContext;
        if (audioContextConstructor === undefined) {
            throw new Error(
                "Unable to get a valid AudioContext constructor API."
            );
        }
        this.#audioContext = new audioContextConstructor();
    }

    /**
     * Set the new seek position of the player.
     * @param {Number} seekPosition
     */
    setSeekPosition(seekPosition) {
        this.#seekPosition = seekPosition;
    }

    /**
     * Get the current seek position of the player.
     * @returns {Number}
     */
    getSeekPosition() {
        return this.#seekPosition;
    }

    /**
     * Reset the seek position of the player.
     */
    resetSeekPosition() {
        this.setSeekPosition(0);
    }

    /**
     * Set the new pitch value of the audio being played.
     * @param {Number} pitch
     */
    setPitch(pitch) {
        this.#pitch = pitch;
        if (this.#playerSource !== null) {
            this.#playerSource.detune.value = this.#pitch * 100;
        }
    }

    /**
     * Get the current pitch value of the audio being played.
     * @returns {Number}
     */
    getPitch() {
        return this.#pitch;
    }

    /**
     * Reset the pitch value of the audio being played.
     */
    resetPitch() {
        this.setPitch(1);
    }

    /**
     * Set the new audio buffer of the player.
     * @param {AudioBuffer} audioBuffer
     */
    setAudioBuffer(audioBuffer) {
        this.#audioBuffer = audioBuffer;
        this.resetSeekPosition();
        this.resetPitch();
        this.createPlayerSource();
    }

    /**
     * Reset the audio buffer of the player.
     */
    resetAudioBuffer() {
        this.#audioBuffer = null;
        this.resetPlayerSource();
    }

    /**
     * Return the current audio buffer of the player.
     * @returns {AudioBuffer | null}
     */
    getAudioBuffer() {
        return this.#audioBuffer;
    }

    /**
     * Load an audio buffer from the file.
     * @param {File} file
     * @returns {Promise<void>}
     */
    loadAudioBufferFromFile(file) {
        const reader = new FileReader();
        reader.onloadend = (ev) =>
            this.#audioContext.decodeAudioData(
                ev.target.result,
                (decodedData) => this.setAudioBuffer(decodedData)
            );
        reader.onerror = Promise.reject;
        reader.readAsArrayBuffer(file);
    }

    /**
     * Returns a blob object representing the exported audio buffer.
     * @param {Number | undefined} pitch
     * @returns {Promise<Blob>}
     */
    async createExport(pitch) {
        if (this.#audioBuffer === null) {
            throw new Error(
                "Unable to create a valid player source: audiobuffer is null."
            );
        }

        const playbackRate = pitchToSpeed(pitch ?? this.getPitch());

        const audioContext = new OfflineAudioContext({
            numberOfChannels: this.#audioBuffer.numberOfChannels,
            length: this.#audioBuffer.sampleRate * this.#audioBuffer.duration,
            sampleRate: this.#audioBuffer.sampleRate,
        });

        const source = new AudioBufferSourceNode(audioContext, {
            buffer: this.#audioBuffer,
            playbackRate,
        });

        source.connect(audioContext.destination);
        source.start();
        const renderedBuffer = await audioContext.startRendering();
        source.stop();
        source.disconnect();

        const duration = Math.floor(this.#audioBuffer.duration / playbackRate);
        const waveBuffer = new WaveConvertor(renderedBuffer, duration).toBlob();

        return waveBuffer;
    }

    /**
     * Create a new player source given a valid audio buffer.
     */
    createPlayerSource() {
        if (this.#audioBuffer === null) {
            throw new Error(
                "Unable to create a valid player source: audiobuffer is null."
            );
        }
        if (this.#playerSource !== null) {
            this.resetPlayerSource();
        }
        this.#playerSource = this.#audioContext.createBufferSource();
        this.#playerSource.buffer = this.#audioBuffer;
        this.#playerSource.detune.value = this.getPitch() * 100;
        console.log(this.#playerSource.detune.value);
        this.#playerSource.context.currentTime;
    }

    /**
     * Reset the player source of the player
     */
    resetPlayerSource() {
        if (this.#playerSource === null) {
            return;
        }
        this.#playerSource.disconnect();
        this.#playerSource = null;
    }

    /**
     * Return whether the player is ready to be used.
     * @returns {boolean}
     */
    isReady() {
        return this.#audioBuffer !== null && this.#playerSource !== null;
    }

    /**
     * Stop the player from playing the current audio.
     */
    stop() {
        if (!this.#isPlaying) {
            throw new Error("The player is already not playing the audio.");
        }
        if (this.#playerSource === null) {
            throw new Error("Can't pause an uninitialized player.");
        }

        const currentSeekPosition = this.#playerSource.context.currentTime;
        this.createPlayerSource();
        this.#isPlaying = false;
        this.setSeekPosition(currentSeekPosition);
    }

    /**
     * Start the plating of the current audio.
     */
    start() {
        if (this.#isPlaying) {
            throw new Error("The player is already playing the audio.");
        }
        if (this.#playerSource === null) {
            throw new Error("Can't start an uninitialized player.");
        }
        this.#playerSource.connect(this.#audioContext.destination);
        this.#playerSource.start(0, this.#seekPosition);
        this.#isPlaying = true;
    }

    /**
     * Pause the playing of the current audio.
     * @alias AudioPlayer.stop()
     */
    pause() {
        this.stop();
    }

    /**
     * Resume the playing of the current audio.
     * @alias AudioPlayer.start()
     */
    resume() {
        this.start();
    }

    /**
     * Set the loop status of the player.
     * @param {boolean} loop
     */
    setLoop(loop) {
        if (this.#playerSource === null) {
            throw new Error(
                "Can't change the 'loop' state of an uninitialized player."
            );
        }
        this.#playerSource.loop = loop;
    }

    /**
     * Returns whether the player is currently playing an audio.
     * @returns {boolean}
     */
    isPlaying() {
        return this.#playerSource !== null && this.#isPlaying;
    }
}
