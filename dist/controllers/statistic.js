"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStatisticSearch = exports.postStatisticDelete = exports.getStatisticDetails = exports.getStatistic = void 0;
const utils_1 = __importDefault(require("../utils"));
//! models
const user_1 = __importDefault(require("../models/user"));
const attendance_1 = __importDefault(require("../models/attendance"));
//@ /statistic => GET
const getStatistic = (req, res, next) => {
    user_1.default.findById(req.user._id)
        .populate({
        path: 'manage.staffs',
    })
        .then((userDoc) => {
        userDoc === null || userDoc === void 0 ? void 0 : userDoc.getStatistic().then((statistics) => {
            // console.log(statistics);
            res.render('statistic.ejs', {
                path: '/statistic',
                pageTitle: 'Tra cứu thông tin giờ làm - lương',
                user: userDoc,
                statistics,
                helper: utils_1.default,
            });
        }).catch((err) => {
            console.log(err);
        });
    })
        .catch((err) => {
        console.log(err);
    });
};
exports.getStatistic = getStatistic;
const getStatisticDetails = (req, res, next) => {
    const userId = req.params.userId;
    // console.log('__Debugger__ctrls__statstic__req.user: ', userId);
    user_1.default.findById(userId)
        .then((userDoc) => {
        userDoc === null || userDoc === void 0 ? void 0 : userDoc.getStatistic().then((statistics) => {
            // console.log(statistics);
            res.render('statisticDetails.ejs', {
                path: '/statistic',
                pageTitle: 'Tra cứu thông tin giờ làm - lương',
                user: userDoc,
                statistics,
                helper: utils_1.default,
                staffId: userId,
            });
        }).catch((err) => {
            console.log(err);
        });
    })
        .catch((err) => {
        console.log(err);
    });
    // User.findById(req.user._id)
    //   .populate({
    //     path: 'manage.staffs',
    //   })
    //   .then((userDoc) => {
    //     userDoc
    //       ?.getStatistic()
    //       .then((statistics: any) => {
    //         console.log(statistics);
    //         res.render('statistic.ejs', {
    //           path: '/statistic',
    //           pageTitle: 'Tra cứu thông tin giờ làm - lương',
    //           user: userDoc,
    //           statistics,
    //           helper: utils,
    //         });
    //       })
    //       .catch((err: Error) => {
    //         console.log(err);
    //       });
    //   })
    //   .catch((err) => {
    //     console.log(err);
    //   });
};
exports.getStatisticDetails = getStatisticDetails;
const postStatisticDelete = (req, res, next) => {
    const userI = req.params.userId;
    const attendanceId = req.body.attendanceId;
    console.log('__Debugger__ctrls__statistic__postStatisticDelete__attendanceId: ', attendanceId);
    const recordTimeIn = new Date(req.body.recordTimeIn).toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    });
    attendance_1.default.findById(attendanceId)
        .then((attendanceDoc) => {
        const currentTimeRecords = attendanceDoc === null || attendanceDoc === void 0 ? void 0 : attendanceDoc.timeRecords;
        const newTimeRecords = currentTimeRecords === null || currentTimeRecords === void 0 ? void 0 : currentTimeRecords.filter((record) => {
            var _a;
            const recordTimeInString = (_a = record.timeIn) === null || _a === void 0 ? void 0 : _a.toLocaleTimeString('vi-VN', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
            });
            return recordTimeInString !== recordTimeIn;
        });
        attendanceDoc.timeRecords = newTimeRecords;
        attendanceDoc
            .save()
            .then((attendanceDoc) => {
            //! render
            res.redirect(`/statistic/`);
        })
            .catch((err) => {
            console.log(err);
        });
    })
        .catch((err) => {
        console.log(err);
    });
};
exports.postStatisticDelete = postStatisticDelete;
//@ /statisticsearch => GET
const getStatisticSearch = (req, res, next) => {
    //! initial keyword: All
    const search = req.query.search
        ? req.query.search
        : '*';
    console.log('__Debugger__ctrls__statistic__getStatisticSearch__search: ', search);
    const lines = +req.query.lines;
    console.log('__Debugger__ctrls__statistic__getStatisticSearch__lines: ', lines);
    req.user
        .getStatistic()
        .then((statistics) => {
        const filteredStatistics = statistics
            .filter((statistic) => utils_1.default.matchRuleShort(statistic.date, search))
            .filter((statistic) => { });
        // console.log('__Debugger__ctrls__statistic__getStatisticSearch__filteredStatistics: ', filteredStatistics)
        //! guard clause
        if (filteredStatistics.length > 0) {
            let salaryTimeTotal = 0;
            filteredStatistics.forEach((statistic) => {
                if (statistic.type === 'attendance') {
                    //! only handling 'attendance'
                    statistic.salaryTime = statistic.totalTime / 3600 - 8;
                    const existingAbsence = statistics.find((sta) => sta.type === 'absence' && sta.date === statistic.date);
                    if (existingAbsence) {
                        // console.log(
                        //   '__Debugger__ctrls__Statistic__getStatisticSearch__existingAbsence: ',
                        //   existingAbsence
                        // );
                        //! Số giờ làm còn thiếu là khi chưa đủ 8h/ngày kể cả đã cộng annualLeave của ngày đó.
                        if (statistic.salaryTime < 8) {
                            statistic.salaryTime =
                                statistic.totalTime / 3600 + existingAbsence.hours < 8
                                    ? statistic.totalTime / 3600 + existingAbsence.hours - 8
                                    : 8;
                        }
                    }
                    salaryTimeTotal += statistic.salaryTime;
                }
                // console.log(
                //   '__Debugger__ctrls__Statistic__getStatisticSearch__attendance: ',
                //   statistic
                // );
            });
            const salary = Math.floor(req.user.salaryScale * 3000000 + salaryTimeTotal * 200000);
            // console.log(
            //   '__Debugger__ctrls__Statistic__getStatisticSearch__salaryTimeTotal: ',
            //   salaryTimeTotal
            // );
            // console.log(
            //   '__Debugger__ctrls__Statistic__getStatisticSearch__salary: ',
            //   salary
            // );
            res.render('statistic-search.ejs', {
                path: '/statisticsearch',
                pageTitle: 'Tra cứu thông tin giờ làm - lương',
                user: req.user,
                statistics: filteredStatistics,
                salary: salary,
                salaryTimeTotal,
                helper: utils_1.default,
            });
        }
        else {
            res.render('statistic-search.ejs', {
                path: '/statisticsearch',
                pageTitle: 'Tra cứu thông tin giờ làm - lương',
                user: req.user,
                statistics: [],
                salary: 0,
                salaryTimeTotal: 0,
                helper: utils_1.default,
            });
        }
    })
        .catch((err) => {
        console.log(err);
    });
};
exports.getStatisticSearch = getStatisticSearch;
//# sourceMappingURL=statistic.js.map