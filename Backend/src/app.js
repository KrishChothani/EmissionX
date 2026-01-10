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

import userRouter from "./Routes/user.routes.js";

app.use("/api/v1/users", userRouter);

// locahostt:2590 / api / v1 / users / register;

export { app };
