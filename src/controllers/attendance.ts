//! imp models
import User from '../models/user';
import Attendance, { AttendanceModel, IAttendance } from '../models/attendance';

import { RequestHandler } from 'express';

//@ /attendance => GET
export const getAttendance: RequestHandler = (req, res, next) => {
  //! place that is checked authentication
  const currentUser = req.user;
  res.render('attendance.ejs', { pageTitle: 'Điểm danh', user: currentUser });
};
//@ /attendance => POST
export const postAttendance: RequestHandler = (req, res, next) => {
  const workplace = (req.body as { workplace: string }).workplace;
  const type = (req.query as { type: string }).type;
  const currentLocaleDateString = new Date().toLocaleDateString();

  // console.log('__Debugger__type: ', type)
  //! __warning
  req.user
    .setStatus(type, workplace)
    .then((userDoc: any) => {
      return userDoc
        .addAttendance(type, currentLocaleDateString)
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
          pageTitle: 'Attendance | ' + req.user.name,
          user: req.user,
        });
      } else {
        //! After have timeOut, we calculate Record that Attendance
        console.log('__Debugger__attendance.ts__attendDoc: ', attendDoc);
        attendDoc
          .calcRecord()
          .then((attendDoc: any) => {
            res.render('attendance-details.ejs', {
              pageTitle: 'Attendance | ' + req.user.name,
              attendDoc: attendDoc,
              user: req.user,
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
