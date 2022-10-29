"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCovidStatusPDF = exports.getCovidStatusDetails = exports.postCovidStatus = exports.getCovidStatus = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const util = require('node:util');
const pdfkit_1 = __importDefault(require("pdfkit"));
const mongoose_1 = __importDefault(require("mongoose"));
//! imp utils
const utils_1 = __importDefault(require("../utils"));
//! imp library
const Logging_1 = __importDefault(require("../library/Logging"));
//! imp models
const covidStatus_1 = __importDefault(require("../models/covidStatus"));
const user_1 = __importDefault(require("../models/user"));
const getCovidStatus = (req, res, next) => {
    covidStatus_1.default.findOne({ userId: req.user._id })
        .then((covidStatusDoc) => {
        //! create New Covid Status Doc
        if (!covidStatusDoc) {
            return covidStatus_1.default.create({
                userId: req.user._id,
                bodyTemperatures: [],
                vaccines: [],
                positive: [],
            })
                .then((covidStatusDoc) => {
                if (covidStatusDoc)
                    user_1.default.findOne({ _id: req.user._id })
                        .then((userDoc) => {
                        (userDoc === null || userDoc === void 0 ? void 0 : userDoc.healthStatus) &&
                            (userDoc.healthStatus.covidStatusId =
                                new mongoose_1.default.Types.ObjectId(covidStatusDoc._id));
                        userDoc.save().then((result) => {
                            Logging_1.default.success('Create New CovidStatus by userId: ' + req.user._id);
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
            user_1.default.findById(req.user._id)
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
exports.getCovidStatus = getCovidStatus;
//! after CovidStatus created.
const postCovidStatus = (req, res, next) => {
    const type = req.query.type;
    const temp = req.body
        .bodyTemperature
        ? Number(req.body.bodyTemperature)
        : undefined;
    const name = req.body.name;
    const date = req.body.date
        ? new Date(utils_1.default.convertDateVNtoUS(req.body.date))
        : undefined;
    // console.log('__Debugger__ctrls__covidStatus__postCovidStatus__req.body.date: ', req.body.date);
    // console.log('__Debugger__ctrls__covidStatus__postCovidStatus__type: ', type, 'temp: ', temp, 'date: ', date);
    req.user
        .addCovidStatus(type, temp, name, date)
        .then((covidStatusDoc) => {
        // console.log('__Debugger__postCovidStatus2__covidStatusDoc: ', covidStatusDoc.positive);
        // res.redirect(`/covidstatus/${covidStatusDoc._id}`);
        res.redirect('/covidstatus');
    })
        .catch((err) => {
        console.log(err);
    });
};
exports.postCovidStatus = postCovidStatus;
const getCovidStatusDetails = (req, res, next) => {
    const covidStatusId = req.params.covidStatusId;
    covidStatus_1.default.findById(covidStatusId)
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
exports.getCovidStatusDetails = getCovidStatusDetails;
const getCovidStatusPDF = (req, res, next) => {
    const covidStatusId = req.params.covidStatusId;
    //! Restricting file access
    covidStatus_1.default.findById(covidStatusId)
        .then((covidStatusDoc) => {
        console.log('__Debugger__ctrls__covidStatus__getCovidStatusPDF__covidStatusDoc: ', covidStatusDoc);
        //! Guard Clause
        if (!covidStatusDoc) {
            return next(new Error('No Covid Report found!'));
            // console.log(
            //   '__Debugger__ctrls__covidStatus__getCovidStatusPDF | No covidStatusDoc'
            // );
        }
        //! Guard Clause Unauthorized
        if ((covidStatusDoc === null || covidStatusDoc === void 0 ? void 0 : covidStatusDoc.userId.toString()) !== req.user._id.toString() &&
            req.user.role !== 'ADMIN') {
            return next(new Error('Unauthorized'));
            //   ('__Debugger__ctrls__covidStatus__getCovidStatusPDF | Unauthorized');
        }
        const covidReportName = 'covidreport-' + covidStatusId + '.pdf';
        const covidReportPath = path_1.default.join('src', 'data', 'covidReports', covidReportName);
        // Create a document
        const pdfDoc = new pdfkit_1.default();
        res.setHeader('Content-Type', 'application/pdf');
        //! This allow us to define How this content should be served to the Cliend (inline or attachment)
        res.setHeader('Content-Disposition', 'inline; filename="' + covidReportName + '"');
        // Pipe its output somewhere, like to a file or HTTP response
        pdfDoc.pipe(fs_1.default.createWriteStream(covidReportPath));
        pdfDoc.pipe(res);
        pdfDoc.fontSize(26).text('Covid Status Report', { underline: true });
        pdfDoc.text('=========================');
        pdfDoc.fontSize(20).text('Body Temperatures Information Table');
        pdfDoc
            .fontSize(14)
            .text(`STT     Body Temperatures       Time       Date`);
        covidStatusDoc.bodyTemperatures.forEach((bt, index) => {
            pdfDoc.fontSize(14).text(`${index + 1}          ${bt.temp}                                  ${bt.date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}       ${bt.date.toLocaleDateString('vi-VN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            })}`);
        });
        pdfDoc.text('-------------------------------------------------------------------------------');
        pdfDoc.fontSize(20).text('Vaccines Information Table');
        pdfDoc
            .fontSize(14)
            .text(`STT     Vaccine Name               Date`);
        covidStatusDoc.vaccines.forEach((vaccine, index) => {
            pdfDoc.fontSize(14).text(`${index + 1}          ${vaccine.name}                             ${vaccine.date.toLocaleDateString('vi-VN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            })}`);
        });
        pdfDoc.text('-------------------------------------------------------------------------------');
        pdfDoc.fontSize(20).text('Postive Information Table');
        pdfDoc
            .fontSize(14)
            .text(`STT     Date`);
        covidStatusDoc.positive.forEach((pos, index) => {
            pdfDoc.fontSize(14).text(`${index + 1}          ${pos.date.toLocaleDateString('vi-VN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            })}`);
        });
        pdfDoc.text('-------------------------------------------------------------------------------');
        // pdfDoc.fontSize(20).text(`Total Price: $${totalPrice}`);
        pdfDoc.end();
    })
        .catch((err) => {
        console.log(err);
    });
};
exports.getCovidStatusPDF = getCovidStatusPDF;
const express = require('express');
//# sourceMappingURL=covidStatus.js.map