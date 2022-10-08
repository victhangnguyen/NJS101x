import { RequestHandler } from 'express';
import mongoose from 'mongoose';

//! imp utils
import utils from '../utils';

//! imp models
import Absence, { IAbsence } from '../models/absence';

//@ /absence => GET (Register page)
export const getAbsence: RequestHandler = (req, res, next) => {
  // console.log('__Debugger__absence/getAbsence');
  Absence.find({ userId: req.user._id })
    .then((absencDocs) => {
      //! datesDisabled is helped to user dont allow to choose the dates already
      const datesDisabled = absencDocs.map((abs) =>
        abs.date.toLocaleDateString('vi-VN', {
          year: 'numeric',
          month: 'numeric',
          day: 'numeric',
        })
      );
      // console.log('__Debugger__ctrls_absence__getAbsence__datesDisabled: ', datesDisabled);
      const hoursDisabled = absencDocs
        .filter((abs) => !(abs.hours < 8))
        .map((abs) =>
          abs.date.toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
          })
        );
      // console.log('__Debugger__ctrls_absence__getAbsence__hoursDisabled: ', hoursDisabled);

      const multidate = req.user.annualLeave;

      res.render('absence.ejs', {
        path: '/attendance',
        pageTitle: `Đăng ký nghỉ phép | ${req.user.name}`,
        user: req.user,
        datesDisabled,
        hoursDisabled,
        multidate,
        errorMessage: null,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

//@ /absence => POST
export const postAbsence: RequestHandler = (req, res, next) => {
  const type = req.query.type;
  let hours = type === 'dates' ? 8 : Number(req.body.hours);
  const dates = utils.toDateArray(req.body.dates, ' - ');
  const reason = (req.body as { reason: string }).reason;

  //! Add one or many Absence
  req.user
    .addAbsences(type, dates, hours, reason)
    .then((absenceDoc: IAbsence) => {
      console.log(
        '__Debugger__ctrlsAbsences__postAbsence__absenceDo: ',
        absenceDoc
      );
      res.redirect('/absence');
    })
    //! catch Error to show errorMessage
    .catch((err: Error) => {
      Absence.find({ userId: req.user._id })
        .then((absencDocs) => {
          //! datesDisabled is helped to user dont allow to choose the dates already
          const datesDisabled = absencDocs.map((abs) =>
            abs.date.toLocaleDateString('vi-VN', {
              year: 'numeric',
              month: 'numeric',
              day: 'numeric',
            })
          );
          const hoursDisabled = absencDocs
            .filter((abs) => !(abs.hours < 8))
            .map((abs) =>
              abs.date.toLocaleDateString('vi-VN', {
                year: 'numeric',
                month: 'numeric',
                day: 'numeric',
              })
            );
          // console.log('__Debugger__ctrls_absence__getAbsence__hoursDisabled: ', hoursDisabled);

          const multidate = req.user.annualLeave;
          const errorMessage = err.message;

          res.render('absence.ejs', {
            path: '/attendance',
            pageTitle: `Đăng ký nghỉ phép | ${req.user.name}`,
            user: req.user,
            datesDisabled,
            hoursDisabled,
            multidate,
            errorMessage,
          });
        })
        .catch((err) => {
          console.log(err);
        });
    });
};
