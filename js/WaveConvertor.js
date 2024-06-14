import BufferWriter from "./BufferWriter.js";
import { clamp } from "./maths.js";

class WaveConvertor {
    /** @type {AudioBuffer} */
    #audioBuffer;

    /** @type {Number} */
    #fileLength;

    /** @type {BufferWriter} */
    #buffer;

    /** @type {Float32Array[]} */
    #channels;

    /** @type {Number} */
    #bitsPerSample;

    /** @type {Number} */
    #bytesPerSample;

    /** @type {Number} */
    #bytesPerSecond;

    /** @type {Number} */
    #dataLength;

    /**
     * @param {AudioBuffer} audioBuffer
     * @param {Number} [audioDuration] // In seconds
     */
    constructor(audioBuffer, audioDuration) {
        const WAVE_HEADER_LENGHT = 44;
        this.#audioBuffer = audioBuffer;
        this.#channels = [
            ...Array(this.#audioBuffer.numberOfChannels).keys(),
        ].map((i) => this.#audioBuffer.getChannelData(i));
        this.#bitsPerSample = 16;
        this.#bytesPerSample =
            (this.#bitsPerSample / 8) * this.#channels.length;
        this.#bytesPerSecond =
            this.#audioBuffer.sampleRate * this.#bytesPerSample;
        this.#dataLength =
            this.#audioBuffer.sampleRate *
            (audioDuration ?? audioBuffer.duration) *
            this.#bytesPerSample;
        this.#fileLength = this.#dataLength + WAVE_HEADER_LENGHT;
        this.#buffer = new BufferWriter(this.#fileLength, true);
        this.#write();
    }

    #writeHeader() {
        this.#buffer.writeUint32(0x46464952); // "RIFF"
        this.#buffer.writeUint32(this.#fileLength); // file length in bytes
        this.#buffer.writeUint32(0x45564157); // "WAVE"

        this.#buffer.writeUint32(0x20746d66); // "fmt "
        this.#buffer.writeUint32(16); // size of FMT chunk in bytes (usually 16)
        this.#buffer.writeUint16(1); // compression code: PCM
        this.#buffer.writeUint16(this.#channels.length);
        this.#buffer.writeUint32(this.#audioBuffer.sampleRate);
        this.#buffer.writeUint32(this.#bytesPerSecond);
        this.#buffer.writeUint16(this.#bytesPerSample); // 2=16-bit mono, 4=16-bit stereo
        this.#buffer.writeUint16(this.#bitsPerSample);

        this.#buffer.writeUint32(0x61746164); // "data"
        this.#buffer.writeUint32(this.#dataLength);
    }

    #write() {
        let sampleIdx = 0;

        this.#writeHeader();
        while (this.#buffer.cursor < this.#fileLength) {
            for (const channel of this.#channels) {
                const sample = clamp(-1, 1, channel[sampleIdx]);
                const scaledSample =
                    sample * ((1 << (this.#bitsPerSample - 1)) - 1);
                this.#buffer.writeInt16(scaledSample);
            }
            ++sampleIdx;
        }
        return this.#buffer;
    }

    toBlob() {
        return new Blob([this.#buffer.buffer], { type: "audio/wav" });
    }
}

export default WaveConvertor;
