"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAdmin = exports.isAuth = void 0;
const isAuth = (req, res, next) => {
    if (!req.session.isLoggedIn) {
        return res.redirect('/login');
    }
    next();
};
exports.isAuth = isAuth;
const isAdmin = (req, res, next) => {
    if (req.session.isLoggedIn && req.user.role === 'ADMIN') {
        next();
    }
    else {
        return res.redirect('/');
    }
};
exports.isAdmin = isAdmin;
// export default isAuth;
//# sourceMappingURL=is-auth.js.map