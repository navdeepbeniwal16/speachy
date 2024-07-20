// Load environment variables
require("dotenv").config();
require("./configs/sentry-instrument.js");

const Sentry = require("@sentry/node");
const express = require("express");
const app = express();
const path = require("path");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const interviewRoute = require("./routes/interview.js");
const impromptuSpeakingRoute = require("./routes/impromptu-speaking.js");
const paymentsRoute = require("./routes/payments.js");

// Log requests in 'dev' format
app.use(morgan("dev"));

app.use((req, res, next) => {
  if (req.path.endsWith(".json")) {
    res.type("application/json");
  }
  next();
});

// Serve JSON files from the assets directory
app.use(
  "/assets",
  express.static(path.join(__dirname, "../client/build/assets"))
);

// Serve static files from the React app
app.use(express.static(path.join(__dirname, "../client/build")));

app.use(bodyParser.json());

app.get("/", (req, res, next) => {
  res.send("Hello there! Speachy server here, alive and kicking!");
});

app.use("/interview", interviewRoute);
app.use("/impromptu-speaking", impromptuSpeakingRoute);
app.use("/payments", paymentsRoute);

app.get("/debug-sentry", function mainHandler(req, res) {
  throw new Error("My first Sentry testing error!");
});

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/build/index.html"));
});

// The error handler must be registered before any other error middleware and after all controllers
Sentry.setupExpressErrorHandler(app);

// Optional fallthrough error handler
app.use(function onError(err, req, res, next) {
  // The error id is attached to `res.sentry` to be returned
  // and optionally displayed to the user for support.
  res.statusCode = 500;
  res.end(res.sentry + "\n");
});

const IP = "0.0.0.0";
const PORT = process.env.PORT || 3000;
app.listen(PORT, IP, () =>
  console.log(`Speachy server running on port ${PORT}`)
);
