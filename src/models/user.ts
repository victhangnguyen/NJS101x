import mongoose from 'mongoose';

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
  addAbsences(type: string, date: Date | undefined, dates: Array<Date>, hours: number | undefined, reason: string): any;
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
  const currentDate = new Date().toLocaleDateString('en-GB', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
  });
  return Attendance.findOne({ userId: this._id, date: date }).then((attendDoc: any) => {
    // console.log('__Debugger__model__user__attendDoc: ', attendDoc);
    switch (type) {
      case 'start':
        const newRecord: IRecord = {
          timeIn: new Date(),
          timeOut: undefined,
          workplace: this.status.workplace,
        };

        if (!attendDoc) {
          //! create new AttendDoc
          return Attendance.create({
            userId: this._id,
            date: currentDate,
            timeRecords: [newRecord],
          });
        } else {
          attendDoc.timeRecords.push(newRecord);
        }
        break;

      case 'end':
        const currentRecord = attendDoc.timeRecords[attendDoc?.timeRecords.length - 1];

        currentRecord!.timeOut = new Date();

        attendDoc.timeRecords[attendDoc?.timeRecords.length - 1] = currentRecord;

        break;

      default:
        break;
    }

    return attendDoc.save();
  });
};

userSchema.methods.addAbsences = function (
  type: string,
  date: Date | undefined,
  dates: Array<Date>,
  hours: number | undefined,
  reason: string
) {
  const user = this;
  return (
    Absence.find({ _userId: this._id })
      //! find all of Absence that Belongs to userId
      .then((absenceDocs: Array<IAbsence>) => {
        switch (type) {
          case 'dates':
            //! ADD MANY ABSENCES
            const absDocArray: Array<Promise<IAbsence>> = dates.map((date) => {
              let newAbsenceDoc;
              if (absenceDocs.length > 0) {
                const existingDate = absenceDocs.find((abs) => abs.date.toDateString() === date.toDateString());
                console.log('existingDate: ', existingDate);
                if (existingDate) {
                  throw new Error(`${date} is registered`);
                } else {
                  newAbsenceDoc = new Absence({
                    userId: this._id,
                    date: date,
                    hours: 8,
                    reason: reason,
                  });
                  console.log('newAbsenceDoc: ', newAbsenceDoc);
                }
              } else {
                //! create new Absence with date
                console.log('__Debugger__models/user/addAsences new Absence');
                Logging.success('Create a new Absence 2');
                newAbsenceDoc = new Absence({
                  userId: this._id,
                  date: date,
                  hours: 8,
                  reason: reason,
                });
              }
              return newAbsenceDoc?.save();
            });

            return Promise.all(absDocArray)
              .then((absenceDocs) => {
                // const update = { annualLeave: this.annualLeave - absenceDocs.length };
                // console.log('__Debugger__userModels__addAbsences__update: ', update);
                // return User.findByIdAndUpdate(this._id, update)
                //   .then((userDoc) => {
                //     return absenceDocs;
                //   })
                //   .catch((err) => {
                //     console.log(err);
                //   });
                this.annualLeave = this.annualLeave - absenceDocs.length;
                return this.save()
                  .then((userDoc: IUser) => {
                    return absenceDocs;
                  })
                  .catch((err: Error) => {
                    console.log(err);
                  });
              })
              .catch((err) => {
                console.log(err);
              });
            break;

          case 'hours':
            console.log('__Debugger__modelsUser__addAbsences__hours: ', hours);
            break;

          default:
            break;
        }
      })
      .catch((err) => {
        console.log(err);
      })
  );
};

const User = mongoose.model<IUser, UserModel>('User', userSchema);

export default User;
