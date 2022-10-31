"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const mongoose_1 = __importDefault(require("mongoose"));
const express_1 = __importDefault(require("express"));
const express_session_1 = __importDefault(require("express-session"));
const connect_flash_1 = __importDefault(require("connect-flash"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const connect_mongodb_session_1 = __importDefault(require("connect-mongodb-session"));
//! configuration
const config_1 = require("./config/config");
//! imp library
const Logging_1 = __importDefault(require("./library/Logging"));
//! imp routes
const user_1 = __importDefault(require("./routes/user"));
const auth_1 = __importDefault(require("./routes/auth"));
//! imp models
const user_2 = __importDefault(require("./models/user"));
const app = (0, express_1.default)();
//! connect with MongoDB Database
mongoose_1.default
    .connect(config_1.config.mongo.url, { retryWrites: true, w: 'majority' })
    .then(() => {
    //! init Authenticated User
    user_2.default.findOne({ username: 'victhangnguyen' })
        .then((userDoc) => {
        // console.log('__Debugger__server__userDoc: ', userDoc);
        //! create new User if one is null
        const password = '123456';
        if (!userDoc) {
            bcryptjs_1.default
                .hash(password, 12)
                .then((hashedPassword) => {
                const user = new user_2.default({
                    name: 'Nguyễn Chí Thắng',
                    role: 'STAFF',
                    username: 'victhangnguyen',
                    password: hashedPassword,
                    dob: new Date('1991-05-06'),
                    salaryScale: 1,
                    startDate: new Date('2022-09-20'),
                    department: 'Information Technology',
                    annualLeave: 5,
                    image: 'https://upload.wikimedia.org/wikipedia/vi/b/b0/Avatar-Teaser-Poster.jpg',
                    status: {
                        workplace: 'Chưa xác định',
                        isWorking: false,
                    },
                    manage: {
                        userId: new mongoose_1.default.Types.ObjectId('6356f9e926c1ce9bd51ee787'),
                    },
                });
                user.save();
            })
                .catch((err) => {
                console.log('server error: ', err);
                // const error = new Error(err);
                // error.httpStatusCode = 500;
                // return next(error);
            });
        }
    })
        .catch((err) => {
        console.log(err);
    });
    //! Running Server with Express
    startServer();
})
    .catch((err) => {
    console.log(err);
});
const startServer = () => {
    //! declare Template Engine
    app.set('view engine', 'ejs');
    app.set('views', 'src/views');
    //! middlewares [STATIC]
    const publicDir = path_1.default.join(__dirname, '..', 'public');
    app.use(express_1.default.static(publicDir));
    const imagesDir = path_1.default.join(__dirname, 'images');
    app.use('/src/images', express_1.default.static(imagesDir));
    //! apply middlewares
    // app.use(express.json());
    app.use(express_1.default.urlencoded({ extended: true }));
    app.use((0, connect_flash_1.default)());
    const MongoDBStore = (0, connect_mongodb_session_1.default)(express_session_1.default);
    const store = new MongoDBStore({
        uri: config_1.config.mongo.url,
        collection: 'sessions',
    });
    app.use((0, express_session_1.default)({
        secret: 'secret-guard-code',
        store: store,
        resave: false,
        saveUninitialized: false,
    }));
    //! Middleware Across Request
    app.use((req, res, next) => {
        if (!req.session.user) {
            return next();
        }
        user_2.default.findById(req.session.user._id)
            .then((user) => {
            if (!user) {
                return next();
            }
            req.user = user;
            next();
        })
            .catch((err) => {
            next(new Error(err));
        });
    });
    //! Middleware Locals
    app.use((req, res, next) => {
        res.locals.isAuthenticated = req.session.isLoggedIn;
        // res.locals.csrfToken = req.csrfToken();
        next();
    });
    //! routes
    //! app.user(adminRoutes);
    app.use(user_1.default); //! default
    app.use(auth_1.default);
    //! error handling
    app.use((req, res, next) => {
        const error = new Error('Page not found');
        // Logging.error(error);
        res.render('error404.ejs', {
            pageTitle: 'Error Page',
            user: req.user,
            error: error.message,
        });
    });
    app.use(((error, req, res, next) => {
        // res.status(error.httpStatusCode).render(...);
        Logging_1.default.error(error);
        // res.redirect('/500');
        res.status(500).render('500', {
            pageTitle: 'Error!',
            path: '/500',
            isAuthenticated: req.session.isLoggedIn,
            user: req.user,
            error: error,
        });
    }));
    app.listen(config_1.config.server.port, () => {
        Logging_1.default.info(`Server is running in port: ${config_1.config.server.port}!`);
    });
};
//# sourceMappingURL=server.js.map