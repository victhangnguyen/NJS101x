import { RequestHandler } from 'express';

export const isAuth: RequestHandler = (req, res, next) => {
  if (!req.session.isLoggedIn) {
    return res.redirect('/login');
  }
  next();
};

export const isAdmin: RequestHandler = (req, res, next) => {
  if (req.session.isLoggedIn && req.user.role === 'ADMIN') {
    next();
  } else {
    return res.redirect('/');
  }
};

// export default isAuth;
