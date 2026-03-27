import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IBodyWeightLog extends Document {
  userId: Types.ObjectId;
  recordedAt: Date;
  weightKg: number;
  createdAt: Date;
}

const BodyWeightLogSchema = new Schema<IBodyWeightLog>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    recordedAt: { type: Date, required: true },
    weightKg: { type: Number, required: true, min: 20, max: 500 },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

BodyWeightLogSchema.index({ userId: 1, recordedAt: -1 });

export const BodyWeightLog = mongoose.model<IBodyWeightLog>('BodyWeightLog', BodyWeightLogSchema);
