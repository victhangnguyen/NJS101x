"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStatisticSearch = exports.postStatisticAction = exports.getStatisticDetails = exports.getStatistic = void 0;
const utils_1 = __importDefault(require("../utils"));
//! models
const user_1 = __importDefault(require("../models/user"));
//@ /statistic => GET
const getStatistic = (req, res, next) => {
    user_1.default.findById(req.user._id)
        .populate({
        path: 'manage.staffs',
    })
        .then((userDoc) => {
        res.status(200).render('statistic.ejs', {
            path: '/statistic',
            pageTitle: 'Tra cứu thông tin giờ làm - lương',
            user: userDoc,
            helper: utils_1.default,
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
    let message = req.flash('error');
    if (message.length > 0) {
        message = message[0];
    }
    else {
        message = null;
    }
    user_1.default.findById(userId)
        .then((userDoc) => {
        userDoc === null || userDoc === void 0 ? void 0 : userDoc.getStatistic('latestMonth').then((statistics) => {
            console.log('__Debugger__ctrls__statistic__getStatisticDetails__statistic: ', statistics);
            res.render('statisticDetails.ejs', {
                path: '/statistic',
                pageTitle: 'Tra cứu thông tin giờ làm - lương',
                user: req.user,
                statistics,
                helper: utils_1.default,
                staff: userDoc,
                errorMessage: message,
            });
        }).catch((err) => {
            console.log(err);
        });
    })
        .catch((err) => {
        console.log(err);
    });
};
exports.getStatisticDetails = getStatisticDetails;
const postStatisticAction = (req, res, next) => {
    //! route: /statistic/:userId
    const userId = req.params.userId;
    const action = req.query.action;
    console.log('__Debugger__ctrls__statistic__postStatisticAction__action: ', action);
    switch (action) {
        //! ACTION = delete
        case 'delete':
            const attendanceId = req.body.attendanceId;
            const recordTimeIn = req.body.recordTimeIn;
            user_1.default.findById(userId)
                .then((userDoc) => {
                const selectedMonth = new Date(recordTimeIn).getMonth() + 1;
                console.log('__Debugger__ctrls__statistic__postStatistic__selectedMonth: ', selectedMonth);
                const existingConfirmMonth = userDoc === null || userDoc === void 0 ? void 0 : userDoc.status.confirmMonth.find((cmonth) => {
                    return cmonth === selectedMonth;
                });
                console.log('__Debugger__ctrls__statistic__postStatistic__existingConfirmMonth: ', existingConfirmMonth);
                if (!existingConfirmMonth) {
                    userDoc === null || userDoc === void 0 ? void 0 : userDoc.deleteTimeRecord(attendanceId, recordTimeIn).then((attendanceDoc) => {
                        // console.log(
                        //   '__Debugger__ctrls__statistic__postStatistic__attendanceDoc: ',
                        //   attendanceDoc
                        // );
                        res.redirect(`/statistic/${userId}`);
                    }).catch((err) => {
                        console.log(err);
                    });
                }
                else {
                    req.flash('error', `Admin đã khóa Tháng ${selectedMonth}. Bạn không thể thay đổi được!`);
                    res.redirect(`/statistic/${userId}`);
                }
            })
                .catch((err) => {
                console.log(err);
            });
            break;
        //! ACTION = confirm
        case 'confirm':
            const confirmMonth = +req.body.confirmMonth;
            console.log('__Debugger__ctrls__statistic__postStatisticAction: ', confirmMonth);
            user_1.default.findById(userId)
                .then((userDoc) => {
                return userDoc === null || userDoc === void 0 ? void 0 : userDoc.addConfirmMonth(confirmMonth);
            })
                .then((userDoc) => {
                console.log('__Debugger__ctrls__statistic__postStatisticAction__userDoc (after addConfimMonth): ', userDoc);
                res.redirect(`/statistic/${userId}`);
            })
                .catch((err) => {
                console.log(err);
            });
            break;
        default:
            break;
    }
};
exports.postStatisticAction = postStatisticAction;
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