"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const MAXIMUM_WORKING_HOURS = 8;
const mongoose_1 = __importDefault(require("mongoose"));
const utils_1 = __importDefault(require("../utils"));
//! imp models
const attendance_1 = __importDefault(require("./attendance"));
const covidStatus_1 = __importDefault(require("./covidStatus"));
const absence_1 = __importDefault(require("./absence"));
const Logging_1 = __importDefault(require("../library/Logging"));
//! <EnforcedDocType = any, M = Model<EnforcedDocType, any, any, any>, TInstanceMethods = {}>
const userSchema = new mongoose_1.default.Schema({
    username: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    dob: {
        type: Date,
        required: true,
    },
    salaryScale: {
        type: Number,
        required: true,
    },
    startDate: {
        type: Date,
        required: true,
    },
    department: {
        type: String,
        required: true,
    },
    annualLeave: {
        type: Number,
        required: true,
    },
    image: {
        type: String,
        required: true,
    },
    status: {
        isWorking: {
            type: Boolean,
            required: true,
        },
        workplace: {
            type: String,
            required: true,
        },
    },
    healthStatus: {
        covidStatusId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'CovidStatus' },
    },
    manage: {
        userId: {
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: 'User',
        },
        staffs: [
            {
                type: mongoose_1.default.Schema.Types.ObjectId,
                ref: 'User',
            },
        ],
    },
});
userSchema.methods.setStatus = function (type, workplace) {
    this.status.workplace = workplace ? workplace : 'Vị trí chưa xác định';
    if (type === 'start') {
        this.status.isWorking = true;
    }
    else {
        this.status.isWorking = false;
    }
    return this.save();
};
userSchema.methods.addCovidStatus = function (type, temp = undefined, name = undefined, date = undefined) {
    return covidStatus_1.default.findOne({ userId: this._id })
        .then((covidStatusDoc) => {
        let update;
        switch (type) {
            case 'bodytemp':
                //! create New Body Temperature
                const newBodyTemps = [...covidStatusDoc === null || covidStatusDoc === void 0 ? void 0 : covidStatusDoc.bodyTemperatures];
                newBodyTemps.push({
                    date: new Date(),
                    temp: temp,
                });
                update = { bodyTemperatures: newBodyTemps };
                break;
            case 'vaccination':
                //! create new Vaccine Document
                const newVaccines = [...covidStatusDoc === null || covidStatusDoc === void 0 ? void 0 : covidStatusDoc.vaccines];
                newVaccines.push({
                    name: name,
                    date: date,
                });
                update = { vaccines: newVaccines };
                break;
            case 'positive':
                //! crate new Positive Document
                const newPositive = [...covidStatusDoc === null || covidStatusDoc === void 0 ? void 0 : covidStatusDoc.positive];
                newPositive.push({ date: date });
                update = { positive: newPositive };
                break;
            default:
                update = {};
        }
        return covidStatus_1.default.findOneAndUpdate({ userId: this._id }, update, {
            new: true,
        });
    })
        .catch((err) => {
        console.log(err);
    });
};
userSchema.methods.addAttendance = function (type, date) {
    const currentDate = new Date();
    //! initialize the Date to midnight
    // console.log('__Debugger__models_Users__addAttendance__date: ', date);
    return attendance_1.default.findOne({ userId: this._id, date: date }).then((attendDoc) => {
        // console.log('__Debugger__model__user__attendDoc: ', attendDoc);
        //! add timeIn to Record
        if (type === 'start') {
            const newRecord = {
                timeIn: new Date(),
                timeOut: undefined,
                workplace: this.status.workplace,
            };
            if (!attendDoc) {
                //! create new AttendDoc
                Logging_1.default.success('Initialize first Attendance');
                return attendance_1.default.create({
                    userId: this._id,
                    date: currentDate.toLocaleDateString('vi-VN', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                    }),
                    timeRecords: [newRecord],
                });
            }
            else {
                //! if Attendance exist, add new Record into timeRecord
                attendDoc.timeRecords.push(newRecord);
            }
        }
        //! add timeOut to Record
        //! if type === 'end', we update the Record that added timeIn
        else {
            //! find Index of record that inside the timeRecords
            const lastedElementIndex = (attendDoc === null || attendDoc === void 0 ? void 0 : attendDoc.timeRecords.length) - 1;
            console.log('lastedElementIndex: ', lastedElementIndex);
            const currentRecord = attendDoc.timeRecords[lastedElementIndex];
            console.log('currentRecord: ', currentRecord);
            currentRecord.timeOut = currentDate;
            attendDoc.timeRecords[lastedElementIndex] = currentRecord;
        }
        return attendDoc.save();
    });
};
userSchema.methods.addAbsences = function (type, dates, hours, reason) {
    console.log('__Debugger__models_User__dates: ', dates);
    //! dates: ISO date
    return (absence_1.default.find({ _userId: this._id })
        //! find all of Absence that Belongs to userId
        .then((absenceDocs) => {
        //! Throw Error if clause
        if (hours > MAXIMUM_WORKING_HOURS) {
            throw new Error('Thời gian tối đa bạn được phép thêm là 8 giờ');
        }
        if (type === 'dates') {
            if (this.annualLeave < dates.length) {
                throw new Error(`You have registered ${dates.length} dates over ${this.annualLeave} allowable dates`);
            }
        }
        else {
            if (this.annualLeave === 0) {
                throw new Error(`You cannot register this, due to annualLeave is ${this.annualLeave}`);
            }
        }
        //! ADD MANY ABSENCES
        const absDocArray = dates.map((date) => {
            const dateStringVN = date.toLocaleDateString('vi-VN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
            });
            return attendance_1.default.findOne({ date: dateStringVN }).then((attendanceDoc) => {
                // console.log('__Debugger__models_User__addAbsences__attendanceDoc: ', attendanceDoc);
                const existingAbsenceDoc = absenceDocs.find((absence) => absence.date === dateStringVN);
                console.log('existingAbsenceDoc: ', existingAbsenceDoc);
                if (existingAbsenceDoc) {
                    if (type === 'dates') {
                        throw new Error(`${date} is registered`);
                    }
                    else {
                        let curTimeWorkingAttend = 0;
                        //! guard clause
                        if (attendanceDoc) {
                            curTimeWorkingAttend = utils_1.default.round((attendanceDoc === null || attendanceDoc === void 0 ? void 0 : attendanceDoc.totalTime) / (1000 * 60 * 60));
                            console.log('attendanceDoc existing');
                        }
                        console.log('__Debugger__models_User__curTimeWorkingAttend: ', curTimeWorkingAttend);
                        console.log('__Debugger__models_User__existingAbsenceDoc.hours: ', existingAbsenceDoc.hours);
                        if (curTimeWorkingAttend + existingAbsenceDoc.hours + hours <=
                            MAXIMUM_WORKING_HOURS) {
                            existingAbsenceDoc.hours += hours;
                            return existingAbsenceDoc.save();
                        }
                        else {
                            throw new Error(`Ngày ${date} bạn đã làm ${curTimeWorkingAttend} giờ và đăng ký nghỉ phép ${existingAbsenceDoc.hours} giờ. Bạn chỉ được thêm tối đa ${utils_1.default.round(MAXIMUM_WORKING_HOURS -
                                curTimeWorkingAttend -
                                existingAbsenceDoc.hours)} giờ nữa!`);
                        }
                    }
                }
                else {
                    //! crate new Absence if no absence
                    return absence_1.default.create({
                        userId: this._id,
                        date: dateStringVN,
                        hours: type === 'dates' ? MAXIMUM_WORKING_HOURS : hours,
                        reason: reason,
                    })
                        .then((absenceDoc) => {
                        return absenceDoc;
                    })
                        .catch((err) => {
                        console.log(err);
                    });
                }
            });
        });
        return Promise.all(absDocArray)
            .then((absenceDocs) => {
            console.log('__Debugger__models_User__addAbseces__Promise_resolve__absenceDocs: ', absenceDocs);
            if (type === 'dates') {
                //! if type is dates, every days correspond with 8 hours
                this.annualLeave -= absenceDocs.length;
                return this.save().then((userDoc) => {
                    return absenceDocs;
                });
            }
            else {
                this.annualLeave = utils_1.default.round(this.annualLeave - hours / MAXIMUM_WORKING_HOURS);
                return this.save().then((userDoc) => {
                    return absenceDocs;
                });
            }
        })
            .catch((err) => {
            throw new Error(err.message);
        });
    })
        .catch((err) => {
        throw new Error(err.message);
    }));
};
userSchema.methods.getStatistic = function () {
    const statistics = [];
    return attendance_1.default.find({ userId: this._id })
        .then((attendanceDocs) => {
        attendanceDocs.forEach((attendance) => {
            attendance.timeRecords.forEach((record) => {
                statistics.push({
                    attendanceId: attendance._id,
                    preference: 0,
                    type: 'attendance',
                    lines: 1,
                    date: attendance.date,
                    timeRecord: record,
                });
            });
        });
        return absence_1.default.find({ userId: this._id }).then((absenceDocs) => {
            absenceDocs.forEach((absence) => {
                statistics.push({
                    preference: 1,
                    type: 'absence',
                    lines: 2,
                    date: absence.date,
                    hours: absence.hours,
                    reason: absence.reason,
                });
            });
            statistics.sort((a, b) => {
                return a.preference - b.preference;
            });
            statistics.sort((a, b) => {
                return new Date(a.date).valueOf() - new Date(b.date).valueOf();
            });
            // console.log('__Debugger__models__user__getStatistic__statistics: ', statistics)
            return statistics;
        });
    })
        .catch((err) => {
        console.log(err);
    });
};
const User = mongoose_1.default.model('User', userSchema);
exports.default = User;
//# sourceMappingURL=user.js.map