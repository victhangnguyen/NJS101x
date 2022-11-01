import mongoose from 'mongoose';
import { RequestHandler } from 'express';
import utils from '../utils';
const util = require('node:util');

//! models
import User from '../models/user';
import Attendance from '../models/attendance';

//@ /statistic => GET
export const getStatistic: RequestHandler = (req, res, next) => {
  User.findById(req.user._id)
    .populate({
      path: 'manage.staffs',
    })
    .then((userDoc) => {
      res.status(200).render('statistic.ejs', {
        path: '/statistic',
        pageTitle: 'Tra cứu thông tin giờ làm - lương',
        user: userDoc, //! user Admin
        helper: utils,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

export const getStatisticAll: RequestHandler = (req, res, next) => {
  User.findById(req.user._id)
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
        user: userDoc, //! user Admin
        helper: utils,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

export const getStatisticDetails: RequestHandler = (req, res, next) => {
  const userId = req.params.userId;
  const search = req.query.search as string;

  console.log(
    '__Debugger__ctrls__statistic__getStatisticDetails__search: ',
    search
  );
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

  let message: any = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }

  User.findById(userId)
    .then((userDoc) => {
      userDoc
        ?.getStatistic(search)
        .then((collect: any) => {
          console.log(
            '__Debugger__ctrls__statistic__getStatisticDetails__collect.all(): ',
            collect.all()
          );

          // console.log(
          //   '__Debugger__ctrls__statistic__getStatisticDetails__dateAt: ',
          //   // +statistic.dateAt.toLocaleDateString('vi-VN', { month: '2-digit' })
          // );

          res.render('statisticDetails.ejs', {
            path: '/statistic',
            pageTitle: 'Tra cứu thông tin giờ làm - lương',
            user: req.user, //! user Admin
            statistics: collect.all(),
            helper: utils,
            staff: userDoc, //! user Staff
            errorMessage: message,
            oldInput: {
              search: search,
            },
          });
        })
        .catch((err: Error) => {
          console.log(err);
        });
    })
    .catch((err) => {
      console.log(err);
    });
};

export const getStatisticAllDetails: RequestHandler = (req, res, next) => {
  const userId = req.params.userId;
  const page = req.query.page ? +req.query.page : 1;
  const ITEMS_PER_PAGE = req.session.configLines ? req.session.configLines : 5;

  console.log(
    '__Debugger__ctrls__statistic__getStatisticAllDetails__page: ',
    page
  );
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

  let message: any = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }

  User.findById(userId)
    .then((userDoc) => {
      userDoc
        ?.getStatistic('all')
        .then((collect: any) => {
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
            user: req.user, //! user Admin
            statistics: filteredCollect,
            helper: utils,
            staff: userDoc, //! user Staff
            errorMessage: message,

            currentPage: page,
            hasNextPage: ITEMS_PER_PAGE * page < totalItems,
            hasPreviousPage: page > 1,
            nextPage: page + 1,
            previousPage: page - 1,
            lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
          });
        })
        .catch((err: Error) => {
          console.log(err);
        });
    })
    .catch((err) => {
      console.log(err);
    });
};

export const postStatisticAction: RequestHandler = (req, res, next) => {
  //! route: /statistic/:userId
  const userId = req.params.userId;
  const action = req.query.action;
  console.log(
    '__Debugger__ctrls__statistic__postStatisticAction__action: ',
    action
  );

  switch (action) {
    //! ACTION = delete
    case 'delete':
      const attendanceId = req.body.attendanceId;
      const recordTimeIn = req.body.recordTimeIn;

      User.findById(userId)
        .then((userDoc) => {
          const selectedMonth = new Date(recordTimeIn).getMonth() + 1;
          // console.log(
          //   '__Debugger__ctrls__statistic__postStatistic__selectedMonth: ',
          //   selectedMonth
          // );
          const existingConfirmMonth = userDoc?.status.confirmMonth.find(
            (cmonth) => {
              return cmonth === selectedMonth;
            }
          );
          // console.log(
          //   '__Debugger__ctrls__statistic__postStatistic__existingConfirmMonth: ',
          //   existingConfirmMonth
          // );

          if (!existingConfirmMonth) {
            userDoc
              ?.deleteTimeRecord(attendanceId, recordTimeIn)
              .then((attendanceDoc: any) => {
                // console.log(
                //   '__Debugger__ctrls__statistic__postStatistic__attendanceDoc: ',
                //   attendanceDoc
                // );
                res.redirect(`/statistic/${userId}`);
              })
              .catch((err: Error) => {
                console.log(err);
              });
          } else {
            req.flash(
              'error',
              `Admin đã khóa Tháng ${selectedMonth}. Bạn không thể thay đổi được!`
            );
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
      console.log(
        '__Debugger__ctrls__statistic__postStatisticAction: ',
        confirmMonth
      );

      User.findById(userId)
        .then((userDoc) => {
          return userDoc?.addConfirmMonth(confirmMonth);
        })
        .then((userDoc) => {
          // console.log(
          //   '__Debugger__ctrls__statistic__postStatisticAction__userDoc (after addConfimMonth): ',
          //   userDoc
          // );
          const currentMonth = new Date().getMonth() + 1;

          // ! Nếu đang điểm danh nhưng bị khóa => Hoàn tất điểm danh + LOCK
          if (
            currentMonth === confirmMonth &&
            userDoc?.status.isWorking === true
          ) {
            userDoc
              .setStatus('end', 'Chưa xác định')
              .then((userDoc: any) => {
                return userDoc.addAttendance('end');
              })
              .then((attendanceDoc: any) => {
                return attendanceDoc.calcRecord();
                // return res.render('attendance.ejs', {
                //   path: '/attendance',
                //   pageTitle: 'Điểm danh',
                //   user: req.user,
                //   isLocked: isLocked,
                // });
              })
              .catch((err: Error) => {
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

export const postStatisticAllAction: RequestHandler = (req, res, next) => {
  //! route: /statistic/:userId
  const userId = req.params.userId;
  const action = req.query.action;
  console.log(
    '__Debugger__ctrls__statistic__postStatisticAllAction__action: ',
    action
  );

  switch (action) {
    //! ACTION = delete
    case 'config':
      const configLines = +req.body.configLines;
      console.log(
        '__Debugger__ctrls__statistic__postStatisticAllAction__configLines: ',
        configLines
      );
      req.session.configLines = configLines;
      req.session.save((err) => {
        res.redirect(`/statisticall/${userId}`);
      });

      break;

    default:
      break;
  }
};

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
