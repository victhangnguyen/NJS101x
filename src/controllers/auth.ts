//! imp library
import Logging from '../library/Logging';

import { RequestHandler } from 'express';

//! imp models
import User from '../models/user';

import bcrypt from 'bcryptjs';
import { validationResult } from 'express-validator';

export const getLogin: RequestHandler = (req, res, next) => {
  let message: any = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }

  return res.status(200).render('auth/login.ejs', {
    path: '/login',
    pageTitle: 'Login',
    user: req.user,
    errorMessage: message,
    oldInput: {
      email: '',
      password: '',
    },
    validationErrors: [],
  });
};

export const postLogin: RequestHandler = (req, res, next) => {
  const { username, password } = req.body;
  console.log(
    '__Debugger__ctrls__auth__username:',
    username,
    ' - password: ',
    password
  );

  const errors = validationResult(req);
  console.log('__Debugger__ctrls__auth__errors:', errors);

  if (!errors.isEmpty()) {
    //! render Form with Error Message
    return res.status(422).render('auth/login', {
      path: '/login',
      pageTitle: 'Login',
      errorMessage: errors.array()[0].msg,
      oldInput: {
        username: username,
        password: password,
      },
      validationErrors: errors.array(),
    });
  }

  User.findOne({ username: username })
    .then((userDoc) => {
      console.log('__Debugger__ctrls__auth__postLogin__userDoc: ', userDoc);
      if (!userDoc) {
        //! user no-existing
        return res.status(422).render('auth/login', {
          path: '/login',
          pageTitle: 'Login',
          // errorMessage: 'Invalid email or password.',
          oldInput: {
            username: username,
            password: password,
          },
          validationErrors: [
            {
              msg: 'Username không tồn tại!',
              param: 'username',
            },
          ],
        });
      }

      bcrypt
        .compare(password, userDoc!.password)
        .then((doMatch) => {
          if (doMatch) {
            //! important
            req.session.isLoggedIn = true;
            req.session.user = userDoc;
            return req.session.save((err) => {
              // console.log(err);
              Logging.success('LOGIN SUCCESS');
              //! Go Home
              res.redirect('/');
            });
          }
          //! Case: password no match
          // req.flash('error', 'Invalid email or password.');
          return res.render('auth/login', {
            path: '/login',
            pageTitle: 'Login',
            oldInput: {
              username: username,
              password: password,
            },
            validationErrors: [
              {
                msg: 'Mật khẩu không chính xác!',
                param: 'password',
              },
            ],
          });
        })
        .catch((err) => {
          console.log(err);
          res.redirect('/login');
        });
    })
    .catch((err) => {
      console.log(err);
    });
};

export const postLogout: RequestHandler = (req, res, next) => {
  req.session.destroy((err) => {
    Logging.error('LOGOUT SUCCESS');
    // console.log(err);
    res.redirect('/');
  });
};
