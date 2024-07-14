// Load environment variables
require("dotenv").config();

const express = require("express");
const app = express();
const path = require("path");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const interviewRoute = require("./routes/interview.js");

// Log requests in 'dev' format
app.use(morgan("common"));

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

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/build/index.html"));
});

const IP = "0.0.0.0";
const PORT = process.env.PORT || 3000;
app.listen(PORT, IP, () =>
  console.log(`Speachy server running on port ${PORT}`)
);
