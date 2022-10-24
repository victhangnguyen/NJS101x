import express from 'express';
//! express-validator
import { validateLogin } from '../middlewares/validators/userValidator';
//! ctrls
import * as authController from '../controllers/auth';

const router = express.Router();

//@ /login => GET
router.get('/login', authController.getLogin);

//@ /login => POST
router.post('/login', validateLogin, authController.postLogin);

//@ /logout => POST
router.post('/logout', authController.postLogout);

export default router;
