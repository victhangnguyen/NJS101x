import express from 'express';

//! imp controllers
import * as userController from '../controllers/user';
import * as attendanceController from '../controllers/attendance';
import * as covidStatusController from '../controllers/covidStatus';

const router = express.Router();
//! DEFAULT
//@ / => GET: Home
router.get('/', userController.getHome);

//! ATTENDANCE
//@ /attendance => GET
router.get('/attendance', attendanceController.getAttendance);
//@ /attendance => POST
router.post('/attendance', attendanceController.postAttendance);

//! PROFILE
//@ /profile => GET
router.get('/profile/:userId', userController.getProfile);
//@ /profile => POST
router.post('/profile/:userId', userController.postProfile);

//! COVID-STATUS
//@ /covidstatus => GET
router.get('/covidstatus', covidStatusController.getCovidStatus);
//@ /covidstatus => GET
router.get('/covidstatus/:covidStatusId', covidStatusController.getCovidStatusDetails);
//@ /covidstatus => POST
router.post('/covidstatus', covidStatusController.postCovidStatus);
//@ /covidstatus => POSTs', covidStatusController.postCovidStatus);

export default router;
