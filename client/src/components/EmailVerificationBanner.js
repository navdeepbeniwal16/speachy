import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { getAuth, sendEmailVerification } from "firebase/auth";

const EmailVerificationBanner = () => {
  const resendVerificationEmail = () => {
    const auth = getAuth();
    sendEmailVerification(auth.currentUser)
      .then(() => {
        console.log("Email verification request sent...");
      })
      .catch((error) => {
        console.log(error);
      });
  };

  return (
    <Box
      sx={{
        backgroundColor: "#fef3c7",
        color: "#b45309",
        padding: "10px 20px",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        borderBottom: "1px solid #e5e7eb",
      }}
    >
      <Typography variant="body2" sx={{ margin: "5px 0" }}>
        Please verify your email to avoid any interruptions to our services. We
        want to ensure you receive all important updates and notifications.
        <Button color="warning" onClick={resendVerificationEmail}>
          <strong>Resend Verification Email!</strong>
        </Button>
      </Typography>
    </Box>
  );
};

export default EmailVerificationBanner;
