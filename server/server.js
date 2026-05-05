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
const projectsRoute = require("./routes/projects.js");
const collectionsRoute = require("./routes/collections.js");
const userRoute = require("./routes/user.js");
const impromptuSpeakingRoute = require("./routes/impromptu-speaking.js");
const paymentsRoute = require("./routes/payments.js");
const sessionsRoute = require("./routes/sessions.js");
const streakRoute = require("./routes/streak.js");
const admin = require("firebase-admin");

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

// Global middleware to parse JSON bodies, excluding payments/webhook route
app.use((req, res, next) => {
  if (req.originalUrl === "/payments/webhook") {
    next();
  } else {
    bodyParser.json()(req, res, next);
  }
});

// Middleware to verify user authentication token fetched from firebase
const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Check for the Authorization header and its format
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.log("Authentication token not found");
    return res
      .status(401)
      .json({ message: "Authorization token missing or malformed" });
  }

  const idToken = authHeader.split(" ")[1];

  try {
    // Verify the token using Firebase Admin SDK
    const decodedToken = await admin.auth().verifyIdToken(idToken);

    // Attach decoded token information to the request object
    req.user = decodedToken;
    console.log("Received request for UserId:", req.user.user_id);

    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    console.error("Error verifying Firebase ID token:", error);
    res.status(401).json({ message: "Unauthorized - Invalid token" });
  }
};

app.get("/", (req, res, next) => {
  res.send("Hello there! Speachy server here, alive and kicking!");
});

app.use("/interview", verifyToken, interviewRoute);
app.use("/projects", verifyToken, projectsRoute);
app.use("/collections", verifyToken, collectionsRoute);
app.use("/me", verifyToken, userRoute);
app.use("/streak", verifyToken, streakRoute);
app.use("/sessions", verifyToken, sessionsRoute);
app.use("/impromptu-speaking", verifyToken, impromptuSpeakingRoute);
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
