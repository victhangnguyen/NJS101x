"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFile = void 0;
const fs = require('fs');
const deleteFile = (filePath) => {
    fs.unlink(filePath, (err) => {
        if (err) {
            // throw new Error(err.message);
            console.log('__Error__utils__file__deleteFile__err: ', err);
        }
    });
};
exports.deleteFile = deleteFile;
//# sourceMappingURL=file.js.map