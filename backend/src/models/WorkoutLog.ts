import mongoose, { Schema, Document, Types } from 'mongoose';
import { WorkoutType, MeasurementType, SetData } from '../types';

export interface IWorkoutExercise {
  exerciseId: Types.ObjectId;
  exerciseNameSnapshot: string;
  measurementType: MeasurementType;
  sets: SetData[];
}

export interface IWorkoutLog extends Document {
  userId: Types.ObjectId;
  workoutDate: Date;
  durationMinutes?: number;
  workoutType: WorkoutType;
  notes?: string;
  perceivedEffort?: number;
  exercises: IWorkoutExercise[];
  createdAt: Date;
  updatedAt: Date;
}

const SetSchema = new Schema<SetData>(
  {
    reps: { type: Number, min: 0 },
    weightKg: { type: Number, min: 0 },
    durationSeconds: { type: Number, min: 0 },
    distanceMeters: { type: Number, min: 0 },
  },
  { _id: false }
);

const WorkoutExerciseSchema = new Schema<IWorkoutExercise>(
  {
    exerciseId: { type: Schema.Types.ObjectId, ref: 'Exercise', required: true },
    exerciseNameSnapshot: { type: String, required: true, trim: true },
    measurementType: {
      type: String,
      enum: ['reps', 'duration', 'distance'],
      required: true,
    },
    sets: { type: [SetSchema], default: [] },
  },
  { _id: false }
);

const WorkoutLogSchema = new Schema<IWorkoutLog>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    workoutDate: { type: Date, required: true },
    durationMinutes: { type: Number, min: 1, max: 600 },
    workoutType: {
      type: String,
      enum: ['push', 'pull', 'legs', 'core', 'full body', 'custom'],
      required: true,
    },
    notes: { type: String, trim: true, maxlength: 1000 },
    perceivedEffort: { type: Number, min: 1, max: 10 },
    exercises: { type: [WorkoutExerciseSchema], default: [] },
  },
  { timestamps: true }
);

WorkoutLogSchema.index({ userId: 1, workoutDate: -1 });
WorkoutLogSchema.index({ userId: 1, 'exercises.exerciseId': 1 });

export const WorkoutLog = mongoose.model<IWorkoutLog>('WorkoutLog', WorkoutLogSchema);
