"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
//! <EnforcedDocType = any, M = Model<EnforcedDocType, any, any, any>, TInstanceMethods = {}>
const attendanceSchema = new mongoose_1.default.Schema({
    userId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    date: { type: String, required: true },
    dateAt: { type: Date, required: true },
    totalTime: { type: Number },
    timeRecords: [
        {
            timeIn: { type: Date },
            timeOut: { type: Date },
            timeWorking: { type: String },
            workplace: { type: String },
        },
    ],
}, { timestamps: true });
attendanceSchema.methods.calcRecord = function () {
    const currentTimeRecords = [...this.timeRecords];
    let totalTime = 0;
    const calculatedTimeRecords = currentTimeRecords.map((record) => {
        let timeWorking = Math.abs(record.timeOut - record.timeIn) / 1000; //! seconds
        totalTime += timeWorking;
        return {
            ...record,
            timeWorking,
        };
    });
    this.totalTime = Math.floor(totalTime); //! seconds
    this.timeRecords = calculatedTimeRecords;
    return this.save();
};
const Attendance = mongoose_1.default.model('Attendance', attendanceSchema);
exports.default = Attendance;
//# sourceMappingURL=attendance.js.map