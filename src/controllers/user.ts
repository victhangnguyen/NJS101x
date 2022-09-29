import mongoose from 'mongoose';
import { RequestHandler } from 'express';

//! imp library
import Logging from '../library/Logging';

//! imp models
import User, { IUser } from '../models/user';

const CURRENT_USER_ID = '633360dd2da654687783f6c2';
//@ default -> GET
export const getHome: RequestHandler = (req, res, next) => {
  const currentUser = req.user;
  res.render('home', {
    pageTitle: 'Ứng dụng quản lý | ' + currentUser.name,
    user: currentUser,
  });
};

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

//@ /profile:userId => GET
export const getProfile: RequestHandler = (req, res, next) => {
  const userId = req.params.userId;

  User.findById(userId)
    .then((userDoc) => {
      console.log('__Debugger__userDoc: ', userDoc);
      res.render('profile.ejs', { pageTitle: 'Thông tin cá nhân | ' + userDoc!.name, user: userDoc });
    })
    .catch((err) => {
      console.log(err);
    });
};

//@ /profile:userId => POST
export const postProfile: RequestHandler = (req, res, next) => {
  const image = req.body.image;
  // console.log('__Debugger__user.ts__image: ', image)
  req.user.image = image;
  req.user
    .save()
    .then((userDoc: IUser) => {
      res.redirect(`/profile/${userDoc._id}`)
    })
    .catch((err: Error) => {
      console.log(err);
    });
};
