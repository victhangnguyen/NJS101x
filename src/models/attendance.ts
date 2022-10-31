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
  dateAt: Date;
  timeRecords: Array<IRecord>;
  totalTime: number;
  createdAt?: any;
}
//! interface Methods
export interface IAttendanceMethods {
  calcRecord(): any;
}

//! Methods and Override Methods
//! <T, TQueryHelpers = {}, TMethodsAndOverrides = {}, TVirtuals = {}, TSchema = any>
export interface AttendanceModel
  extends mongoose.Model<IAttendance, {}, IAttendanceMethods> {}

//! <EnforcedDocType = any, M = Model<EnforcedDocType, any, any, any>, TInstanceMethods = {}>
const attendanceSchema = new mongoose.Schema<
  IAttendance,
  AttendanceModel,
  IAttendanceMethods
>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    date: { type: String, required: true },
    dateAt: { type: Date, required: true },
    totalTime: { type: Number },
    timeRecords: [
      {
        timeIn: { type: Date },
        timeOut: { type: Date },
        timeWorking: { type: String },
        workplace: { type: String },
      },
    ],
  },
  { timestamps: true }
);

attendanceSchema.methods.calcRecord = function () {
  const currentTimeRecords = [...this.timeRecords];
  let totalTime = 0;

  const calculatedTimeRecords = currentTimeRecords.map((record) => {
    let timeWorking = Math.abs(record.timeOut - record.timeIn) / 1000; //! seconds
    totalTime += timeWorking;
    return {
      ...record,
      timeWorking,
    };
  });
  this.totalTime = Math.floor(totalTime); //! seconds
  this.timeRecords = calculatedTimeRecords;
  return this.save();
};

const Attendance = mongoose.model('Attendance', attendanceSchema);

export default Attendance;
