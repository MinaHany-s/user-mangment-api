import dotenv from "dotenv";
import mongoose from "mongoose";
import { z } from "zod";

dotenv.config();

const environmentSchema = z.object({
  PORT: z.coerce.number().int().positive().default(5000),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  MONGODB_URI: z.string().trim().min(1, "MONGODB_URI is required"),
  CLIENT_ORIGIN: z.string().url("CLIENT_ORIGIN must be a valid URL"),
});

const environment = environmentSchema.safeParse(process.env);

if (!environment.success) {
  const details = environment.error.issues
    .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
    .join("; ");
  throw new Error(`Invalid environment configuration: ${details}`);
}

export const config = environment.data;

export async function connectToDatabase(): Promise<void> {
  await mongoose.connect(config.MONGODB_URI);
  console.log("Connected to MongoDB");
}
