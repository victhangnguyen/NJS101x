import { RequestHandler } from 'express';

//@ /absence => GET (Register page)
export const getAbsence: RequestHandler = (req, res, next) => {
  console.log('__Debugger__absence/getAbsence');
  var datesDisabled = ["10/22/2022", "21/10/2022", "22/10/2022", "23/10/2022"];
  res.render('absence.ejs', { pageTitle: `Đăng ký nghỉ phép | ${req.user.name}`, user: req.user, datesDisabled});
};

//@ /absence => GET
export const postAbsence: RequestHandler = (req, res, next) => {};
// class="disabled disabled-date day"