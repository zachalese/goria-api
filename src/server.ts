/**
 * express.ts
 *
 * api.goria.com
 * by AS3ICS
 *
 * Zach DeGeorge
 * zach@as3ics.com
 *
 * @format
 * @abstract Initializes the express server
 *
 */

import express from "express";

import { PORT, LOGGING_ENABLED, VERSION } from "./config";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(function (req, res, next) {
  if (LOGGING_ENABLED) {
    console.info(Date() + "\t\t" + req.method + " " + req.url);
    if (req.method == "POST" || req.method == "PUT") {
      console.info(req.body);
    }
  }

  return next();
});

app.get("/", function (req, res) {
  var response = {
    status: "OK",
    environment: process.env.NODE_ENV,
    version: VERSION,
    timestamp: new Date().toLocaleString(),
  };

  res.status(200).send(response);
});

// app.init();

export const start = async () => {
  app.listen(PORT, () => {
    console.error(`Server is listening on port ${PORT}`);
  });
};
