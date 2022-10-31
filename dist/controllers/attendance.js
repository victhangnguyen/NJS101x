"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.postAttendance = exports.getAttendance = void 0;
//! imp utils
const utils_1 = __importDefault(require("../utils"));
//@ /attendance => GET
const getAttendance = (req, res, next) => {
    //! place that is checked authentication
    const currentUser = req.user;
    res.render('attendance.ejs', {
        path: '/attendance',
        pageTitle: 'Điểm danh',
        user: currentUser,
    });
};
exports.getAttendance = getAttendance;
//@ /attendance => POST
const postAttendance = (req, res, next) => {
    const workplace = req.body.workplace;
    const type = req.query.type;
    // console.log('__Debugger__type: ', type)
    //! __warning
    req.user
        .setStatus(type, workplace)
        .then((userDoc) => {
        return userDoc
            .addAttendance(type)
            .then((attendDoc) => {
            return attendDoc;
        })
            .catch((err) => {
            console.log(err);
        });
    })
        .then((attendDoc) => {
        if (type === 'start') {
            res.render('home.ejs', {
                path: '/',
                pageTitle: 'Attendance | ' + req.user.name,
                user: req.user,
            });
        }
        else {
            //! After have timeOut, we calculate Record that Attendance
            console.log('__Debugger__ctrls__attendance__postAttendance__attendDoc: ', attendDoc);
            attendDoc
                .calcRecord()
                .then((attendDoc) => {
                res.render('attendance-details.ejs', {
                    path: '/attendance',
                    pageTitle: 'Attendance | ' + req.user.name,
                    attendDoc: attendDoc,
                    user: req.user,
                    helper: utils_1.default,
                });
            })
                .catch((err) => {
                console.log(err);
            });
        }
    })
        .catch((err) => {
        console.log(err);
    });
};
exports.postAttendance = postAttendance;
//# sourceMappingURL=attendance.js.map