import mongoose from 'mongoose';
import { RequestHandler } from 'express';

//! imp library
import Logging from '../library/Logging';

//! imp models
import User from '../models/user';

const CURRENT_USER_ID = '633360dd2da654687783f6c2';

//@ default
export const checkAuth: RequestHandler = (req, res, next) => {
  User.findById(CURRENT_USER_ID)
    .then((userDoc) => {
      // console.log('__Debugger__userDoc: ', userDoc);
      //! Login successfull!
      if (userDoc) {
        Logging.success('ĐĂNG NHẬP THÀNH CÔNG');
        req.user = userDoc;
        next();
      }
      //! Login failed!
      else {
        Logging.error('ĐĂNG NHẬP KHÔNG THÀNH CÔNG');
      }
    })
    .catch((err) => {
      console.log(err);
    });
};

//@ default -> GET
export const getHome: RequestHandler = (req, res, next) => {
  const currentUser = req.user;
  res.render('home', {
    pageTitle: 'Ứng dụng quản lý | ' + currentUser.name,
    user: currentUser,
  });
};
