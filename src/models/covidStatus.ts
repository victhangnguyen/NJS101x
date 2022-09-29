import mongoose, { Model, Schema, model } from 'mongoose';

export interface ICovidStatus {
  userId: mongoose.Types.ObjectId;
  bodyTemperatures: number[];
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

interface ICovidStatusMethods {
}

interface CovidStatusModel extends Model<ICovidStatus, {}, ICovidStatusMethods> {
  initByUserId(userId: string): Promise<mongoose.HydratedDocument<ICovidStatus, ICovidStatusMethods>>;
}

const covidStatusSchema = new Schema<ICovidStatus, CovidStatusModel, ICovidStatusMethods>({
  userId: mongoose.Types.ObjectId,
  bodyTemperatures: [],
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
covidStatusSchema.static('initByUserId', function init(userId: string) {
  return CovidStatus.findOne({ userId: userId })
    .then((covidStatusDoc) => {
      // console.log('__Debugger__initByUserId__covidStatusDoc: ', covidStatusDoc);
      if (!covidStatusDoc) {
        return CovidStatus.create({
          userId: userId,
          bodyTemperatures: Array<number>,
          vaccines: [],
          positive: [],
        });
      }
      return covidStatusDoc;
    })
    .catch((err) => {
      console.log('ERROR: ', err);
    });
});

const CovidStatus = model<ICovidStatus, CovidStatusModel>('CovidStatus', covidStatusSchema);

export default CovidStatus;
