import path from 'path';
import mongoose from 'mongoose';
import express from 'express';
//! configuration
import { config } from './config/config';

//! imp library
import Logging from './library/Logging';

//! imp routesk
import userRoutes from './routes/user';

//! imp controllers
import { checkAuth } from './controllers/user';

//! imp models
import User from './models/user';

declare global {
  namespace Express {
    export interface Request {
      user?: any;
    }
  }
}

const app = express();

//! connect with MongoDB Database
mongoose
  .connect(config.mongo.url, { retryWrites: true, w: 'majority' })
  .then(() => {
    //! init Authenticated User
    User.findOne({})
      .then((userDoc) => {
        // console.log('__Debugger__server__userDoc: ', userDoc);
        //! create new User if one is null
        if (!userDoc) {
          const user = new User({
            name: 'Nguyễn Chí Thắng',
            dob: new Date('1991-05-06'),
            salaryScale: 1,
            startDate: new Date('2022-09-20'),
            department: 'Information Technology',
            annualLeave: 5,
            image: '/assests/images/thangncfx16840.png',
            status: {
              workplace: 'Chưa xác định',
              isWorking: false,
            },
          });
          user.save();
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

  //! static folder
  const publicDir = path.join(__dirname, '..', 'public');
  app.use(express.static(publicDir));

  //! apply middlewares
  // app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  //! check Authentication
  app.use(checkAuth);
  //! routes
  app.use(userRoutes); //! default

  //! error handling
  app.use((req, res, next) => {
    const error = new Error('Page not found');

    Logging.error(error);

    res.status(404).json({
      message: error.message,
    });
  });

  app.listen(config.server.port, () => {
    Logging.info(`Server is running in port: ${config.server.port}!`);
  });
};
