import { RequestHandler } from 'express';
import mongoose from 'mongoose';
//! imp utils
import utils from '../utils';

//! imp library
import Logging from '../library/Logging';

//! imp models
import CovidStatus, { ICovidStatus } from '../models/covidStatus';

export const getCovidStatus: RequestHandler = (req, res, next) => {
  CovidStatus.findOne({ userId: req.user._id })
    .then((covidStatusDoc) => {
      //! create New Covid Status Doc
      if (!covidStatusDoc) {
        return CovidStatus.create({
          userId: req.user._id,
          bodyTemperatures: [],
          vaccines: [],
          positive: [],
        })
          .then((covidStatusDoc) => {
            Logging.success('Create New CovidStatus by userId: ' + req.user._id)
            return covidStatusDoc;
          })
          .catch((err) => {
            console.log(err);
          });
      }

      return covidStatusDoc;
    })
    .then((covidStatusDoc) => {
      // console.log('__Debugger__getCovidStatus__covidStatusDoc: ', covidStatusDoc);
      res.render('covid-status.ejs', {
        path: '/covidstatus',
        pageTitle: 'Thông tin Covid cá nhân',
        user: req.user,
        covidStatus: covidStatusDoc,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

//! after CovidStatus created.
export const postCovidStatus: RequestHandler = (req, res, next) => {
  const type: string = (req.query as { type: string }).type;
  const temp: number | undefined = (req.body as { bodyTemperature: string }).bodyTemperature
    ? Number(req.body.bodyTemperature)
    : undefined;
  const name: string | undefined = (req.body as { name: string }).name;
  const date: Date | undefined = (req.body as { date: string }).date
    ? new Date(utils.convertDateVNtoUS(req.body.date))
    : undefined;

  console.log('req.body.date: ', req.body.date);
  console.log('__Debugger__postCovidStatus1__postCovidStatus__type: ', type, 'temp: ', temp, 'date: ', date);
  req.user
    .addCovidStatus(type, temp, name, date)
    .then((covidStatusDoc: ICovidStatus) => {
      console.log('__Debugger__postCovidStatus2__covidStatusDoc: ', covidStatusDoc.positive);
      res.redirect(`/covidstatus/${covidStatusDoc._id}`);
    })
    .catch((err: Error) => {
      console.log(err);
    });
};

export const getCovidStatusDetails: RequestHandler = (req, res, next) => {
  const userId = req.params.userId;
  CovidStatus.findOne({ _userId: userId })
    .then((covidStatusDoc) => {
      // console.log('__Debugger__getCovidStatusDetails__covidStatusDoc: ', covidStatusDoc);
      res.render('covid-status-details.ejs', {
        path: '/covidstatus',
        pageTitle: 'Chi tiết Thông tin Covid cá nhân',
        user: req.user,
        covidStatus: covidStatusDoc,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};
