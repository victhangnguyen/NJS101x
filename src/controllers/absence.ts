import { RequestHandler } from 'express';
import mongoose from 'mongoose';

//! imp utils
import utils from '../utils';

//! imp models
import Absence, { IAbsence } from '../models/absence';

//@ /absence => GET (Register page)
export const getAbsence: RequestHandler = (req, res, next) => {
  console.log('__Debugger__absence/getAbsence');
  Absence.find({ userId: req.user._id })
    .then((absencDocs) => {
      //! datesDisabled is helped to user dont allow to choose the dates already
      const datesDisabled = absencDocs.map((abs) =>
        abs.date.toLocaleDateString('vi-VN', { year: 'numeric', month: 'numeric', day: 'numeric' })
      );
      // console.log('__Debugger__ctrls_absence__getAbsence__datesDisabled: ', datesDisabled);
      const hoursDisabled = absencDocs
        .filter((abs) => !(abs.hours < 8))
        .map((abs) => abs.date.toLocaleDateString('vi-VN', { year: 'numeric', month: 'numeric', day: 'numeric' }));
      // console.log('__Debugger__ctrls_absence__getAbsence__hoursDisabled: ', hoursDisabled);

      res.render('absence.ejs', {
        pageTitle: `Đăng ký nghỉ phép | ${req.user.name}`,
        user: req.user,
        datesDisabled,
        hoursDisabled,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

//@ /absence => POST
export const postAbsence: RequestHandler = (req, res, next) => {
  const type = req.query.type;
  const { date, hours, reason } = req.body;
  const dates = utils.toDateArray(req.body.dates, ' - ');

  console.log('req.query.type: ', type);
  console.log('req.body.date: ', date, ' - hours: ', hours, ' - dates: ', dates, ' - reason: ', reason);

  //! Add one or many Absence
  req.user
    .addAbsences(type, date, dates, hours, reason)
    .then((absenceDoc: IAbsence) => {
      console.log('__Debugger__ctrlsAbsence__postAbsence__absenceDoc: ', absenceDoc);

      res.redirect('/absence');
    })
    .catch((err: Error) => {
      console.log(err);
    });
};
