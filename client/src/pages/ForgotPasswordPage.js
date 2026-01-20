import {
  Alert,
  Box,
  Button,
  Container,
  CssBaseline,
  Grid,
  LinearProgress,
  Paper,
  Snackbar,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";

const ForgotPasswordPage = () => {
  const auth = getAuth();

  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState({});
  const [isResetting, setIsResetting] = useState(false);
  const [isResettingError, setIsResettingError] = useState(false);
  const [resetError, setResetError] = useState({});
  const [isSuccess, setIsSuccess] = useState(false);

  const snackbarVertical = "bottom";
  const snackbarHorizontal = "center";

  const validate = () => {
    let tempErrors = {};
    tempErrors.email = /\S+@\S+\.\S+/.test(email) ? "" : "Email is not valid";
    setErrors(tempErrors);
    return Object.values(tempErrors).every((x) => x === "");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (validate()) {
      setIsResetting(true);
      try {
        await sendPasswordResetEmail(auth, email);
        setIsSuccess(true); // Set success state
      } catch (error) {
        console.error(
          "Error occurred during sending password reset email:",
          error
        );
        setResetError(error.message);
        setIsResettingError(true);
      } finally {
        setIsResetting(false);
      }
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #fff8f5 0%, #ffe4db 40%, #fff9f5 100%)",
        position: "relative",
        overflow: "hidden",
        py: { xs: 6, md: 10 },
      }}
    >
      <CssBaseline />
      <Box
        sx={{
          position: "absolute",
          width: 420,
          height: 420,
          top: -160,
          right: -140,
          background: "rgba(250, 115, 91, 0.18)",
          filter: "blur(60px)",
          borderRadius: "50%",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          width: 360,
          height: 360,
          bottom: -140,
          left: -120,
          background: "rgba(255, 180, 130, 0.16)",
          filter: "blur(70px)",
          borderRadius: "50%",
        }}
      />
      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
        <Grid container component="main" justifyContent="center">
          <Grid item xs={12} sm={9} md={5} lg={4}>
            <Paper
              elevation={0}
              sx={{
                borderRadius: 3,
                backgroundColor: "#fff",
                border: "1px solid rgba(252,150,120,0.2)",
                boxShadow: "0 24px 60px rgba(250, 115, 91, 0.18)",
                overflow: "hidden",
              }}
            >
              {isResetting && (
                <Box sx={{ width: "100%" }}>
                  <LinearProgress color="warning" />
                </Box>
              )}
              <Box
                sx={{
                  px: { xs: 3, sm: 4 },
                  py: { xs: 4, sm: 5 },
                }}
              >
                <Typography component="h1" variant="h5" textAlign="center">
                  Forgot your password?
                </Typography>
                <Typography
                  variant="subtitle2"
                  textAlign="center"
                  sx={{ color: "rgba(60,32,25,0.72)", mt: 1 }}
                >
                  No worries, we’ll send you reset instructions.
                </Typography>
                <Box
                  component="form"
                  sx={{ mt: 3, width: "100%" }}
                  noValidate
                  onSubmit={handleSubmit}
                >
                  <TextField
                    variant="outlined"
                    margin="normal"
                    required
                    fullWidth
                    id="email"
                    label="Email Address"
                    name="email"
                    autoComplete="off"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    error={!!errors.email}
                    helperText={errors.email}
                  />

                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    sx={{
                      mt: 3,
                      mb: 2,
                      textTransform: "none",
                      fontWeight: 600,
                      px: 3.5,
                      py: 1.4,
                      borderRadius: 2,
                      backgroundColor: "#FA735B",
                      boxShadow:
                        "0px 12px 24px -12px rgba(250,115,91,0.7), 0px 10px 18px -14px rgba(49,30,20,0.35)",
                      "&:hover": {
                        backgroundColor: "#f8643f",
                        boxShadow:
                          "0px 14px 26px -12px rgba(250,115,91,0.8), 0px 12px 18px -14px rgba(49,30,20,0.35)",
                      },
                    }}
                    disabled={isResetting}
                  >
                    {isResetting ? "Sending..." : "Send reset link"}
                  </Button>
                  <Typography
                    variant="caption"
                    align="center"
                    sx={{ display: "block", color: "rgba(60,32,25,0.64)", mt: 1 }}
                  >
                    Can’t find the email? Check your spam folder.
                  </Typography>
                  <Typography
                    variant="body2"
                    align="center"
                    sx={{ mt: 2, color: "rgba(60,32,25,0.72)" }}
                  >
                    Remembered your password?{" "}
                    <Link to="/login" style={{ color: "#FA735B" }}>
                      Sign in
                    </Link>
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {isSuccess && (
        <Snackbar
          open={isSuccess}
          anchorOrigin={{
            vertical: snackbarVertical,
            horizontal: snackbarHorizontal,
          }}
          autoHideDuration={3000}
          onClose={() => setIsSuccess(false)}
        >
          <Alert severity="success" variant="standard">
            Reset link sent! Check your inbox.
          </Alert>
        </Snackbar>
      )}

      {isResettingError && (
        <Snackbar
          open={isResettingError}
          anchorOrigin={{
            vertical: snackbarVertical,
            horizontal: snackbarHorizontal,
          }}
          autoHideDuration={6000}
          onClose={() => setIsResettingError(false)}
        >
          <Alert severity="error" variant="standard">
            {resetError || "Failed to send reset link. Please try again."}
          </Alert>
        </Snackbar>
      )}
    </Box>
  );
};

export default ForgotPasswordPage;
