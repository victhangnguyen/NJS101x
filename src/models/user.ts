const MAXIMUM_WORKING_HOURS = 8;
import mongoose from 'mongoose';
import utils from '../utils';
//! imp models
import Attendance, { IAttendance, IRecord, IAttendanceMethods } from './attendance';
import CovidStatus, { ICovidStatus, ICovidStatusMethods } from './covidStatus';
import Absence, { IAbsence, IAbsenceMethods } from './absence';
import Logging from '../library/Logging';

export interface IUser {
  _id?: mongoose.Types.ObjectId;
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
  // addAttendance: (timeIn: Date, workplace: string) => IRecord;
}
//! interface Methods - instance
export interface IUserMethods {
  // addAttendance(type: string, workplace: string): mongoose.Document<IUser>;
  addAttendance(type: string, date: string): Promise<mongoose.HydratedDocument<IAttendance, IAttendanceMethods>>;
  //! setStatus return this (user Instance)
  setStatus(type: string, workplace: string): Promise<mongoose.HydratedDocument<IUser, IUserMethods>>;
  addCovidStatus(
    type: string,
    temp: number | undefined,
    name: string | undefined,
    date: Date | undefined
  ): Promise<mongoose.HydratedDocument<ICovidStatus, ICovidStatusMethods>>;
  addAbsences(type: string, dates: Array<Date>, hours: number | undefined, reason: string): any;
  // Promise<mongoose.HydratedDocument<IAbsence, IAbsenceMethods>>;
}

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

userSchema.methods.setStatus = function (type: string, workplace: string) {
  this.status.workplace = workplace ? workplace : 'Vị trí chưa xác định';

  switch (type) {
    case 'start':
      this.status.isWorking = true;
      break;

    case 'end':
      this.status.isWorking = false;
      break;

    default:
      return this;
  }
  return this.save();
};

userSchema.methods.addCovidStatus = function (
  type: string,
  temp: number | undefined = undefined,
  name: string | undefined = undefined,
  date: Date | undefined = undefined
) {
  return CovidStatus.findOne({ userId: this._id })
    .then((covidStatusDoc) => {
      let update;
      switch (type) {
        case 'bodytemp':
          const newBodyTemps = [...covidStatusDoc?.bodyTemperatures!];
          newBodyTemps.push({
            date: new Date(),
            temp: temp!,
          });
          update = { bodyTemperatures: newBodyTemps };
          break;

        case 'vaccination':
          const newVaccines = [...covidStatusDoc?.vaccines!];
          newVaccines.push({
            name: name!,
            date: date!,
          });
          update = { vaccines: newVaccines };
          break;

        case 'positive':
          const newPositive = [...covidStatusDoc?.positive!];
          newPositive.push({ date: date! });
          update = { positive: newPositive };
          break;

        default:
          update = {};
      }

      return CovidStatus.findOneAndUpdate({ userId: this._id }, update, { new: true }) as any;
    })
    .catch((err) => {
      console.log(err);
    });
};

userSchema.methods.addAttendance = function (type: string, date: string) {
  const currentDate = new Date();
  return Attendance.findOne({ userId: this._id, date: date }).then((attendDoc: any) => {
    console.log('__Debugger__model__user__attendDoc: ', attendDoc);
    switch (type) {
      case 'start':
        const newRecord: IRecord = {
          timeIn: currentDate,
          timeOut: undefined,
          workplace: this.status.workplace,
        };

        if (!attendDoc) {
          //! create new AttendDoc
          return Attendance.create({
            userId: this._id,
            date: currentDate.toLocaleDateString(),
            timeRecords: [newRecord],
          });
        } else {
          attendDoc.timeRecords.push(newRecord);
        }
        break;

      case 'end':
        const lastedElementIndex = attendDoc?.timeRecords.length - 1;
        const currentRecord = attendDoc.timeRecords[lastedElementIndex];

        currentRecord!.timeOut = currentDate;

        attendDoc.timeRecords[lastedElementIndex] = currentRecord;

        break;

      default:
        break;
    }

    return attendDoc.save();
  });
};

