import mongoose from 'mongoose';

export interface IAttendance {
  
}
//! interface Methods
export interface IAttendanceMethods {}

//! Methods and Override Methods
//! <T, TQueryHelpers = {}, TMethodsAndOverrides = {}, TVirtuals = {}, TSchema = any>
export interface AttendanceModel extends mongoose.Model<IAttendance, {}, IAttendanceMethods> {}

//! <EnforcedDocType = any, M = Model<EnforcedDocType, any, any, any>, TInstanceMethods = {}>
const attendanceSchema = new mongoose.Schema<IAttendance, AttendanceModel, IAttendanceMethods>({
  name: {
    type: String,
    required: true,
  },
  dob: {
    type: Date,
    required: true,
  },
  salaryScale: {
    type: Number,
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  department: {
    type: String,
    required: true,
  },
  annualLeave: {
    type: Number,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  status: {
    isWorking: {
      type: Boolean,
      required: true,
    },
    workplace: {
      type: String,
      required: true,
    },
  },
});

const Attendance = mongoose.model('Attendance', attendanceSchema);

export default Attendance;
