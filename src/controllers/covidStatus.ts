import { RequestHandler } from 'express';

export const getCovidStatus: RequestHandler = (req, res, next) => {
  res.render('covid-status.ejs', { pageTitle: 'Thông tin Covid cá nhân', user: req.user });
};

export const postCovidStatus: RequestHandler = (req, res, next) => {
  
  const type = req.query.type;
  // console.log('__Debugger__postCovidStatus__type: ', type)
  //! branching the type
  switch (type) {
    case 'bodytemp':
      // console.log('__Debugger__ctrls/postCovidStatus__bodyTemp');
      break;
    case 'vaccination':
      // console.log('__Debugger__ctrls/postCovidStatus__vaccination');
      break;
    case 'positive':
      // console.log('__Debugger__ctrls/postCovidStatus__positive');

      break;

    default:
      break;
  }
};
