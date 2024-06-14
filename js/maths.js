/**
 * @param {Number} min
 * @param {Number} max
 * @param {Number} value
 * @return {Number}
 */
export function clamp(min, max, value) {
    return Math.max(min, Math.min(max, value));
}

/**
 * @param {Number} pitch (detune)
 * @returns {Number} (playbackRate)
 */
export function pitchToSpeed(pitch) {
    return parseFloat(Math.pow(Math.pow(2, 1 / 12), pitch).toFixed(2));
}
