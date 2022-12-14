//! imp models
import User from '../models/user';
import Attendance, { AttendanceModel, IAttendance } from '../models/attendance';

//! imp utils
import utils from '../utils';

import { RequestHandler } from 'express';

//@ /attendance => GET
export const getAttendance: RequestHandler = (req, res, next) => {
  //! place that is checked authentication
  const currentMonth = new Date().getMonth() + 1;
  // console.log(
  //   '__Debugger__ctrls__attendance__getAttendance__currentMonth: ',
  //   currentMonth
  // );

  const isLocked = req.user.status.confirmMonth.some((cmonth: number) => {
    // console.log(
    //   '__Debugger__ctrls__attendance__getAttendance__cmonth: ',
    //   cmonth
    // );
    return cmonth === currentMonth;
  });

  // console.log(
  //   '__Debugger__ctrls__attendance__getAttendance__isLocked: ',
  //   isLocked
  // );

  res.render('attendance.ejs', {
    path: '/attendance',
    pageTitle: 'Điểm danh',
    user: req.user,
    isLocked: isLocked,
  });
};
//@ /attendance => POST
export const postAttendance: RequestHandler = (req, res, next) => {
  const workplace = (req.body as { workplace: string }).workplace;
  const type = (req.query as { type: string }).type;
  // console.log('__Debugger__type: ', type)
  //! __warning
  req.user
    .setStatus(type, workplace)
    .then((userDoc: any) => {
      return userDoc
        .addAttendance(type)
        .then((attendDoc: any) => {
          return attendDoc;
        })
        .catch((err: Error) => {
          console.log(err);
        });
    })
    .then((attendDoc: any) => {
      if (type === 'start') {
        res.render('home.ejs', {
          path: '/',
          pageTitle: 'Attendance | ' + req.user.name,
          user: req.user,
        });
      } else {
        //! After have timeOut, we calculate Record that Attendance
        // console.log(
        //   '__Debugger__ctrls__attendance__postAttendance__attendDoc: ',
        //   attendDoc
        // );
        attendDoc
          .calcRecord()
          .then((attendDoc: any) => {
            res.render('attendance-details.ejs', {
              path: '/attendance',
              pageTitle: 'Attendance | ' + req.user.name,
              attendDoc: attendDoc,
              user: req.user,
              helper: utils,
            });
          })
          .catch((err: Error) => {
            console.log(err);
          });
      }
    })
    .catch((err: Error) => {
      console.log(err);
    });
};
