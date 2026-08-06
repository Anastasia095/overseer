import "dotenv/config";
import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import authRouter from "./routes/auth.js";
import driversRouter from "./routes/drivers.js";
import dashboardRouter from "./routes/dashboard.js";
import dispatchersRouter from "./routes/dispatchers.js";
import vehiclesRouter from "./routes/vehicles.js";
import { startStatSnapshotJob } from "./jobs/statSnapshot.js";

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get("/api/v1/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/drivers", driversRouter);
app.use("/api/v1/dashboard", dashboardRouter);
app.use("/api/v1/dispatchers", dispatchersRouter);
app.use("/api/v1/vehicles", vehiclesRouter);

app.use((_req, res) => {
  res.status(404).json({ error: "Not found" });
});

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(port, () => {
  console.log(`Backend running on http://localhost:${port}`);
  startStatSnapshotJob();
});
