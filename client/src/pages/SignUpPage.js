import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Avatar,
  Button,
  TextField,
  Paper,
  Box,
  Grid,
  Typography,
  Container,
  LinearProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import {
  getAuth,
  createUserWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
} from "firebase/auth";
import { Link } from "react-router-dom";

const SignUp = () => {
  const auth = getAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [isSignUpError, setIsSignUpError] = useState(false);
  const [signUpError, setSignUpError] = useState(true);
  const snackbarVertical = "bottom";
  const snackbarHorizontal = "center";
  const navigate = useNavigate();

  const validate = () => {
    let tempErrors = {};
    tempErrors.name = name ? "" : "Name is required";
    tempErrors.email = /\S+@\S+\.\S+/.test(email) ? "" : "Email is not valid";
    tempErrors.password =
      password.length > 6 ? "" : "Password must be at least 6 characters long";
    setErrors(tempErrors);
    return Object.values(tempErrors).every((x) => x === "");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (validate()) {
      setIsSigningUp(true);
      try {
        // Signup user onto Firebase Authentication
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        const user = userCredential.user;
        console.log("User is Signed Up....");

        // Sending email for verification
        await sendEmailVerification(auth.currentUser);

        // Update user profile
        await updateProfile(auth.currentUser, {
          displayName: name,
        });
        console.log("User profile updated!");
        navigate("/");
      } catch (error) {
        console.error("Error occurred during sign up or profile update:");
        console.log(error);

        handleSignUpError(error);
      } finally {
        setIsSigningUp(false);
      }
    }
  };

  const extractErrorCode = (errorMessage) => {
    const match = errorMessage.match(/\(auth\/([^)]+)\)/);
    return match ? match[1] : null;
  };

  const handleSignUpError = (error) => {
    setIsSignUpError(true);
    const errorCode = error.code ? error.code : extractErrorCode(error.message);
    console.log("Extracted error code:", errorCode);

    switch (errorCode) {
      case "auth/email-already-in-use":
        setSignUpError(
          "The email address is already in use. Please use a different email."
        );
        break;
      case "auth/invalid-email":
        setSignUpError("The email address you entered is not valid.");
        break;
      case "auth/weak-password":
        setSignUpError(
          "The password is too weak. Please choose a stronger password."
        );
        break;
      case "auth/operation-not-allowed":
        setSignUpError(
          "Account creation is currently disabled. Please try again later."
        );
        break;
      default:
        setSignUpError("An unexpected error occurred. Please try again later.");
        break;
    }
  };

  return (
    <Container>
      <Grid container component="main" sx={{ height: "100%", padding: 5 }}>
        <Grid item xs={false} sm={12} md={4} />
        <Grid
          item
          xs={12}
          sm={12}
          md={4}
          component={Paper}
          elevation={0}
          // square
          sx={{
            height: "100%",
            backgroundColor: "#f7f7f7",
            overflowY: "auto",
            zIndex: 1,
          }}
        >
          {isSigningUp && (
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
            <Avatar
              sx={{
                m: 1,
                bgcolor: "black",
              }}
            >
              <LockOutlinedIcon />
            </Avatar>
            <Typography component="h1" variant="h5">
              Sign Up
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
                id="name"
                label="Name"
                name="name"
                autoComplete="off"
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                error={!!errors.name}
                helperText={errors.name}
              />
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
              <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="off"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={!!errors.password}
                helperText={errors.password}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="warning"
                sx={{ mt: 3, mb: 2 }}
              >
                Sign Up
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
                Sign Up with Google
              </Button> */}
              <Typography>
                Already have an account? <Link to="/signin">SignIn</Link>
              </Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={false} sm={12} md={4} />
      </Grid>
      {isSignUpError && (
        <Snackbar
          open={isSignUpError}
          anchorOrigin={{
            vertical: snackbarVertical,
            horizontal: snackbarHorizontal,
          }}
          key={snackbarVertical + snackbarHorizontal}
          autoHideDuration={3000}
          onClose={() => setIsSignUpError(false)}
        >
          <Alert severity="error" variant="standard" sx={{ width: "100%" }}>
            {signUpError}
          </Alert>
        </Snackbar>
      )}
    </Container>
  );
};

export default SignUp;
