import mongoose from 'mongoose';

export interface IUser {
  name: string;
  dob: Date;
  salaryScale: number;
  startDate: Date;
  department: string;
  annualLeave: number;
  image: string;
  status: {
    attendanceId: mongoose.Types.ObjectId;
    isWorking: boolean;
    workplace: string;
  };
}
//! interface Methods
export interface IUserMethods {}

//! Methods and Override Methods
//! <T, TQueryHelpers = {}, TMethodsAndOverrides = {}, TVirtuals = {}, TSchema = any>
export interface UserModel extends mongoose.Model<IUser, {}, IUserMethods> {}

//! <EnforcedDocType = any, M = Model<EnforcedDocType, any, any, any>, TInstanceMethods = {}>
const userSchema = new mongoose.Schema<IUser, UserModel, IUserMethods>({
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

const User = mongoose.model('User', userSchema);

export default User;
