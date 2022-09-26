import mongoose from 'mongoose';
import express from 'express';
//! configuration
import { config } from './config/config';

//! imp library
import Logging from './library/Logging';

//! imp routes
import userRoutes from './routes/user';

const app = express();

//! connect with MongoDB Database
mongoose
  .connect(config.mongo.url, { retryWrites: true, w: 'majority' })
  .then(() => {
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

  //! apply middlewares
  // app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  //! routes
  app.use('/', userRoutes); //! default

  //! error handling
  app.use((req, res, next) => {
    const error = new Error('Not found');

    Logging.error(error);

    res.status(404).json({
      message: error.message,
    });
  });

  app.listen(config.server.port, () => {
    Logging.info(`Server is running in port: ${config.server.port}!`);
  });
};
