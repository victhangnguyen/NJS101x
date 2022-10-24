import express from 'express';
//! imp mdw
import { isAuth } from '../middlewares/is-auth';

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
//@ /profile => POST
router.post('/profile/:userId', isAuth, userController.postProfile);

//! STATISTIC
//@ /statistic => GET
router.get('/statistic', isAuth, statisticController.getStatistic);

//! STATISTIC-SEARCH
//@ /statisticsearch => GET
router.get('/statisticsearch', isAuth, statisticController.getStatisticSearch);
//@ /statisticsearch => POST
// router.post('/statisticsearch', statisticController.postStatisticSearch);

//! COVID-STATUS
//@ /covidstatus => GET (Register Page)
router.get('/covidstatus', isAuth, covidStatusController.getCovidStatus);
//@ /covidstatus => GET (Details)
router.get(
  '/covidstatus/:covidStatusId',
  isAuth,
  covidStatusController.getCovidStatusDetails
);
//@ /covidstatus => POST
router.post('/covidstatus', isAuth, covidStatusController.postCovidStatus);
//@ /covidstatus => POSTs', covidStatusController.postCovidStatus);

export default router;
