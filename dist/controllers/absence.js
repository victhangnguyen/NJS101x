"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.postAbsence = exports.getAbsence = void 0;
//! imp utils
const utils_1 = __importDefault(require("../utils"));
//! imp models
const absence_1 = __importDefault(require("../models/absence"));
//@ /absence => GET (Register page)
const getAbsence = (req, res, next) => {
    // console.log('__Debugger__absence/getAbsence');
    absence_1.default.find({ userId: req.user._id })
        .then((absencDocs) => {
        //! datesDisabled is helped to user dont allow to choose the dates already
        const datesDisabled = absencDocs.map((abs) => abs.date);
        // console.log('__Debugger__ctrls_absence__getAbsence__datesDisabled: ', datesDisabled);
        const hoursDisabled = absencDocs
            .filter((abs) => !(abs.hours < 8))
            .map((abs) => abs.date);
        // console.log('__Debugger__ctrls_absence__getAbsence__hoursDisabled: ', hoursDisabled);
        const multidate = req.user.annualLeave;
        res.render('absence.ejs', {
            path: '/attendance',
            pageTitle: `Đăng ký nghỉ phép | ${req.user.name}`,
            user: req.user,
            datesDisabled,
            hoursDisabled,
            multidate,
            errorMessage: null,
        });
    })
        .catch((err) => {
        console.log(err);
    });
};
exports.getAbsence = getAbsence;
//@ /absence => POST
const postAbsence = (req, res, next) => {
    const type = req.query.type;
    let hours = type === 'dates' ? 8 : Number(req.body.hours);
    const dates = utils_1.default.toDateArray(req.body.dates, ' - ');
    const reason = req.body.reason;
    //! Add one or many Absence
    req.user
        .addAbsences(type, dates, hours, reason)
        .then((absenceDoc) => {
        console.log('__Debugger__ctrlsAbsences__postAbsence__absenceDo: ', absenceDoc);
        res.redirect('/absence');
    })
        //! catch Error to show errorMessage
        .catch((err) => {
        absence_1.default.find({ userId: req.user._id })
            .then((absencDocs) => {
            //! datesDisabled is helped to user dont allow to choose the dates already
            //! datepicker need VN Date
            const datesDisabled = absencDocs.map((abs) => abs.date);
            const hoursDisabled = absencDocs
                .filter((abs) => !(abs.hours < 8))
                .map((abs) => abs.date);
            // console.log('__Debugger__ctrls_absence__getAbsence__hoursDisabled: ', hoursDisabled);
            const multidate = req.user.annualLeave;
            const errorMessage = err.message;
            res.render('absence.ejs', {
                path: '/attendance',
                pageTitle: `Đăng ký nghỉ phép | ${req.user.name}`,
                user: req.user,
                datesDisabled,
                hoursDisabled,
                multidate,
                errorMessage,
            });
        })
            .catch((err) => {
            console.log(err);
        });
    });
};
exports.postAbsence = postAbsence;
//# sourceMappingURL=absence.js.map