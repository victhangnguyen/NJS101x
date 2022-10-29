"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const absenceSchema = new mongoose_1.default.Schema({
    userId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    date: {
        type: String,
        required: true,
    },
    hours: {
        type: Number,
        required: true,
    },
    reason: {
        type: String,
        required: true,
    },
});
const Absence = mongoose_1.default.model('Absence', absenceSchema);
exports.default = Absence;
//# sourceMappingURL=absence.js.map