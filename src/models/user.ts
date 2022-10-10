const MAXIMUM_WORKING_HOURS = 8;
import mongoose, { AnyArray } from 'mongoose';
import utils from '../utils';
//! imp models
import Attendance, {
  IAttendance,
  IRecord,
  IAttendanceMethods,
} from './attendance';
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
  addAttendance(
    type: string,
    date: string
  ): Promise<mongoose.HydratedDocument<IAttendance, IAttendanceMethods>>;
  //! setStatus return this (user Instance)
  setStatus(
    type: string,
    workplace: string
  ): Promise<mongoose.HydratedDocument<IUser, IUserMethods>>;
  addCovidStatus(
    type: string,
    temp: number | undefined,
    name: string | undefined,
    date: Date | undefined
  ): Promise<mongoose.HydratedDocument<ICovidStatus, ICovidStatusMethods>>;
  addAbsences(
    type: string,
    dates: Array<Date>,
    hours: number | undefined,
    reason: string
  ): any;
  // Promise<mongoose.HydratedDocument<IAbsence, IAbsenceMethods>>;
  getStatistic(): any;
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

  if (type === 'start') {
    this.status.isWorking = true;
  } else {
    this.status.isWorking = false;
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
          //! create New Body Temperature
          const newBodyTemps = [...covidStatusDoc?.bodyTemperatures!];
          newBodyTemps.push({
            date: new Date(),
            temp: temp!,
          });
          update = { bodyTemperatures: newBodyTemps };
          break;

        case 'vaccination':
          //! create new Vaccine Document
          const newVaccines = [...covidStatusDoc?.vaccines!];
          newVaccines.push({
            name: name!,
            date: date!,
          });
          update = { vaccines: newVaccines };
          break;

        case 'positive':
          //! crate new Positive Document
          const newPositive = [...covidStatusDoc?.positive!];
          newPositive.push({ date: date! });
          update = { positive: newPositive };
          break;

        default:
          update = {};
      }

      return CovidStatus.findOneAndUpdate({ userId: this._id }, update, {
        new: true,
      }) as any;
    })
    .catch((err) => {
      console.log(err);
    });
};

userSchema.methods.addAttendance = function (type: string, date: string) {
  const currentDate = new Date();
  //! initialize the Date to midnight
  // console.log('__Debugger__models_Users__addAttendance__date: ', date);
  return Attendance.findOne({ userId: this._id, date: date }).then(
    (attendDoc: any) => {
      // console.log('__Debugger__model__user__attendDoc: ', attendDoc);
      //! add timeIn to Record
      if (type === 'start') {
        const newRecord: IRecord = {
          timeIn: new Date(),
          timeOut: undefined,
          workplace: this.status.workplace,
        };

        if (!attendDoc) {
          //! create new AttendDoc
          Logging.success('Initialize first Attendance');
          return Attendance.create({
            userId: this._id,
            date: currentDate.toLocaleDateString('vi-VN', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            }),
            timeRecords: [newRecord],
          });
        } else {
          //! if Attendance exist, add new Record into timeRecord
          attendDoc.timeRecords.push(newRecord);
        }
      }
      //! add timeOut to Record
      //! if type === 'end', we update the Record that added timeIn
      else {
        //! find Index of record that inside the timeRecords
        const lastedElementIndex = attendDoc?.timeRecords.length - 1;
        console.log('lastedElementIndex: ', lastedElementIndex);
        const currentRecord = attendDoc.timeRecords[lastedElementIndex];
        console.log('currentRecord: ', currentRecord);

        currentRecord!.timeOut = currentDate;

        attendDoc.timeRecords[lastedElementIndex] = currentRecord;
      }

      return attendDoc.save();
    }
  );
};

