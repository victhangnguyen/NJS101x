"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const multer_1 = __importDefault(require("multer"));
//! Middleware Multer
const fileStorage = multer_1.default.diskStorage({
    destination: (request, file, callback) => {
        callback(null, 'dist/images');
    },
    filename: (req, file, callback) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        callback(null, file.fieldname + '-' + uniqueSuffix + '.png');
    },
});
const fileFilter = (request, file, callback) => {
    if (file.mimetype === 'image/png' ||
        file.mimetype === 'image/jpg' ||
        file.mimetype === 'image/jpeg') {
        callback(null, true);
    }
    else {
        callback(null, false);
    }
};
const upload = (0, multer_1.default)({ storage: fileStorage, fileFilter: fileFilter });
exports.default = upload;
//# sourceMappingURL=mutler.js.map