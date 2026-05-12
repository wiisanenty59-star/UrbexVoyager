import express from "express";
import cors from "cors";
import session from "express-session";

import routes from "./routes"; // 👈 USE CENTRAL ROUTER ONLY
import { loadUser } from "./lib/auth";

const app = express();

app.use(cors({
  origin: true,
  credentials: true,
}));

app.use(express.json());

app.use(
  session({
    secret: "dev-secret",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(loadUser);

/**
 * 🔥 ONLY ONE MOUNT POINT
 */
app.use("/api", routes);

app.get("/health", (_, res) => {
  res.json({ ok: true });
});

export default app;