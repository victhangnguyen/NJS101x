import mongoose, { Model, Schema, model } from 'mongoose';

export interface ICovidStatus {
  _id?: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  bodyTemperatures: [
    {
      date: Date;
      temp: number;
    }
  ];
  vaccines: [
    {
      date: Date;
      name: string;
    }
  ];
  positive: [
    {
      date: Date;
    }
  ];
}

export interface ICovidStatusMethods {}

interface CovidStatusModel
  extends Model<ICovidStatus, {}, ICovidStatusMethods> {}

const covidStatusSchema = new Schema<
  ICovidStatus,
  CovidStatusModel,
  ICovidStatusMethods
>({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  bodyTemperatures: [
    {
      date: Date,
      temp: Number,
    },
  ],
  vaccines: [
    {
      date: Date,
      name: String,
    },
  ],
  positive: [
    {
      date: Date,
    },
  ],
});

const CovidStatus = model<ICovidStatus, CovidStatusModel>(
  'CovidStatus',
  covidStatusSchema
);

export default CovidStatus;
