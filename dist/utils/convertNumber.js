"use strict";
/**
 * Adjusts a number to the specified digit.
 *
 * @param {"round" | "floor" | "ceil"} type The type of adjustment.
 * @param {number} value The number.
 * @param {number} exp The exponent (the 10 logarithm of the adjustment base).
 * @returns {number} The adjusted value.
 */
function decimalAdjust(type, value, exp) {
    type = String(type);
    if (!['round', 'floor', 'ceil'].includes(type)) {
        throw new TypeError("The type of decimal adjustment must be one of 'round', 'floor', or 'ceil'.");
    }
    exp = Number(exp);
    value = Number(value);
    if (exp % 1 !== 0 || Number.isNaN(value)) {
        return NaN;
    }
    else if (exp === 0) {
        return Math[type](value);
    }
    const [magnitude, exponent = 0] = value.toString().split('e');
    const adjustedValue = Math[type](`${magnitude}e${exponent - exp}`);
    // Shift back
    const [newMagnitude, newExponent = 0] = adjustedValue.toString().split('e');
    return Number(`${newMagnitude}e${+newExponent + exp}`);
}
// Decimal round
const round10 = (value, exp) => decimalAdjust('round', value, exp);
// Decimal floor
const floor10 = (value, exp) => decimalAdjust('floor', value, exp);
// Decimal ceil
const ceil10 = (value, exp) => decimalAdjust('ceil', value, exp);
//# sourceMappingURL=convertNumber.js.map