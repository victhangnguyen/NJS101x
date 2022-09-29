import mongoose from 'mongoose';

export interface ICovidStatus {
  userId: mongoose.Types.ObjectId;
  bodyTemperature: number[];
  vaccination: [
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

export interface CovidStatusModel extends mongoose.Model<ICovidStatus, {}, ICovidStatusMethods> {}

//! <EnforcedDocType = any, M = Model<EnforcedDocType, any, any, any>, TInstanceMethods = {}>
const covidStatusSchema = new mongoose.Schema<ICovidStatus, CovidStatusModel, ICovidStatusMethods>({
  userId: mongoose.Schema.Types.ObjectId,
  bodyTemperature: Array<Number>,
  vaccination: [
    {
      date: Date,
      name: String,
    }
  ],
  positive: [
    {
      date: Date,
    }
  ]
});

const CovidStatus = mongoose.model<ICovidStatus, CovidStatusModel>('CovidStatus', covidStatusSchema);

export default CovidStatus;
