import mongoose from 'mongoose';
import { RequestHandler } from 'express';
import utils from '../utils';

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

export const getStatisticDetails: RequestHandler = (req, res, next) => {
  const userId = req.params.userId;
  // console.log('__Debugger__ctrls__statstic__req.user: ', userId);

  let message: any = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }

  User.findById(userId)
    .then((userDoc) => {
      userDoc
        ?.getStatistic('latestMonth')
        .then((statistics: any) => {
          console.log(
            '__Debugger__ctrls__statistic__getStatisticDetails__statistic: ',
            statistics
          );

          res.render('statisticDetails.ejs', {
            path: '/statistic',
            pageTitle: 'Tra cứu thông tin giờ làm - lương',
            user: req.user, //! user Admin
            statistics,
            helper: utils,
            staff: userDoc, //! user Staff
            errorMessage: message,
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
          console.log(
            '__Debugger__ctrls__statistic__postStatistic__selectedMonth: ',
            selectedMonth
          );
          const existingConfirmMonth = userDoc?.status.confirmMonth.find(
            (cmonth) => {
              return cmonth === selectedMonth;
            }
          );
          console.log(
            '__Debugger__ctrls__statistic__postStatistic__existingConfirmMonth: ',
            existingConfirmMonth
          );

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
          console.log(
            '__Debugger__ctrls__statistic__postStatisticAction__userDoc (after addConfimMonth): ',
            userDoc
          );

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

//@ /statisticsearch => GET
export const getStatisticSearch: RequestHandler = (req, res, next) => {
  //! initial keyword: All
  const search = req.query.search
    ? (req.query as { search: string }).search
    : '*';
  console.log(
    '__Debugger__ctrls__statistic__getStatisticSearch__search: ',
    search
  );

  const lines = +req.query.lines!;
  console.log(
    '__Debugger__ctrls__statistic__getStatisticSearch__lines: ',
    lines
  );

  req.user
    .getStatistic()
    .then((statistics: any) => {
      const filteredStatistics: Array<any> = statistics
        .filter((statistic: any) =>
          utils.matchRuleShort(statistic.date, search)
        )
        .filter((statistic: any) => {});

      // console.log('__Debugger__ctrls__statistic__getStatisticSearch__filteredStatistics: ', filteredStatistics)

      //! guard clause
      if (filteredStatistics.length > 0) {
        let salaryTimeTotal: number = 0;

        filteredStatistics.forEach((statistic) => {
          if (statistic.type === 'attendance') {
            //! only handling 'attendance'

            statistic.salaryTime = statistic.totalTime / 3600 - 8;
            const existingAbsence = statistics.find(
              (sta: any) =>
                sta.type === 'absence' && sta.date === statistic.date
            );

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

        const salary = Math.floor(
          req.user.salaryScale * 3000000 + salaryTimeTotal * 200000
        );
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
          helper: utils,
        });
      } else {
        res.render('statistic-search.ejs', {
          path: '/statisticsearch',
          pageTitle: 'Tra cứu thông tin giờ làm - lương',
          user: req.user,
          statistics: [],
          salary: 0,
          salaryTimeTotal: 0,
          helper: utils,
        });
      }
    })
    .catch((err: Error) => {
      console.log(err);
    });
};
