// Load environment variables
require("dotenv").config();

const { initializeApp, cert } = require("firebase-admin/app");

const base64EncodedServiceAccount =
  process.env.FB_DEV_BASE64_ENCODED_SERVICE_ACCOUNT;
const decodedServiceAccount = Buffer.from(
  base64EncodedServiceAccount,
  "base64"
).toString("utf-8");
const serviceAccount = JSON.parse(decodedServiceAccount);

const firebaseAdmin = initializeApp({
  credential: cert(serviceAccount),
});

module.exports = firebaseAdmin;
