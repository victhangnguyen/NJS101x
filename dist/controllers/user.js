"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.postEditProfile = exports.getProfile = exports.getHome = void 0;
//! utils
const file_1 = require("../utils/file");
//! imp models
const user_1 = __importDefault(require("../models/user"));
//@ default -> GET
const getHome = (req, res, next) => {
    const currentUser = req.user;
    res.render('home', {
        path: '/',
        pageTitle: 'Ứng dụng quản lý',
        user: currentUser,
    });
};
exports.getHome = getHome;
//@ /profile:userId => GET
const getProfile = (req, res, next) => {
    const userId = req.params.userId;
    user_1.default.findById(userId)
        .then((userDoc) => {
        // console.log('__Debugger__ctrls__user__getProfile__userDoc: ', userDoc);
        res.render('profile.ejs', {
            path: '/profile',
            pageTitle: 'Thông tin cá nhân | ' + userDoc.name,
            user: userDoc,
            errorMessage: null,
        });
    })
        .catch((err) => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });
};
exports.getProfile = getProfile;
//@ /profile:userId => POST
const postEditProfile = (req, res, next) => {
    const image = req.file;
    console.log('__Debugger__ctrls__user__image: ', image);
    const userId = req.params.userId;
    user_1.default.findById(userId)
        .then((userDoc) => {
        if (!image) {
            return res.status(500).render('profile.ejs', {
                pageTitle: 'Thông tin cá nhân',
                path: '/profile',
                errorMessage: 'Đính kèm thêm ảnh .',
                user: req.user,
            });
        }
        else {
            (0, file_1.deleteFile)(userDoc.image);
            userDoc.image = image.path;
            userDoc
                .save()
                .then((userDoc) => {
                res.redirect(`/profile/${userDoc._id}`);
            })
                .catch((err) => {
                const error = new Error(err);
                error.httpStatusCode = 500;
                return next(error);
            });
        }
    })
        .catch((err) => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });
};
exports.postEditProfile = postEditProfile;
//# sourceMappingURL=user.js.map