import mongoose from 'mongoose';

export interface IAbsence {
  userId: mongoose.Types.ObjectId;
  date: string;
  dateAt: Date;
  hours: number;
  reason: string;
  save(): any;
}

export interface IAbsenceMethods {}

interface AbsenceModel extends mongoose.Model<IAbsence, {}, IAbsenceMethods> {}

const absenceSchema = new mongoose.Schema<
  IAbsence,
  AbsenceModel,
  IAbsenceMethods
>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
    dateAt: {
      type: Date,
      required: true,
    },
    hours: {
      type: Number,
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Absence = mongoose.model<IAbsence, AbsenceModel>(
  'Absence',
  absenceSchema
);

export default Absence;
