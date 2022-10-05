import mongoose from 'mongoose';
//! imp utils
import utils from '../utils';
export interface IRecord {
  timeIn?: Date;
  timeOut?: Date;
  timeWorking?: string;
  workplace: string;
}
export interface IAttendance {
  userId: mongoose.Types.ObjectId;
  date: string;
  timeRecords: Array<IRecord>;
  timeSum: number;
}
//! interface Methods
export interface IAttendanceMethods {
  calcRecord(): any;
}

//! Methods and Override Methods
//! <T, TQueryHelpers = {}, TMethodsAndOverrides = {}, TVirtuals = {}, TSchema = any>
export interface AttendanceModel extends mongoose.Model<IAttendance, {}, IAttendanceMethods> {}

//! <EnforcedDocType = any, M = Model<EnforcedDocType, any, any, any>, TInstanceMethods = {}>
const attendanceSchema = new mongoose.Schema<IAttendance, AttendanceModel, IAttendanceMethods>({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true },
  date: { type: String, required: true },
  timeSum: { type: Number },
  timeRecords: [
    {
      timeIn: { type: Date },
      timeOut: { type: Date },
      timeWorking: { type: String },
      workplace: { type: String },
    },
  ],
});

attendanceSchema.methods.calcRecord = function () {
  const currentTimeRecords = [...this.timeRecords];
  let timeSum = 0;

  const calculatedTimeRecords = currentTimeRecords.map((record) => {
    let timeWorking = Math.abs(record.timeOut - record.timeIn); //! miniseconds
    // console.log('__Debugger__models_Attendance__timeWorking: ', timeWorking);
    timeSum += timeWorking;
    // console.log('__Debugger__calcRecord__timeWorking: ', timeWorking);
    return {
      ...record,
      timeWorking: utils.convertMsToTime(timeWorking),
    };
  });
  // this.timeSum = utils.convertMsToTime(timeSum); __#debug
  // console.log('__Debugger__models_Attendance__timeSum: ', timeSum); //! NaN
  this.timeSum = timeSum;
  this.timeRecords = calculatedTimeRecords;
  return this.save();
};

const Attendance = mongoose.model('Attendance', attendanceSchema);

export default Attendance;
