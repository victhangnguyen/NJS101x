import path from 'path';
import fs from 'fs';

import { RequestHandler } from 'express';
const util = require('node:util');

import PDFDocument from 'pdfkit';

import mongoose from 'mongoose';
//! imp utils
import utils from '../utils';

//! imp library
import Logging from '../library/Logging';

//! imp models
import CovidStatus, { ICovidStatus } from '../models/covidStatus';
import User from '../models/user';

export const getCovidStatus: RequestHandler = (req, res, next) => {
  CovidStatus.findOne({ userId: req.user._id })
    .then((covidStatusDoc) => {
      //! create New Covid Status Doc
      if (!covidStatusDoc) {
        return CovidStatus.create({
          userId: req.user._id,
          bodyTemperatures: [],
          vaccines: [],
          positive: [],
        })
          .then((covidStatusDoc) => {
            if (covidStatusDoc)
              User.findOne({ _id: req.user._id })
                .then((userDoc) => {
                  userDoc?.healthStatus &&
                    (userDoc.healthStatus.covidStatusId =
                      new mongoose.Types.ObjectId(covidStatusDoc._id));
                  userDoc!.save().then((result: any) => {
                    Logging.success(
                      'Create New CovidStatus by userId: ' + req.user._id
                    );
                  });
                })

                .catch((err) => {
                  console.log(err);
                });
            return covidStatusDoc; //!__debugger1
          })
          .catch((err) => {
            console.log(err);
          });
      }

      //! if covidStatus existed
      return covidStatusDoc;
    })
    .then((covidStatusDoc) => {
      //! ROLE: 'ADMIN'
      if (req.user.role === 'ADMIN') {
        User.findById(req.user._id)
          .populate({
            path: 'manage.staffs',
            populate: {
              path: 'healthStatus.covidStatusId',
            },
          })
          .then((userDoc) => {
            console.log(util.inspect(userDoc, { depth: 12 }));

            return res.render('covid-status.ejs', {
              path: '/covidstatus',
              pageTitle: 'Thông tin Covid cá nhân',
              user: userDoc,
              covidStatus: covidStatusDoc,
            });
          })
          .catch((err) => {
            console.log(err);
          });
      }
      //! ROLE: 'STAFF'
      else {
        return res.render('covid-status.ejs', {
          path: '/covidstatus',
          pageTitle: 'Thông tin Covid cá nhân',
          user: req.user,
          covidStatus: covidStatusDoc,
        });
      }
    })
    .catch((err) => {
      console.log(err);
    });
};

//! after CovidStatus created.
export const postCovidStatus: RequestHandler = (req, res, next) => {
  const type: string = (req.query as { type: string }).type;
  const temp: number | undefined = (req.body as { bodyTemperature: string })
    .bodyTemperature
    ? Number(req.body.bodyTemperature)
    : undefined;
  const name: string | undefined = (req.body as { name: string }).name;
  const date: Date | undefined = (req.body as { date: string }).date
    ? new Date(utils.convertDateVNtoUS(req.body.date))
    : undefined;

  // console.log('__Debugger__ctrls__covidStatus__postCovidStatus__req.body.date: ', req.body.date);
  // console.log('__Debugger__ctrls__covidStatus__postCovidStatus__type: ', type, 'temp: ', temp, 'date: ', date);
  req.user
    .addCovidStatus(type, temp, name, date)
    .then((covidStatusDoc: ICovidStatus) => {
      // console.log('__Debugger__postCovidStatus2__covidStatusDoc: ', covidStatusDoc.positive);
      // res.redirect(`/covidstatus/${covidStatusDoc._id}`);
      res.redirect('/covidstatus');
    })
    .catch((err: Error) => {
      console.log(err);
    });
};

export const getCovidStatusDetails: RequestHandler = (req, res, next) => {
  const covidStatusId = req.params.covidStatusId;
  CovidStatus.findById(covidStatusId)
    .then((covidStatusDoc) => {
      return res.render('covid-status-details.ejs', {
        path: '/covidstatus',
        pageTitle: 'Chi tiết Thông tin Covid cá nhân',
        user: req.user,
        covidStatus: covidStatusDoc,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

export const getCovidStatusPDF: RequestHandler = (req, res, next) => {
  const covidStatusId = req.params.covidStatusId;
  //! Restricting file access
  CovidStatus.findById(covidStatusId)
    .then((covidStatusDoc) => {
      console.log(
        '__Debugger__ctrls__covidStatus__getCovidStatusPDF__covidStatusDoc: ',
        covidStatusDoc
      );
      //! Guard Clause
      if (!covidStatusDoc) {
        return next(new Error('No Covid Report found!'));
        // console.log(
        //   '__Debugger__ctrls__covidStatus__getCovidStatusPDF | No covidStatusDoc'
        // );
      }

      //! Guard Clause Unauthorized
      if (
        covidStatusDoc?.userId.toString() !== req.user._id.toString() &&
        req.user.role !== 'ADMIN'
      ) {
        return next(new Error('Unauthorized'));
        //   ('__Debugger__ctrls__covidStatus__getCovidStatusPDF | Unauthorized');
      }
      const covidReportName = 'covidreport-' + covidStatusId + '.pdf';
      const covidReportPath = path.join(
        'src',
        'data',
        'covidReports',
        covidReportName
      );
      // Create a document
      const pdfDoc = new PDFDocument();
      res.setHeader('Content-Type', 'application/pdf');
      //! This allow us to define How this content should be served to the Cliend (inline or attachment)
      res.setHeader(
        'Content-Disposition',
        'inline; filename="' + covidReportName + '"'
      );

      // Pipe its output somewhere, like to a file or HTTP response
      pdfDoc.pipe(fs.createWriteStream(covidReportPath));
      pdfDoc.pipe(res);

      pdfDoc.fontSize(26).text('Covid Status Report', { underline: true });
      pdfDoc.text('=========================');
      pdfDoc.fontSize(20).text('Body Temperatures Information Table');
      pdfDoc
        .fontSize(14)
        .text(`STT     Body Temperatures       Time       Date`);
      covidStatusDoc.bodyTemperatures.forEach((bt, index) => {
        pdfDoc.fontSize(14).text(
          `${index + 1}          ${
            bt.temp
          }                                  ${bt.date.toLocaleTimeString(
            'vi-VN',
            { hour: '2-digit', minute: '2-digit' }
          )}       ${bt.date.toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}`
        );
      });

      pdfDoc.text('-------------------------------------------------------------------------------');
      pdfDoc.fontSize(20).text('Vaccines Information Table');
      pdfDoc
        .fontSize(14)
        .text(`STT     Vaccine Name               Date`);
      covidStatusDoc.vaccines.forEach((vaccine, index) => {
        pdfDoc.fontSize(14).text(
          `${index + 1}          ${
            vaccine.name
          }                             ${vaccine.date.toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}`
        );
      });

      pdfDoc.text('-------------------------------------------------------------------------------');
      pdfDoc.fontSize(20).text('Postive Information Table');
      pdfDoc
        .fontSize(14)
        .text(`STT     Date`);
        covidStatusDoc.positive.forEach((pos, index) => {
          pdfDoc.fontSize(14).text(
            `${index + 1}          ${pos.date.toLocaleDateString('vi-VN', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}`
          );
        });
  
        pdfDoc.text('-------------------------------------------------------------------------------');

      // pdfDoc.fontSize(20).text(`Total Price: $${totalPrice}`);

      pdfDoc.end();
    })
    .catch((err) => {
      console.log(err);
    });
};

const express = require('express');
