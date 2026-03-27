import mongoose, { Schema, Document, Types } from 'mongoose';
import { GoalType, GoalStatus } from '../types';

export interface IGoal extends Document {
  userId: Types.ObjectId;
  exerciseId: Types.ObjectId;
  goalType: GoalType;
  targetValue: number;
  targetSets?: number;
  notes?: string;
  status: GoalStatus;
  createdAt: Date;
  updatedAt: Date;
}

const GoalSchema = new Schema<IGoal>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    exerciseId: { type: Schema.Types.ObjectId, ref: 'Exercise', required: true },
    goalType: {
      type: String,
      enum: ['reps', 'sets', 'weight', 'duration', 'milestone'],
      required: true,
    },
    targetValue: { type: Number, required: true, min: 0 },
    targetSets: { type: Number, min: 1 },
    notes: { type: String, trim: true, maxlength: 500 },
    status: {
      type: String,
      enum: ['active', 'completed', 'archived'],
      default: 'active',
    },
  },
  { timestamps: true }
);

GoalSchema.index({ userId: 1, status: 1 });
GoalSchema.index({ userId: 1, exerciseId: 1 });

export const Goal = mongoose.model<IGoal>('Goal', GoalSchema);
