import { RequestHandler } from 'express';
import mongoose from 'mongoose';

//! imp library
import Logging from '../library/Logging';

//! imp models
import CovidStatus, { ICovidStatus } from '../models/covidStatus';

export const getCovidStatus: RequestHandler = (req, res, next) => {
  CovidStatus.initByUserId(req.user._id)
    .then((covidStatusDoc) => {
      res.render('covid-status.ejs', { pageTitle: 'Thông tin Covid cá nhân', user: req.user });
    })
    .catch((err) => {
      console.log(err);
    });
};

//! after CovidStatus initialized.
export const postCovidStatus: RequestHandler = (req, res, next) => {
  const type = req.query.type;
  // console.log('__Debugger__postCovidStatus__type: ', type)

  //! branching the type
  switch (type) {
    //! BODY-TEMP
    case 'bodytemp':
      // console.log('__Debugger__ctrls/postCovidStatus__bodyTemp');

      break;
    //! VACCINATION
    case 'vaccination':
      // console.log('__Debugger__ctrls/postCovidStatus__vaccination');
      break;
    //! POSITIVE
    case 'positive':
      // console.log('__Debugger__ctrls/postCovidStatus__positive');

      break;

    default:
      break;
  }
};
