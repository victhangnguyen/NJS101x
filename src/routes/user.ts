import express from 'express';

//! imp controllers
import * as userController from '../controllers/user';
import * as attendanceController from '../controllers/attendance';
import * as covidStatusController from '../controllers/covidStatus';
import * as statisticController from '../controllers/statistic';
import * as absenceController from '../controllers/absence';

const router = express.Router();
//! DEFAULT
//@ / => GET: Home
router.get('/', userController.getHome);

//! ATTENDANCE
//@ /attendance => GET
router.get('/attendance', attendanceController.getAttendance);
//@ /attendance => POST
router.post('/attendance', attendanceController.postAttendance);

//@ /absence => GET (Register page)
router.get('/absence', absenceController.getAbsence);
//@ /admin => POST
router.post('/absence', absenceController.postAbsence);

//! PROFILE
//@ /profile => GET (Details)
router.get('/profile/:userId', userController.getProfile);
//@ /profile => POST
router.post('/profile/:userId', userController.postProfile);

//! STATISTIC
//@ /statistic => GET
router.get('/statistic', statisticController.getStatistic);

//! STATISTIC-SEARCH
//@ /statisticsearch => GET
router.get('/statisticsearch', statisticController.getStatisticSearch);
//@ /statisticsearch => POST
// router.post('/statisticsearch', statisticController.postStatisticSearch);

//! COVID-STATUS
//@ /covidstatus => GET (Register Page)
router.get('/covidstatus', covidStatusController.getCovidStatus);
//@ /covidstatus => GET (Details)
router.get('/covidstatus/:covidStatusId', covidStatusController.getCovidStatusDetails);
//@ /covidstatus => POST
router.post('/covidstatus', covidStatusController.postCovidStatus);
//@ /covidstatus => POSTs', covidStatusController.postCovidStatus);

export default router;
