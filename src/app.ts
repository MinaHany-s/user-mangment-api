import cors from "cors";
import express from "express";
import helmet from "helmet";
import { config } from "./config/database";
import { errorHandler } from "./middlewares/errorHandler";
import { notFound } from "./middlewares/notFound";
import userRouter from "./routes/user.routes";

const app = express();

app.use(helmet());
app.use(cors({ origin: config.CLIENT_ORIGIN }));
app.use(express.json());

app.get("/health", (_req, res) => {
  res.status(200).json({ success: true, data: { status: "ok" } });
});
app.use("/api/users", userRouter);
app.use(notFound);
app.use(errorHandler);

export default app;
