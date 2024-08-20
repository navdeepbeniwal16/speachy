// Load environment variables
require("dotenv").config();

const { initializeApp, cert } = require("firebase-admin/app");

// const serviceAccount = require("../firebase-admin-security.json");
const serviceAccount = {
  type: "service_account",
  project_id: process.env.FB_DEV_PROJECT_ID,
  private_key_id: process.env.FB_DEV_PRIVATE_KEY_ID,
  private_key: process.env.FB_DEV_PRIVATE_KEY,
  client_email: process.env.FB_DEV_CLIENT_EMAIL,
  client_id: process.env.FB_DEV_CLIENT_ID,
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: process.env.FB_DEV_CLIENT_X509_CERT_URL,
  universe_domain: "googleapis.com",
};

const firebaseAdmin = initializeApp({
  credential: cert(serviceAccount),
});

module.exports = firebaseAdmin;
