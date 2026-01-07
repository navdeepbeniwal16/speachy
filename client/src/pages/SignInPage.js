import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  CssBaseline,
  TextField,
  Paper,
  Box,
  Grid,
  Typography,
  LinearProgress,
  Snackbar,
  Alert,
  Container,
  InputAdornment,
  IconButton,
  Badge,
  Stack,
  Chip,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { Link } from "react-router-dom";

const logoStyle = {
  width: "100%",
  height: "auto",
  cursor: "pointer",
};

const SignIn = () => {
  const auth = getAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isSignInError, setIsSignInError] = useState(false);
  const [signInError, setSignInError] = useState(true);
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const snackbarVertical = "bottom";
  const snackbarHorizontal = "center";

  const validate = () => {
    let tempErrors = {};
    tempErrors.email = /\S+@\S+\.\S+/.test(email) ? "" : "Email is not valid";
    tempErrors.password =
      password.length > 6 ? "" : "Password must be at least 6 characters long";
    setErrors(tempErrors);
    return Object.values(tempErrors).every((x) => x === "");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (validate()) {
      setIsSigningIn(true);

      try {
        const userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );
        const user = userCredential.user;

        console.log("User is Signed In....", user.displayName);
        navigate("/");
      } catch (error) {
        console.log("Error occurred when signing in user on Firebase:");
        console.log(error);

        handleSignInError(error);
      } finally {
        setIsSigningIn(false);
      }
    }
  };

  const extractErrorCode = (errorMessage) => {
    const match = errorMessage.match(/\(auth\/([^)]+)\)/);
    return match ? match[1] : null;
  };

  const handleSignInError = (error) => {
    setIsSignInError(true);
    const errorCode = error.code ? error.code : extractErrorCode(error.message);
    console.log("Extracted error code:", errorCode);

    switch (errorCode) {
      case "auth/invalid-email":
        setSignInError("The email address you entered is not valid.");
        break;
      case "auth/user-disabled":
        setSignInError(
          "This user account has been disabled. Please contact support for assistance."
        );
        break;
      case "auth/user-not-found":
        setSignInError(
          "No user found with this email address. Please check and try again or sign up for a new account."
        );
        break;
      case "auth/wrong-password":
        setSignInError(
          "The password you entered is incorrect. Please double-check your password."
        );
        break;
      case "auth/invalid-credential":
        setSignInError(
          "Oops! We couldn’t sign you in. Please check your email and password."
        );
        break;
      default:
        setSignInError("An unexpected error occurred. Please try again later.");
        break;
    }
  };

  const getEnvironmentLabel = () => {
    const env = process.env.REACT_APP_ENV;
    return env === "local"
      ? "Local"
      : env === "development"
      ? "Development"
      : env === "production"
      ? "Early Access"
      : "Unknown";
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background:
          "linear-gradient(120deg, #fff9f5 0%, #ffe6db 45%, #fff4ef 100%)",
        position: "relative",
        overflow: "hidden",
        py: { xs: 6, md: 10 },
      }}
    >
      <CssBaseline />
      <Box
        sx={{
          position: "absolute",
          width: 380,
          height: 380,
          top: -140,
          left: -120,
          background: "rgba(255, 180, 130, 0.12)",
          filter: "blur(70px)",
          borderRadius: "50%",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          width: 300,
          height: 300,
          bottom: -110,
          right: -100,
          background: "rgba(250, 115, 91, 0.16)",
          filter: "blur(60px)",
          borderRadius: "50%",
        }}
      />
      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
        <Grid
          container
          spacing={{ xs: 6, md: 6 }}
          alignItems="center"
          justifyContent="space-between"
        >
          <Grid item xs={12} md={6}>
            <Chip
              label="Welcome back"
              color="warning"
              sx={{
                background:
                  "linear-gradient(90deg, rgba(255,142,83,0.9) 0%, rgba(250,115,91,0.9) 100%)",
                color: "#fff",
                fontWeight: 600,
                mb: 3,
              }}
            />
            <Typography
              variant="h3"
              sx={{
                fontWeight: 700,
                color: "#2d1b16",
                lineHeight: 1.15,
                mb: 2,
              }}
            >
              Keep your momentum, grow your confidence.
            </Typography>
            <Typography
              variant="h6"
              sx={{ color: "rgba(55, 34, 26, 0.7)", fontWeight: 400, mb: 3 }}
            >
              Hop back in to build on yesterday's reps, keep the streak alive,
              and strengthen your voice one session at a time.
            </Typography>
            <Paper
              elevation={0}
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 2,
                px: 3,
                py: 2.5,
                borderRadius: 3,
                backgroundColor: "#fff",
                boxShadow:
                  "0px 20px 45px -28px rgba(250, 115, 91, 0.5), 0px 18px 40px -24px rgba(49, 30, 20, 0.18)",
              }}
            >
              <Stack spacing={0.5}>
                <Typography
                  variant="subtitle2"
                  sx={{ color: "#8c5f53", fontWeight: 600 }}
                >
                  Keep steady
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: "rgba(55, 34, 26, 0.7)" }}
                >
                  "Success is the sum of small efforts, repeated day in and day
                  out."
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: "rgba(55, 34, 26, 0.6)", fontWeight: 600 }}
                >
                  — Robert Collier
                </Typography>
              </Stack>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper
              elevation={0}
              sx={{
                backdropFilter: "blur(18px)",
                backgroundColor: "rgba(255, 255, 255, 0.92)",
                borderRadius: 4,
                px: { xs: 3, sm: 4 },
                py: { xs: 4, sm: 5 },
                boxShadow:
                  "0px 24px 60px -32px rgba(250, 115, 91, 0.55), 0px 28px 70px -40px rgba(49, 30, 20, 0.25)",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {isSigningIn && (
                <LinearProgress
                  sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: 5,
                    backgroundColor: "rgba(255, 255, 255, 0.3)",
                    "& .MuiLinearProgress-bar": {
                      background:
                        "linear-gradient(90deg, rgba(255,142,83,0.95) 0%, rgba(250,115,91,0.95) 100%)",
                    },
                  }}
                />
              )}
              <Box
                sx={{
                  alignItems: "center",
                  display: "flex",
                  justifyContent: "center",
                  mb: 3,
                }}
              >
                <Link to="/">
                  <Badge
                    color="warning"
                    badgeContent={getEnvironmentLabel()}
                    anchorOrigin={{ vertical: "top", horizontal: "right" }}
                  >
                    <img
                      src="/assets/Speachy_Logo_Full_SVG.svg"
                      style={logoStyle}
                      alt="Speachy Logo"
                    />
                  </Badge>
                </Link>
              </Box>
              <Box sx={{ textAlign: "center", mb: 3 }}>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 700,
                    color: "#2d1b16",
                    mb: 1,
                  }}
                >
                  Sign back into Speachy
                </Typography>
                <Typography
                  variant="body1"
                  sx={{ color: "rgba(55, 34, 26, 0.7)" }}
                >
                  Continue building stronger communication skills with AI-guided
                  feedback.
                </Typography>
              </Box>

              <Box
                component="form"
                sx={{ mt: 1 }}
                noValidate
                onSubmit={handleSubmit}
              >
                <TextField
                  variant="outlined"
                  margin="normal"
                  required
                  fullWidth
                  id="email"
                  label="Email"
                  name="email"
                  autoComplete="email"
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={!!errors.email}
                  helperText={errors.email}
                  InputProps={{
                    sx: { borderRadius: 2 },
                  }}
                />
                <TextField
                  variant="outlined"
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  id="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  error={!!errors.password}
                  helperText={errors.password}
                  InputProps={{
                    sx: { borderRadius: 2 },
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={handleClickShowPassword}
                          edge="end"
                        >
                          {showPassword ? (
                            <VisibilityOffIcon />
                          ) : (
                            <VisibilityIcon />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mt: 1,
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{ color: "#8c5f53" }}
                  ></Typography>
                  <Link
                    to="/forgot-password"
                    style={{
                      textDecoration: "none",
                      color: "rgba(228, 71, 36, 0.94)",
                      fontWeight: 500,
                    }}
                  >
                    Forgot Password?
                  </Link>
                </Box>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  color="warning"
                  sx={{
                    color: "#fff",
                    fontWeight: "bold",
                    px: 4,
                    py: 1.8,
                    borderRadius: 3,
                    mt: 3,
                    mb: 3,
                    textTransform: "none",
                    fontSize: "1rem",
                    background:
                      "linear-gradient(90deg, #FF8E53 0%, #FA735B 100%)",
                    boxShadow:
                      "0px 12px 24px -12px rgba(250, 115, 91, 0.7), 0px 10px 18px -14px rgba(49, 30, 20, 0.35)",
                    "&:hover": {
                      filter: "brightness(0.95)",
                    },
                  }}
                >
                  <strong>Sign In</strong>
                </Button>
                <Typography variant="subtitle2" textAlign={"center"}>
                  New here?{" "}
                  <Link
                    to="/signup"
                    style={{
                      textDecoration: "none",
                      color: "rgba(228, 71, 36, 0.94)",
                    }}
                  >
                    Create an account
                  </Link>
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {isSignInError && (
        <Snackbar
          open={isSignInError}
          anchorOrigin={{
            vertical: snackbarVertical,
            horizontal: snackbarHorizontal,
          }}
          key={snackbarVertical + snackbarHorizontal}
          autoHideDuration={3000}
          onClose={() => setIsSignInError(false)}
        >
          <Alert severity="error" variant="standard" sx={{ width: "100%" }}>
            {signInError}
          </Alert>
        </Snackbar>
      )}
    </Box>
  );
};

export default SignIn;
