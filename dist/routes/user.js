"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
//! imp middlewares
const is_auth_1 = require("../middlewares/is-auth");
const mutler_1 = __importDefault(require("../middlewares/mutler"));
//! imp ctrls
const userController = __importStar(require("../controllers/user"));
const attendanceController = __importStar(require("../controllers/attendance"));
const covidStatusController = __importStar(require("../controllers/covidStatus"));
const statisticController = __importStar(require("../controllers/statistic"));
const absenceController = __importStar(require("../controllers/absence"));
const router = express_1.default.Router();
//! DEFAULT
//@ / => GET: Home
router.get('/', is_auth_1.isAuth, userController.getHome);
//! ATTENDANCE
//@ /attendance => GET
router.get('/attendance', is_auth_1.isAuth, attendanceController.getAttendance);
//@ /attendance => POST
router.post('/attendance', is_auth_1.isAuth, attendanceController.postAttendance);
//@ /absence => GET (Register page)
router.get('/absence', is_auth_1.isAuth, absenceController.getAbsence);
//@ /admin => POST
router.post('/absence', is_auth_1.isAuth, absenceController.postAbsence);
//! PROFILE
//@ /profile => GET (Details)
router.get('/profile/:userId', is_auth_1.isAuth, userController.getProfile);
//@ /profile => POST + add middleware Multer Upload
router.post('/profile/:userId', mutler_1.default.single('image'), is_auth_1.isAuth, userController.postEditProfile);
//! STATISTIC
//@ /statistic => GET
router.get('/statistic', is_auth_1.isAdmin, statisticController.getStatistic);
router.get('/statistic/:userId', is_auth_1.isAuth, statisticController.getStatisticDetails);
//@ //statisticDelete => POST
router.post('/statistic/:userId', is_auth_1.isAuth, statisticController.postStatisticAction);
//! STATISTIC-ALL
//@ /statisticall => GET
router.get('/statisticall', is_auth_1.isAdmin, statisticController.getStatisticAll); //! temp
router.get('/statisticall/:userId', is_auth_1.isAuth, statisticController.getStatisticAllDetails); //! temp
//@ /statisticall => POST
router.post('/statisticall/:userId', statisticController.postStatisticAllAction);
//! COVID-STATUS
//@ /covidstatus => GET (Register Page)
router.get('/covidstatus', is_auth_1.isAuth, covidStatusController.getCovidStatus);
//@ /covidstatus => GET (Details)
router.get('/covidstatus/:covidStatusId', is_auth_1.isAdmin, covidStatusController.getCovidStatusDetails);
//@ /covidreport => GET
router.get('/covidreport/:covidStatusId', covidStatusController.getCovidStatusPDF);
//@ /covidstatus => POST
router.post('/covidstatus', is_auth_1.isAuth, covidStatusController.postCovidStatus);
//@ /covidstatus => POSTs', covidStatusController.postCovidStatus);
exports.default = router;
//# sourceMappingURL=user.js.map