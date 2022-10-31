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
  username: string; //! asm 2
  password: string; //! asm 2
  role: string; //! asm 2
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
    confirmMonth: [];
  };
  healthStatus: {
    covidStatusId: mongoose.Types.ObjectId;
  };
  manage: {
    userId: mongoose.Types.ObjectId;
    staffs: [];
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
  getStatistic(filterKey?: string): any;
  addConfirmMonth(
    month: number
  ): Promise<mongoose.HydratedDocument<IUser, IUserMethods>>;
  deleteTimeRecord(attendanceId: string, timeRecord: string): any;
}

//! Methods and Override Methods
//! <T, TQueryHelpers = {}, TMethodsAndOverrides = {}, TVirtuals = {}, TSchema = any>
export interface UserModel extends mongoose.Model<IUser, {}, IUserMethods> {}

//! <EnforcedDocType = any, M = Model<EnforcedDocType, any, any, any>, TInstanceMethods = {}>
const userSchema = new mongoose.Schema<IUser, UserModel, IUserMethods>({
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true,
  },
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
    confirmMonth: [],
  },
  healthStatus: {
    covidStatusId: { type: mongoose.Schema.Types.ObjectId, ref: 'CovidStatus' },
  },
  manage: {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    staffs: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
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

userSchema.methods.addAttendance = function (type: string) {
  const currentDate = new Date();
  //! initialize the Date to midnight
  const curDateStringVN = new Date().toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  // console.log('__Debugger__models_Users__addAttendance__date: ', date);
  return Attendance.findOne({ userId: this._id, date: curDateStringVN }).then(
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
            date: curDateStringVN,
            dateAt: new Date(),
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
                  dateAt: new Date(date),
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

userSchema.methods.getStatistic = function (filterKey: string = 'latestMonth') {
  const statistics: any[] = [];

  switch (filterKey) {
    case 'latestMonth':
      //! Get createdAt latest Month
      return Attendance.find({ userId: this._id })
        .sort({ createdAt: -1 })
        .limit(1)
        .then((attendanceDoc) => {
          // console.log(
          //   '__Debugger__models__user__getStatistic__attendanceDoc: ',
          //   attendanceDoc
          // );

          if (attendanceDoc.length < 1) {
            return statistics;
          }

          const createdAt = attendanceDoc[0]?.createdAt;
          // console.log(
          //   '__Debugger__models__user__getStatistic__createdAt: ',
          //   createdAt
          // );
          // if (!createdAt) {
          //   return statistics;
          // }

          let day = createdAt.getUTCDate();
          let month = createdAt.getUTCMonth(); //months from 1-12 (index: 0 - 11)
          let year = createdAt.getUTCFullYear();

          // console.log('__Debugger__models__user__getStatistic__day: ', day);
          // console.log('__Debugger__models__user__getStatistic__month: ', month);
          // console.log('__Debugger__models__user__getStatistic__year: ', year);

          let startDate = new Date(year, month, 1);
          // console.log(
          //   '__Debugger__models__user__getStatistic__startDate: ',
          //   startDate
          // );

          let endDate = new Date(year, month, 32);
          // console.log(
          //   '__Debugger__models__user__getStatistic__endDate: ',
          //   endDate
          // );

          return Attendance.find({
            userId: this._id,
            dateAt: { $gte: startDate, $lt: endDate },
          })
            .then((attendanceDocs) => {
              attendanceDocs.forEach((attendance) => {
                attendance.timeRecords.forEach((record) => {
                  statistics.push({
                    attendanceId: attendance._id,
                    preference: 0,
                    type: 'attendance',
                    lines: 1,
                    date: attendance.date,
                    timeRecord: record,
                  });
                });
              });
              return Absence.find({
                userId: this._id,
                dateAt: { $gte: startDate, $lt: endDate },
              });
            })
            .then((AbsenceDocs) => {
              AbsenceDocs.forEach((absence) => {
                statistics.push({
                  preference: 1,
                  type: 'absence',
                  lines: 2,
                  date: absence.date,
                  hours: absence.hours,
                  reason: absence.reason,
                });
              });

              function compare1(a: any, b: any) {
                if (a.date < b.date) {
                  return -1;
                }
                if (a.date > b.date) {
                  return 1;
                }
                return 0;
              }

              statistics.sort(compare1);

              function compare2(a: any, b: any) {
                a = a.date.split('/').reverse().join('');
                b = b.date.split('/').reverse().join('');
                return a > b ? 1 : a < b ? -1 : 0;
              }

              statistics.sort(compare2);

              // statistics.sort((a, b): any => {
              //   return new Date(b.date).valueOf() > new Date(a.date).valueOf();
              // });

              // console.log(
              //   '__Debugger__models__user__getStatistic__statistic: ',
              //   statistics
              // );

              return statistics;
            })
            .catch((err) => {
              console.log(err);
            });
        });

      break;

    default:
      break;
  }
};

userSchema.methods.deleteTimeRecord = function (
  attendanceId: string,
  timeRecord: string
) {
  const recordTimeIn = new Date(timeRecord).toTimeString();
  // console.log(
  //   '__Debugger__models__user__deleteTimeRecord__recordTimeIn: ',
  //   recordTimeIn
  // );

  return Attendance.findById(attendanceId)
    .then((attendanceDoc: any) => {
      const currentTimeRecords = attendanceDoc?.timeRecords;

      const newTimeRecords = currentTimeRecords?.filter((record: any) => {
        return recordTimeIn !== record.timeIn.toTimeString();
      });

      attendanceDoc.timeRecords = newTimeRecords;
      return attendanceDoc
        .save()
        .then((attendanceDoc: any) => {
          return attendanceDoc;
        })
        .catch((err: Error) => {
          console.log(err);
        });
    })
    .catch((err) => {
      console.log(err);
    });
};

userSchema.methods.addConfirmMonth = function (month: number) {
  // console.log(
  //   '__Debugger__models__user__addConfirmMonth__this.status.confirmMonth: ',
  //   this.status.confirmMonth
  // );

  const existingConfirmMonth = this.status.confirmMonth.find(
    (cmonth: number) => cmonth === month
  );
  console.log(
    '__Debugger__models__user__addConfirmMonth__existingConfirmMonth: ',
    existingConfirmMonth
  );

  if (existingConfirmMonth) {
    //! If exist => delete
    const newConfirmMonth = this.status.confirmMonth.filter(
      (cmonth: number) => cmonth !== month
    );

    console.log(
      '__Debugger__models__user__addConfirmMonth__newConfirmMonth: ',
      newConfirmMonth
    );

    this.status.confirmMonth = newConfirmMonth;
  } else {
    this.status.confirmMonth = this.status.confirmMonth.concat(month);
  }

  return this.save()
    .then((userDoc: any) => {
      return userDoc;
    })
    .catch((err: Error) => {
      console.log(err);
    });
};

const User = mongoose.model<IUser, UserModel>('User', userSchema);

export default User;
