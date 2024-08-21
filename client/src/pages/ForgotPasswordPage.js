import {
  Alert,
  Box,
  Button,
  Container,
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
    <Container>
      <Grid container component="main" sx={{ height: "100%", padding: 5 }}>
        <Grid item xs={false} sm={12} md={4} />
        <Grid
          item
          xs={12}
          sm={8}
          md={4}
          component={Paper}
          elevation={0}
          sx={{
            height: "100%",
            backgroundColor: "#f7f7f7",
            overflowY: "auto",
            zIndex: 1,
          }}
        >
          {isResetting && (
            <Box sx={{ width: "100%" }}>
              <LinearProgress color="warning" />
            </Box>
          )}
          <Paper
            variant="elevation"
            elevation={3}
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
              padding: 3,
              backgroundColor: "#fff",
            }}
          >
            <Typography component="h1" variant="h5" textAlign={"center"}>
              Forgot Password?
            </Typography>
            <Typography variant="subtitle2" textAlign={"center"}>
              No worries, we'll send you reset instructions
            </Typography>
            <Box
              component="form"
              sx={{ mt: 1, width: "100%" }}
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
                color="warning"
                sx={{ mt: 3, mb: 2 }}
                disabled={isResetting}
              >
                {isResetting ? "Sending..." : "Send Reset Link"}
              </Button>
              <Typography variant="body2" align="center" sx={{ mt: 2 }}>
                Remembered your password? <Link to="/login">SignIn</Link>
              </Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={false} sm={12} md={4} />
      </Grid>

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
    </Container>
  );
};

export default ForgotPasswordPage;
