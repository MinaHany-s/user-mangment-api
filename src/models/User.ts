import mongoose, { HydratedDocument, Model, Schema } from "mongoose";

export type UserStatus = "active" | "inactive";

export interface UserFields {
  firstName: string;
  lastName: string;
  email: string;
  age: number;
  phone?: string;
  status: UserStatus;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type UserDocument = HydratedDocument<UserFields>;

const userSchema = new Schema<UserFields>(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    age: { type: Number, required: true, min: 1 },
    phone: { type: String, trim: true },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    avatar: { type: String, trim: true },
  },
  { timestamps: true },
);

export const User: Model<UserFields> =
  mongoose.models.User ?? mongoose.model<UserFields>("User", userSchema);