userSchema.methods.addAbsences = function (
  type: string,
  dates: Array<Date>,
  hours: number | undefined,
  reason: string
) {
  console.log('__Debugger__models_User__dates: ', dates);
  //! dates: ISO date
  return (
    Absence.find({ _userId: this._id })
      //! find all of Absence that Belongs to userId
      .then((absenceDocs: Array<IAbsence>) => {
        //! Throw Error if clause
        if (hours! > MAXIMUM_WORKING_HOURS) {
          throw new Error('Thời gian tối đa bạn được phép thêm là 8 giờ');
        }
        if (type === 'dates') {
          if (this.annualLeave < dates.length) {
            throw new Error(
              `You have registered ${dates.length} dates over ${this.annualLeave} allowable dates`
            );
          }
        } else {
          if (this.annualLeave === 0) {
            throw new Error(
              `You cannot register this, due to annualLeave is ${this.annualLeave}`
            );
          }
        }
        //! ADD MANY ABSENCES
        const absDocArray = dates.map((date) => {
          const dateStringVN = date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          });
          return Attendance.findOne({ date: dateStringVN }).then(
            (attendanceDoc) => {
              // console.log('__Debugger__models_User__addAbsences__attendanceDoc: ', attendanceDoc);
              const existingAbsenceDoc = absenceDocs.find(
                (absence: IAbsence) => absence.date === dateStringVN
              );
              console.log('existingAbsenceDoc: ', existingAbsenceDoc);
              if (existingAbsenceDoc) {
                if (type === 'dates') {
                  throw new Error(`${date} is registered`);
                } else {
                  let curTimeWorkingAttend = 0;
                  //! guard clause
                  if (attendanceDoc) {
                    curTimeWorkingAttend = utils.round(
                      attendanceDoc?.totalTime! / (1000 * 60 * 60)
                    );
                    console.log('attendanceDoc existing');
                  }
                  console.log(
                    '__Debugger__models_User__curTimeWorkingAttend: ',
                    curTimeWorkingAttend
                  );
                  console.log(
                    '__Debugger__models_User__existingAbsenceDoc.hours: ',
                    existingAbsenceDoc.hours
                  );

                  if (
                    curTimeWorkingAttend + existingAbsenceDoc.hours + hours! <=
                    MAXIMUM_WORKING_HOURS
                  ) {
                    existingAbsenceDoc.hours += hours!;
                    return existingAbsenceDoc.save();
                  } else {
                    throw new Error(
                      `Ngày ${date} bạn đã làm ${curTimeWorkingAttend} giờ và đăng ký nghỉ phép ${
                        existingAbsenceDoc.hours
                      } giờ. Bạn chỉ được thêm tối đa ${utils.round(
                        MAXIMUM_WORKING_HOURS -
                          curTimeWorkingAttend -
                          existingAbsenceDoc.hours
                      )} giờ nữa!`
                    );
                  }
                }
              } else {
                //! crate new Absence if no absence
                return Absence.create({
                  userId: this._id,
                  date: dateStringVN,
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
            }
          );
        });

        return Promise.all(absDocArray)
          .then((absenceDocs) => {
            console.log(
              '__Debugger__models_User__addAbseces__Promise_resolve__absenceDocs: ',
              absenceDocs
            );
            if (type === 'dates') {
              //! if type is dates, every days correspond with 8 hours
              this.annualLeave -= absenceDocs.length;
              return this.save().then((userDoc: IUser) => {
                return absenceDocs;
              });
            } else {
              this.annualLeave = utils.round(
                this.annualLeave - hours! / MAXIMUM_WORKING_HOURS
              );
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

userSchema.methods.getStatistic = function () {
  const statistics: any[] = [];

  return Attendance.find({ userId: this._id })
    .then((attendanceDocs) => {
      attendanceDocs.forEach((attendance) => {
        statistics.push({
          preference: 0,
          type: 'attendance',
          date: attendance.date,
          timeRecords: attendance.timeRecords,
          totalTime: attendance.totalTime,
        });
      });

      return Absence.find({ userId: this._id }).then((absenceDocs) => {
        absenceDocs.forEach((absence) => {
          statistics.push({
            preference: 1,
            type: 'absence',
            date: absence.date,
            hours: absence.hours,
            reason: absence.reason,
          });
        });
        statistics.sort((a, b) => {
          return a.preference - b.preference;
        });

        statistics.sort((a, b) => {
          return new Date(a.date).valueOf() - new Date(b.date).valueOf();
        });

        return statistics;
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

const User = mongoose.model<IUser, UserModel>('User', userSchema);

export default User;