userSchema.methods.addAbsences = function (
  type: string,
  dates: Array<Date>,
  hours: number | undefined,
  reason: string
) {
  // console.log('__Debugger__models_User__dates: ', dates);
  //! guard clause
  switch (type) {
    case 'dates':
      if (this.annualLeave < dates.length) {
        throw new Error(`You have registered ${dates.length} dates over ${this.annualLeave} allowable dates`);
      }

    case 'hours':
      if (this.annualLeave === 0) {
        throw new Error(`You cannot register this, due to annualLeave is ${this.annualLeave}`);
      }

    default:
      break;
  }

  return (
    Absence.find({ _userId: this._id })
      //! find all of Absence that Belongs to userId
      .then((absenceDocs: Array<IAbsence>) => {
        //! ADD MANY ABSENCES
        const absDocArray = dates.map((date) => {
          return Attendance.findOne({ date: date.toLocaleDateString() }).then((attendanceDoc) => {
            console.log('__Debugger__models_User__addAbsences__attendanceDoc: ', attendanceDoc);
            const existingAbsenceDoc = absenceDocs.find(
              (abs: IAbsence) => abs.date.toDateString() === date.toDateString()
            );
            console.log('existingAbsenceDoc: ', existingAbsenceDoc);
            if (existingAbsenceDoc) {
              switch (type) {
                case 'dates':
                  throw new Error(`${date} is registered`);
                  break;

                case 'hours':
                  let curTimeWorkingAttend = 0;
                  //! guard clause
                  if (attendanceDoc) {
                    curTimeWorkingAttend = utils.round(attendanceDoc?.timeSum! / (1000 * 60 * 60));
                    console.log('attendanceDoc existing');
                  }
                  console.log('__Debugger__models_User__curTimeWorkingAttend: ', curTimeWorkingAttend);
                  console.log('__Debugger__models_User__existingAbsenceDoc.hours: ', existingAbsenceDoc.hours);

                  if (curTimeWorkingAttend + existingAbsenceDoc.hours + hours! <= MAXIMUM_WORKING_HOURS) {
                    existingAbsenceDoc.hours += hours!;
                    return existingAbsenceDoc.save();
                  } else {
                    throw new Error(
                      `Ngày ${date} bạn đã làm ${curTimeWorkingAttend} giờ và đăng ký nghỉ phép ${
                        existingAbsenceDoc.hours
                      } giờ. Bạn chỉ được thêm tối đa ${utils.round(
                        MAXIMUM_WORKING_HOURS - curTimeWorkingAttend - existingAbsenceDoc.hours
                      )} giờ nữa!`
                    );
                  }
                  break;

                default:
                  break;
              }
            } else {
              return Absence.create({
                userId: this._id,
                date: date,
                hours: type === 'dates' ? MAXIMUM_WORKING_HOURS : hours,
                reason: reason,
              })
                .then((absenceDoc) => {
                  return absenceDoc;
                })
                .catch((err) => {
                  console.log(err);
                });
            }
          });
        });

        return Promise.all(absDocArray)
          .then((absenceDocs) => {
            console.log('__Debugger__models_User__addAbseces__Promise_resolve__absenceDocs: ', absenceDocs);
            if (type === 'dates') {
              this.annualLeave -= absenceDocs.length;
              return this.save().then((userDoc: IUser) => {
                return absenceDocs;
              });
            } else {
              this.annualLeave = utils.round(this.annualLeave - hours! / MAXIMUM_WORKING_HOURS);
              return this.save().then((userDoc: IUser) => {
                return absenceDocs;
              });
            }
          })
          .catch((err: Error) => {
            throw new Error(err.message);
          });
      })
      .catch((err) => {
        throw new Error(err.message);
      })
  );
};

const User = mongoose.model<IUser, UserModel>('User', userSchema);

export default User;
