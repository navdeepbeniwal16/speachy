import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Avatar,
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
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { Link } from "react-router-dom";

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

  return (
    <Container>
      <Grid
        container
        component="main"
        sx={{
          height: "100%",
        }}
      >
        <CssBaseline />
        <Grid item xs={false} sm={12} md={3} />
        <Grid
          item
          xs={12}
          sm={12}
          md={6}
          component={Paper}
          elevation={0}
          sx={{
            height: "100%",
            backgroundColor: "#f7f7f7",
            overflowY: "auto",
            zIndex: 1,
          }}
        >
          {isSigningIn && (
            <Box sx={{ width: "100%", height: "0px" }}>
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
              padding: 2,
              backgroundColor: "#fff",
            }}
          >
            <Avatar
              sx={{
                m: 1,
                bgcolor: "#000000",
              }}
            >
              <LockOutlinedIcon />
            </Avatar>
            <Typography component="h1" variant="h6">
              Sign In
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
                autoComplete="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={!!errors.email}
                helperText={errors.email}
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
              <Typography variant="subtitle2" textAlign={"right"}>
                <Link to="/forgot-password" style={{ textDecoration: "none" }}>
                  Forgot Password?
                </Link>
              </Typography>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="warning"
                sx={{ mt: 3, mb: 2, textTransform: "none" }}
              >
                Sign In
              </Button>
              {/* <Typography sx={{ textAlign: "center" }}>or</Typography>
              <Button
                fullWidth
                variant="contained"
                sx={{
                  mt: 1,
                  mb: 1,
                  backgroundColor: "#db4437",
                  color: "white",
                  "&:hover": {
                    backgroundColor: "#c23321",
                  },
                }}
                startIcon={
                  <img
                    src="https://img.icons8.com/color/16/000000/google-logo.png"
                    alt="Google logo"
                  />
                }
                onClick={() => console.log("Google Sign-In Clicked")}
              >
                Sign In with Google
              </Button> */}

              <Typography variant="subtitle2" textAlign={"center"}>
                Don't have an account?{" "}
                <Link to="/signup" style={{ textDecoration: "none" }}>
                  Sign Up
                </Link>
              </Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={false} sm={12} md={3} />
      </Grid>

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
    </Container>
  );
};

export default SignIn;
