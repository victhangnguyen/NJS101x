import { RequestHandler } from 'express';

export const isAuth: RequestHandler = (req, res, next) => {
  if (!req.session.isLoggedIn) {
    return res.redirect('/login');
  }
  next();
};




// export default isAuth;
