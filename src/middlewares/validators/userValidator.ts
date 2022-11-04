import { check, body } from 'express-validator';

export const validateLogin = [
  check('username')
    .trim()
    .notEmpty()
    .isAlphanumeric()
    .withMessage('Username cannot be empty!')
    .bail()
    .isLength({ min: 5 })
    .withMessage('Length minimum is 5 characters required!')
    .bail()
    .isLength({ max: 15 })
    .withMessage('Length maximum is 15 characters required!'),

  body('password')
    .notEmpty()
    .withMessage('Password cannot be empty!')
    .bail()
    .isLength({ min: 6 })
    .withMessage('Length minimum is 6 characters required!')
    .bail()
    .isLength({ max: 120 })
    .withMessage('Length maximum is 120 characters required!'),
];
