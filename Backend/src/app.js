/** @format */

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

const allowedOrigins = [
  // Production domains (HTTPS)
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:3000",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("CORS not allowed for this origin"));
      }
    },
    // origin: "*",
    credentials: true, // only if you're using cookies
  })
);

app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ extended: true, limit: "100mb" }));
app.use(cookieParser());

// Import routes
import userRouter from "./Routes/user.routes.js";
import fpoRouter from "./Routes/fpo.routes.js";

// Route declarations
app.use("/api/v1/users", userRouter);
app.use("/api/v1/fpos", fpoRouter);

// Health check endpoint
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to Carbon Credit Platform API",
    version: "1.0.0",
    endpoints: {
      users: "/api/v1/users",
      fpos: "/api/v1/fpos"
    }
  });
});

export { app };
