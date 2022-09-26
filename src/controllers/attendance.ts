//! imp models
import User, { IUser } from '../models/user';

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
  // console.log('__Debugger__type: ', type)

  if (type === 'start') {
    const currentStatus = {
      isWorking: true,
      workplace: workplace,
    };
    req.user.status = currentStatus;

    req.user
      .save()
      .then((userDoc: IUser) => {
        console.log('__Debugger__postAttendance__userDoc: ', userDoc);
        res.render('home', { pageTitle: 'hello', user: userDoc }); //! getHome()
      })
      .catch((err: Error) => {
        console.log(err);
      });
  } else {
    //! type === 'end'
  }

  req.user;
};
