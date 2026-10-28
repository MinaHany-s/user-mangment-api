
import app from "./app";
import { config, connectToDatabase } from "./config/database";

async function startServer(): Promise<void> {
  await connectToDatabase();

  app.listen(config.PORT, () => {
    console.log(`User Management API listening on port ${config.PORT}`);
  });
}

startServer().catch((error: unknown) => {
  console.error("Failed to start the server:", error);
  process.exitCode = 1;
});
