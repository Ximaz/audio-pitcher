class BufferWriter {
    /** @type {DataView} */
    #view;

    /** @type {Boolean} */
    #littleEndian;

    /** @type {Number} */
    #cursor;

    /**
     * @param {Number} bufferLength
     * @param {Boolean} littleEndian
     */
    constructor(bufferLength, littleEndian = true) {
        const buffer = new ArrayBuffer(bufferLength);
        this.#view = new DataView(buffer);
        this.#littleEndian = littleEndian;
        this.#cursor = 0;
    }

    get buffer() {
        return this.#view.buffer;
    }

    get cursor() {
        return this.#cursor;
    }

    get byteLength() {
        return this.buffer.byteLength;
    }

    /**
     * @param {Number} int8
     */
    writeInt8(int8) {
        this.#view.setInt8(this.#cursor, int8);
        this.#cursor += 1;
    }

    /**
     * @param {Number} uint8
     */
    writeUint8(uint8) {
        this.#view.setUint8(this.#cursor, uint8);
        this.#cursor += 1;
    }

    /**
     * @param {Number} int16
     */
    writeInt16(int16) {
        this.#view.setInt16(this.#cursor, int16, this.#littleEndian);
        this.#cursor += 2;
    }

    /**
     * @param {Number} uint16
     */
    writeUint16(uint16) {
        this.#view.setUint16(this.#cursor, uint16, this.#littleEndian);
        this.#cursor += 2;
    }

    /**
     * @param {Number} int32
     */
    writeInt32(int32) {
        this.#view.setInt32(this.#cursor, int32, this.#littleEndian);
        this.#cursor += 4;
    }

    /**
     * @param {Number} uint32
     */
    writeUint32(uint32) {
        this.#view.setUint32(this.#cursor, uint32, this.#littleEndian);
        this.#cursor += 4;
    }

    /**
     * @param {Number} int64
     */
    writeInt64(int64) {
        this.#view.setBigInt64(this.#cursor, int64, this.#littleEndian);
        this.#cursor += 8;
    }

    /**
     * @param {Number} uint64
     */
    writeUint64(uint64) {
        this.#view.setBigUint64(this.#cursor, uint64, this.#littleEndian);
        this.#cursor += 8;
    }

    /**
     * @param {Number} float32
     */
    writeFloat32(float32) {
        this.#view.setFloat32(this.#cursor, float32, this.#littleEndian);
        this.#cursor += 4;
    }

    /**
     * @param {Number} float64
     */
    writeFloat64(float64) {
        this.#view.setFloat64(this.#cursor, float64, this.#littleEndian);
        this.#cursor += 8;
    }
}

export default BufferWriter;
