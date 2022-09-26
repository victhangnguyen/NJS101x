import express from 'express';

//! imp controllers
import * as userController from '../controllers/user';
import * as attendanceController from '../controllers/attendance';

const router = express.Router();
//! DEFAULT
//@ / => GET: Home
router.get('/', userController.getHome);

//! ATTENDANCE
//@ /attendance => GET
router.get('/attendance', attendanceController.getAttendance);
//@ /attendance => POST
router.post('/attendance', attendanceController.postAttendance);

export default router;
