import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  passwordHash: string;
  name: string;
  heightCm?: number;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    heightCm: { type: Number, min: 50, max: 300 },
  },
  { timestamps: true }
);

UserSchema.index({ email: 1 });

export const User = mongoose.model<IUser>('User', UserSchema);
