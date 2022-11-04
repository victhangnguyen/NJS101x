"use strict";
// let secondNum = parseInt(this, 10); // don't forget the second param
// let hours   = Math.floor(secondNum / 3600);
// let minutes = Math.floor((secondNum - (hours * 3600)) / 60);
// let seconds = secondNum - (hours * 3600) - (minutes * 60);
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertSecondsToTimeString = void 0;
// if (hours   < 10) {hours   = "0"+hours;}
// if (minutes < 10) {minutes = "0"+minutes;}
// if (seconds < 10) {seconds = "0"+seconds;}
// return hours+':'+minutes+':'+seconds;
function padTo2Digits(num) {
    return num.toString().padStart(2, '0');
}
function convertSecondsToTimeString(secs) {
    let secondNum = Math.floor(secs);
    let hours = Math.floor(secondNum / 3600);
    let minutes = Math.floor((secondNum - hours * 3600) / 60);
    let seconds = secondNum - hours * 3600 - minutes * 60;
    if (hours < 10) {
        hours = '0' + hours;
    }
    if (minutes < 10) {
        minutes = '0' + minutes;
    }
    if (seconds < 10) {
        seconds = '0' + seconds;
    }
    return hours + ':' + minutes + ':' + seconds;
}
exports.convertSecondsToTimeString = convertSecondsToTimeString;
//# sourceMappingURL=convertSecondsToTimeString.js.map