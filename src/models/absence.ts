import mongoose from 'mongoose';

interface IAbsence {
  userId: mongoose.Types.ObjectId;
  date: Date,
  reason: string,
}
