import mongoose, { Schema, Document, Types } from 'mongoose';
import { ExerciseCategory, MeasurementType } from '../types';

export interface IExercise extends Document {
  name: string;
  category: ExerciseCategory;
  measurementType: MeasurementType;
  isDefault: boolean;
  createdByUserId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ExerciseSchema = new Schema<IExercise>(
  {
    name: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ['push', 'pull', 'legs', 'core', 'cardio', 'mobility', 'skill'],
      required: true,
    },
    measurementType: {
      type: String,
      enum: ['reps', 'duration', 'distance'],
      required: true,
    },
    isDefault: { type: Boolean, default: false },
    createdByUserId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

ExerciseSchema.index({ isDefault: 1 });
ExerciseSchema.index({ createdByUserId: 1 });

export const Exercise = mongoose.model<IExercise>('Exercise', ExerciseSchema);
