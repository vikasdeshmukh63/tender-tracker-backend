import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { appConfig } from "./config/config.js";
import { errorHandler } from "./middleware/errorHandler.js";
import routes from "./routes/index.js";
import { sequelize } from "./models/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(
  cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    credentials: true,
  })
);
app.use(express.json());

// Static files for uploaded attachments
app.use(
  "/uploads",
  express.static(path.join(__dirname, "..", "..", appConfig.uploadDir))
);

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api", routes);

app.use(errorHandler);

const start = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync(); // in real prod, prefer migrations instead of sync()
    app.listen(appConfig.port, () => {
      console.log(`Backend listening on port ${appConfig.port}`);
    });
  } catch (err) {
    console.error("Failed to start server", err);
    process.exit(1);
  }
};

start();

