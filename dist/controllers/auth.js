"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.postLogout = exports.postLogin = exports.getLogin = void 0;
//! imp library
const Logging_1 = __importDefault(require("../library/Logging"));
//! imp models
const user_1 = __importDefault(require("../models/user"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const express_validator_1 = require("express-validator");
const getLogin = (req, res, next) => {
    let message = req.flash('error');
    if (message.length > 0) {
        message = message[0];
    }
    else {
        message = null;
    }
    return res.status(200).render('auth/login.ejs', {
        path: '/login',
        pageTitle: 'Login',
        user: req.user,
        errorMessage: message,
        oldInput: {
            email: '',
            password: '',
        },
        validationErrors: [],
    });
};
exports.getLogin = getLogin;
const postLogin = (req, res, next) => {
    const { username, password } = req.body;
    console.log('__Debugger__ctrls__auth__username:', username, ' - password: ', password);
    const errors = (0, express_validator_1.validationResult)(req);
    console.log('__Debugger__ctrls__auth__errors:', errors);
    if (!errors.isEmpty()) {
        //! render Form with Error Message
        return res.status(422).render('auth/login', {
            path: '/login',
            pageTitle: 'Login',
            errorMessage: errors.array()[0].msg,
            oldInput: {
                username: username,
                password: password,
            },
            validationErrors: errors.array(),
        });
    }
    user_1.default.findOne({ username: username })
        .then((userDoc) => {
        console.log('__Debugger__ctrls__auth__postLogin__userDoc: ', userDoc);
        if (!userDoc) {
            //! user no-existing
            return res.status(422).render('auth/login', {
                path: '/login',
                pageTitle: 'Login',
                // errorMessage: 'Invalid email or password.',
                oldInput: {
                    username: username,
                    password: password,
                },
                validationErrors: [
                    {
                        msg: 'Username không tồn tại!',
                        param: 'username',
                    },
                ],
            });
        }
        bcryptjs_1.default
            .compare(password, userDoc.password)
            .then((doMatch) => {
            if (doMatch) {
                //! important
                req.session.isLoggedIn = true;
                req.session.user = userDoc;
                return req.session.save((err) => {
                    // console.log(err);
                    Logging_1.default.success('LOGIN SUCCESS');
                    //! Go Home
                    res.redirect('/');
                });
            }
            //! Case: password no match
            // req.flash('error', 'Invalid email or password.');
            return res.render('auth/login', {
                path: '/login',
                pageTitle: 'Login',
                oldInput: {
                    username: username,
                    password: password,
                },
                validationErrors: [
                    {
                        msg: 'Mật khẩu không chính xác!',
                        param: 'password',
                    },
                ],
            });
        })
            .catch((err) => {
            console.log(err);
            res.redirect('/login');
        });
    })
        .catch((err) => {
        console.log(err);
    });
};
exports.postLogin = postLogin;
const postLogout = (req, res, next) => {
    req.session.destroy((err) => {
        Logging_1.default.error('LOGOUT SUCCESS');
        // console.log(err);
        res.redirect('/');
    });
};
exports.postLogout = postLogout;
//# sourceMappingURL=auth.js.map