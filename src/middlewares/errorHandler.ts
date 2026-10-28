import { ErrorRequestHandler } from "express";
import mongoose from "mongoose";
import { ZodError } from "zod";
import { config } from "../config/database";

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (
    error instanceof SyntaxError &&
    "body" in error &&
    "status" in error &&
    error.status === 400
  ) {
    res.status(400).json({
      success: false,
      error: { message: "Request body contains invalid JSON" },
    });
    return;
  }

  if (error instanceof ZodError) {
    res.status(400).json({
      success: false,
      error: {
        message: "Validation failed",
        details: error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      },
    });
    return;
  }

  if (error instanceof mongoose.Error.CastError) {
    res.status(400).json({
      success: false,
      error: { message: "Invalid request value" },
    });
    return;
  }

  if (error instanceof mongoose.Error.ValidationError) {
    res.status(400).json({
      success: false,
      error: {
        message: "Validation failed",
        details: Object.values(error.errors).map((issue) => ({
          field: issue.path,
          message: issue.message,
        })),
      },
    });
    return;
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === 11000
  ) {
    res.status(409).json({
      success: false,
      error: { message: "A user with this email already exists" },
    });
    return;
  }

  const message =
    config.NODE_ENV === "production"
      ? "An unexpected server error occurred"
      : error instanceof Error
        ? error.message
        : "An unexpected server error occurred";

  res.status(500).json({ success: false, error: { message } });
};
