import mongoose from 'mongoose';
import { RequestHandler } from 'express';
//! imp
//@ /statistic => GET
export const getStatistic: RequestHandler = (req, res, next) => {

  res.render('statistic.ejs', { pageTitle: 'Tra cứu thông tin giờ làm - lương', user: req.user });
};
//@ /statistic => POST
export const postStatistic: RequestHandler = (req, res, next) => {};
