import path from 'path';
import mongoose, { mongo } from 'mongoose';
import express from 'express';
import session from 'express-session';
import flash from 'connect-flash';
import bcrypt from 'bcryptjs';
import { default as connectMongoDBSession } from 'connect-mongodb-session';

//! configuration
import { config } from './config/config';

//! imp library
import Logging from './library/Logging';

//! imp routes
import userRoutes from './routes/user';
import authRoutes from './routes/auth';

//! imp models
import User from './models/user';

declare global {
  namespace Express {
    export interface Request {
      user?: any;
    }
  }
}

declare module 'express-session' {
  export interface SessionData {
    isLoggedIn: any;
    user: any;
  }
}

const app = express();

//! connect with MongoDB Database
mongoose
  .connect(config.mongo.url, { retryWrites: true, w: 'majority' })
  .then(() => {
    //! init Authenticated User
    User.findOne({ username: 'victhangnguyen' })
      .then((userDoc) => {
        // console.log('__Debugger__server__userDoc: ', userDoc);
        //! create new User if one is null
        const password = '123456';
        if (!userDoc) {
          bcrypt
            .hash(password, 12)
            .then((hashedPassword) => {
              const user = new User({
                name: 'Nguyễn Chí Thắng',
                role: 'ADMIN',
                username: 'victhangnguyen',
                password: hashedPassword,
                dob: new Date('1991-05-06'),
                salaryScale: 1,
                startDate: new Date('2022-09-20'),
                department: 'Information Technology',
                annualLeave: 5,
                image:
                  'https://upload.wikimedia.org/wikipedia/vi/b/b0/Avatar-Teaser-Poster.jpg',
                status: {
                  workplace: 'Chưa xác định',
                  isWorking: false,
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

  //! static middlewares
  const publicDir = path.join(__dirname, '..', 'public');
  app.use(express.static(publicDir));

  //! apply middlewares
  // app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(flash());

  const MongoDBStore = connectMongoDBSession(session);

  const store = new MongoDBStore({
    uri: config.mongo.url,
    collection: 'sessions',
  });

  app.use(
    session({
      secret: 'secret-guard-code',
      store: store,
      resave: false,
      saveUninitialized: false,
    })
  );

  //! mdw add Across Request
  app.use((req, res, next) => {
    if (!req.session.user) {
      return next();
    }
    User.findById(req.session.user._id)
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

  //! mdw Locals
  app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session.isLoggedIn;
    res.locals.user = req.user ? req.user : null;
    // res.locals.csrfToken = req.csrfToken();
    next();
  });

  //! routes
  //! app.user(adminRoutes);
  app.use(userRoutes); //! default
  app.use(authRoutes);

  //! error handling
  app.use((req, res, next) => {
    const error = new Error('Page not found');

    Logging.error(error);

    res.render('error404.ejs', {
      pageTitle: 'Error Page',
      user: req.user,
      error: error.message,
    });
  });

  app.listen(config.server.port, () => {
    Logging.info(`Server is running in port: ${config.server.port}!`);
  });
};
