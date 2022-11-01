import { RequestHandler } from 'express';
import { ErrnoException } from '../server';
//! utils
import { deleteFile } from '../utils/file';

//! imp library
import Logging from '../library/Logging';

//! imp models
import User, { IUser } from '../models/user';

//@ default -> GET
export const getHome: RequestHandler = (req, res, next) => {
  const currentUser = req.user;
  res.render('home', {
    path: '/',
    pageTitle: 'Ứng dụng quản lý',
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
        errorMessage: null,
      });
    })
    .catch((err) => {
      const error: ErrnoException = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

//@ /profile:userId => POST
export const postEditProfile: RequestHandler = (req, res, next) => {
  const image = req.file;
  console.log('__Debugger__ctrls__user__image: ', image);

  const userId = req.params.userId;

  User.findById(userId)
    .then((userDoc) => {
      if (!image) {
        return res.status(500).render('profile.ejs', {
          pageTitle: 'Thông tin cá nhân',
          path: '/profile',
          errorMessage: 'Đính kèm thêm ảnh .',
          user: req.user,
        });
      } else {
        deleteFile(userDoc!.image);
        userDoc!.image = 'images/' + image.filename;

        userDoc!
          .save()
          .then((userDoc: IUser) => {
            res.redirect(`/profile/${userDoc._id}`);
          })
          .catch((err: any) => {
            const error: ErrnoException = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
          });
      }
    })
    .catch((err) => {
      const error: ErrnoException = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};
