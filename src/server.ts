import mongoose from 'mongoose';
import express from 'express';
//! configuration
import { config } from './config/config';

//! imp library
import Logging from './library/Logging';

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
  
  //! apply middlewares
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  //! routes
  // app.use('');

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
