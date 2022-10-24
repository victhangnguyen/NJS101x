import mongoose from 'mongoose';
import { RequestHandler } from 'express';

//! imp library
import Logging from '../library/Logging';

//! imp models
import User, { IUser } from '../models/user';

const CURRENT_USER_ID = '6343eda88c983e6e05fb4e55';
//@ default -> GET
export const getHome: RequestHandler = (req, res, next) => {
  const currentUser = req.user;
  res.render('home', {
    path: '/',
    pageTitle: 'Ứng dụng quản lý | ' + currentUser.name,
    user: currentUser,
  });
};

//@ /profile:userId => GET
export const getProfile: RequestHandler = (req, res, next) => {
  const userId = req.params.userId;

  User.findById(userId)
    .then((userDoc) => {
      // console.log('__Debugger__ctrls__user__getProfile__userDoc: ', userDoc);
      res.render('profile.ejs', {
        path: '/profile',
        pageTitle: 'Thông tin cá nhân | ' + userDoc!.name,
        user: userDoc,
      });
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
      res.redirect(`/profile/${userDoc._id}`);
    })
    .catch((err: Error) => {
      console.log(err);
    });
};
