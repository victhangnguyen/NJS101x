"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.postStatisticAllAction = exports.postStatisticAction = exports.getStatisticAllDetails = exports.getStatisticDetails = exports.getStatisticAll = exports.getStatistic = void 0;
const utils_1 = __importDefault(require("../utils"));
const util = require('node:util');
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
const getStatisticAll = (req, res, next) => {
    user_1.default.findById(req.user._id)
        .populate({
        path: 'manage.staffs',
        populate: {
            path: 'manage.userId',
        },
    })
        .then((userDoc) => {
        console.log(util.inspect(userDoc, { depth: 12 }));
        res.status(200).render('statistic-all.ejs', {
            path: '/statisticall',
            pageTitle: 'Tra cứu thông tin giờ làm - lương',
            user: userDoc,
            helper: utils_1.default,
        });
    })
        .catch((err) => {
        console.log(err);
    });
};
exports.getStatisticAll = getStatisticAll;
const getStatisticDetails = (req, res, next) => {
    const userId = req.params.userId;
    const search = req.query.search;
    console.log('__Debugger__ctrls__statistic__getStatisticDetails__search: ', search);
    // console.log(
    //   '__Debugger__ctrls__statistic__getStatisticDetails__userId: ',
    //   userId
    // );
    // console.log(
    //   '__Debugger__ctrls__statistic__getStatisticDetails__req.user._id.toString(): ',
    //   req.user._id.toString()
    // );
    //! Unauthorized
    if (req.user._id.toString() !== userId && req.user.role !== 'ADMIN') {
        return res.redirect('/');
    }
    let message = req.flash('error');
    if (message.length > 0) {
        message = message[0];
    }
    else {
        message = null;
    }
    user_1.default.findById(userId)
        .then((userDoc) => {
        userDoc === null || userDoc === void 0 ? void 0 : userDoc.getStatistic(search).then((collect) => {
            // console.log(
            //   '__Debugger__ctrls__statistic__getStatisticDetails__collect.all(): ',
            //   collect.all()
            // );
            // console.log(
            //   '__Debugger__ctrls__statistic__getStatisticDetails__dateAt: ',
            //   // +statistic.dateAt.toLocaleDateString('vi-VN', { month: '2-digit' })
            // );
            res.render('statisticDetails.ejs', {
                path: '/statistic',
                pageTitle: 'Tra cứu thông tin giờ làm - lương',
                user: req.user,
                statistics: collect.all(),
                helper: utils_1.default,
                staff: userDoc,
                errorMessage: message,
                oldInput: {
                    search: search,
                },
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
const getStatisticAllDetails = (req, res, next) => {
    const userId = req.params.userId;
    const page = req.query.page ? +req.query.page : 1;
    const ITEMS_PER_PAGE = req.session.configLines ? req.session.configLines : 5;
    console.log('__Debugger__ctrls__statistic__getStatisticAllDetails__page: ', page);
    // console.log(
    //   '__Debugger__ctrls__statistic__getStatisticDetails__userId: ',
    //   userId
    // );
    // console.log(
    //   '__Debugger__ctrls__statistic__getStatisticDetails__req.user._id.toString(): ',
    //   req.user._id.toString()
    // );
    //! Unauthorized
    if (req.user._id.toString() !== userId && req.user.role !== 'ADMIN') {
        return res.redirect('/');
    }
    let message = req.flash('error');
    if (message.length > 0) {
        message = message[0];
    }
    else {
        message = null;
    }
    user_1.default.findById(userId)
        .then((userDoc) => {
        userDoc === null || userDoc === void 0 ? void 0 : userDoc.getStatistic('all').then((collect) => {
            const totalItems = collect.count();
            //! Tương đồng:
            //! skip ~ skip
            //! limit ~ take
            const filteredCollect = collect
                .skip((page - 1) * ITEMS_PER_PAGE)
                .take(ITEMS_PER_PAGE)
                .all();
            // console.log(
            //   '__Debugger__ctrls__statistic__getStatisticDetails__totalItems: ',
            //   totalItems
            // );
            // console.log(
            //   '__Debugger__ctrls__statistic__getStatisticDetails__filteredCollect: ',
            //   filteredCollect
            // );
            // console.log(
            //   '__Debugger__ctrls__statistic__getStatisticDetails__collect.all(): ',
            //   collect.all()
            // );
            // console.log(
            //   '__Debugger__ctrls__statistic__getStatisticDetails__dateAt: ',
            //   // +statistic.dateAt.toLocaleDateString('vi-VN', { month: '2-digit' })
            // );
            res.render('statistic-all-details.ejs', {
                path: '/statisticall',
                pageTitle: 'Tra cứu thông tin giờ làm - lương',
                user: req.user,
                statistics: filteredCollect,
                helper: utils_1.default,
                staff: userDoc,
                errorMessage: message,
                currentPage: page,
                hasNextPage: ITEMS_PER_PAGE * page < totalItems,
                hasPreviousPage: page > 1,
                nextPage: page + 1,
                previousPage: page - 1,
                lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
            });
        }).catch((err) => {
            console.log(err);
        });
    })
        .catch((err) => {
        console.log(err);
    });
};
exports.getStatisticAllDetails = getStatisticAllDetails;
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
                // console.log(
                //   '__Debugger__ctrls__statistic__postStatistic__selectedMonth: ',
                //   selectedMonth
                // );
                const existingConfirmMonth = userDoc === null || userDoc === void 0 ? void 0 : userDoc.status.confirmMonth.find((cmonth) => {
                    return cmonth === selectedMonth;
                });
                // console.log(
                //   '__Debugger__ctrls__statistic__postStatistic__existingConfirmMonth: ',
                //   existingConfirmMonth
                // );
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
                // console.log(
                //   '__Debugger__ctrls__statistic__postStatisticAction__userDoc (after addConfimMonth): ',
                //   userDoc
                // );
                const currentMonth = new Date().getMonth() + 1;
                // ! Nếu đang điểm danh nhưng bị khóa => Hoàn tất điểm danh + LOCK
                if (currentMonth === confirmMonth &&
                    (userDoc === null || userDoc === void 0 ? void 0 : userDoc.status.isWorking) === true) {
                    userDoc
                        .setStatus('end', 'Chưa xác định')
                        .then((userDoc) => {
                        return userDoc.addAttendance('end');
                    })
                        .then((attendanceDoc) => {
                        return attendanceDoc.calcRecord();
                        // return res.render('attendance.ejs', {
                        //   path: '/attendance',
                        //   pageTitle: 'Điểm danh',
                        //   user: req.user,
                        //   isLocked: isLocked,
                        // });
                    })
                        .catch((err) => {
                        console.log(err);
                    });
                }
                res.redirect(`/statistic/${userId}?search=${confirmMonth}`);
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
const postStatisticAllAction = (req, res, next) => {
    //! route: /statistic/:userId
    const userId = req.params.userId;
    const action = req.query.action;
    console.log('__Debugger__ctrls__statistic__postStatisticAllAction__action: ', action);
    switch (action) {
        //! ACTION = delete
        case 'config':
            const configLines = +req.body.configLines;
            console.log('__Debugger__ctrls__statistic__postStatisticAllAction__configLines: ', configLines);
            req.session.configLines = configLines;
            req.session.save((err) => {
                res.redirect(`/statisticall/${userId}`);
            });
            break;
        default:
            break;
    }
};
exports.postStatisticAllAction = postStatisticAllAction;
// //@ /StatisticAll => GET
// export const getStatisticAllDetails: RequestHandler = (req, res, next) => {
//   const userId = req.params.userId;
//   console.log(
//     '__Debugger__ctrls__statistic__getStatisticDetails__search: ',
//     search
//   );
//   //! Unauthorized
//   if (req.user._id.toString() !== userId && req.user.role !== 'ADMIN') {
//     return res.redirect('/');
//   }
//   let message: any = req.flash('error');
//   if (message.length > 0) {
//     message = message[0];
//   } else {
//     message = null;
//   }
//   User.findById(userId)
//     .then((userDoc) => {
//       userDoc
//         ?.getStatistic('all')
//         .then((collect: any) => {
//           res.render('statisticDetails.ejs', {
//             path: '/statistic',
//             pageTitle: 'Tra cứu thông tin giờ làm - lương',
//             user: req.user, //! user Admin
//             statistics: collect.all(),
//             helper: utils,
//             staff: userDoc, //! user Staff
//             errorMessage: message,
//           });
//         })
//         .catch((err: Error) => {
//           console.log(err);
//         });
//     })
//     .catch((err) => {
//       console.log(err);
//     });
// };
//# sourceMappingURL=statistic.js.map