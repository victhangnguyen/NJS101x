"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFile = void 0;
const fs = require('fs');
const deleteFile = (filePath) => {
    fs.unlink(filePath, (err) => {
        if (err) {
            throw err;
        }
    });
};
exports.deleteFile = deleteFile;
//# sourceMappingURL=file.js.map