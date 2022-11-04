import express from 'express';
//! imp middlewares
import { isAuth, isAdmin } from '../middlewares/is-auth';
import upload from '../middlewares/mutler';

//! imp ctrls
import * as userController from '../controllers/user';
import * as attendanceController from '../controllers/attendance';
import * as covidStatusController from '../controllers/covidStatus';
import * as statisticController from '../controllers/statistic';
import * as absenceController from '../controllers/absence';

const router = express.Router();
//! DEFAULT
//@ / => GET: Home
router.get('/', isAuth, userController.getHome);

//! ATTENDANCE
//@ /attendance => GET
router.get('/attendance', isAuth, attendanceController.getAttendance);
//@ /attendance => POST
router.post('/attendance', isAuth, attendanceController.postAttendance);

//@ /absence => GET (Register page)
router.get('/absence', isAuth, absenceController.getAbsence);
//@ /admin => POST
router.post('/absence', isAuth, absenceController.postAbsence);

//! PROFILE
//@ /profile => GET (Details)
router.get('/profile/:userId', isAuth, userController.getProfile);
//@ /profile => POST + add middleware Multer Upload
router.post(
  '/profile/:userId',
  upload.single('image'),
  isAuth,
  userController.postEditProfile
);

//! STATISTIC
//@ /statistic => GET
router.get('/statistic', isAdmin, statisticController.getStatistic);
router.get(
  '/statistic/:userId',
  isAuth,
  statisticController.getStatisticDetails
);
//@ //statisticDelete => POST
router.post(
  '/statistic/:userId',
  isAuth,
  statisticController.postStatisticAction
);

//! STATISTIC-ALL
//@ /statisticall => GET
router.get('/statisticall', isAdmin, statisticController.getStatisticAll); //! temp
router.get(
  '/statisticall/:userId',
  isAuth,
  statisticController.getStatisticAllDetails
); //! temp
//@ /statisticall => POST
router.post(
  '/statisticall/:userId',
  statisticController.postStatisticAllAction
);

//! COVID-STATUS
//@ /covidstatus => GET (Register Page)
router.get('/covidstatus', isAuth, covidStatusController.getCovidStatus);
//@ /covidstatus => GET (Details)
router.get(
  '/covidstatus/:covidStatusId',
  isAdmin,
  covidStatusController.getCovidStatusDetails
);
//@ /covidreport => GET
router.get(
  '/covidreport/:covidStatusId',
  covidStatusController.getCovidStatusPDF
);

//@ /covidstatus => POST
router.post('/covidstatus', isAuth, covidStatusController.postCovidStatus);
//@ /covidstatus => POSTs', covidStatusController.postCovidStatus);

export default router;
