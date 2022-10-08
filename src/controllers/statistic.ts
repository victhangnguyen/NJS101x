import mongoose from 'mongoose';
import { RequestHandler } from 'express';
import utils from '../utils';
//! imp
//@ /statistic => GET
export const getStatistic: RequestHandler = (req, res, next) => {
  req.user
    .getStatistic()
    .then((statistics: any) => {
      console.log(
        '__Debugger__ctrls_statistics__getStatistic__statistics: ',
        statistics
      );

      res.render('statistic.ejs', {
        path: '/statistic',
        pageTitle: 'Tra cứu thông tin giờ làm - lương',
        user: req.user,
        statistics,
        helper: utils
      });
    })
    .catch((err: Error) => {
      console.log(err);
    });
};
//@ /statistic => POST
export const postStatistic: RequestHandler = (req, res, next) => {};
