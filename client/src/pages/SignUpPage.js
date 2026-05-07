import React, { useCallback, useState, memo } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Button,
  TextField,
  Box,
  Typography,
  CssBaseline,
  CircularProgress,
  LinearProgress,
  Snackbar,
  Alert,
  InputAdornment,
  IconButton,
  Checkbox,
  FormControlLabel,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import {
  getAuth,
  createUserWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
} from "firebase/auth";
import { firebaseApp } from "../services/firebase.js";
import { doc, getFirestore, setDoc } from "firebase/firestore";

const DARK_BG = "#1e0d07";
const PAGE_BG = "#fff4ef";
const CORAL = "#FA735B";
const CORAL_INK = "#C85A3E";
const HEADING = "#2f170f";
const BODY = "rgba(60,32,25,0.78)";
const MUTED = "rgba(60,32,25,0.45)";
const SERIF = "Georgia, serif";

const PANEL_MUTED = "rgba(255,200,175,0.50)";
const PANEL_MUTED2 = "rgba(255,200,175,0.70)";
const PANEL_WHITE = "#fff8f5";

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "10px",
    backgroundColor: "#ffffff",
    "& fieldset": { borderColor: "rgba(0,0,0,0.09)" },
    "&:hover fieldset": { borderColor: "rgba(250,115,91,0.40)" },
    "&.Mui-focused fieldset": { borderColor: CORAL, borderWidth: "1.5px" },
  },
  "& .MuiInputLabel-root": { color: MUTED },
  "& .MuiInputLabel-root.Mui-focused": { color: CORAL },
};

const FEATURES = [
  "Questions tailored to your exact role and company",
  "AI scores and coaching after every answer",
  "Track your progress across every session",
];

const TERMS_LAST_UPDATED = "January 2025";

const TermsDialog = memo(function TermsDialog({ open, onClose }) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: { borderRadius: "16px", maxHeight: "80vh" } }}
    >
      <DialogTitle
        sx={{
          fontFamily: SERIF,
          fontWeight: 700,
          fontSize: 20,
          color: HEADING,
          borderBottom: "1px solid rgba(0,0,0,0.07)",
          pb: 2,
        }}
      >
        Terms and Conditions
      </DialogTitle>
      <DialogContent sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, mb: 2 }}>
          Welcome to Speachy
        </Typography>
        <Typography paragraph>
          These Terms and Conditions govern your use of the Speachy application.
          By creating an account or using our service, you agree to be bound by
          these Terms.
        </Typography>
        {[
          [
            "1. Acceptance of Terms",
            "By creating an account you acknowledge that you have read, understood, and agree to be bound by these Terms.",
          ],
          [
            "2. User Accounts",
            "You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.",
          ],
          [
            "3. Acceptable Use",
            "You agree to use Speachy only for lawful purposes. You may not use the service to transmit harmful, offensive, or inappropriate content.",
          ],
          [
            "4. Privacy",
            "Your privacy is important to us. We collect only the information necessary to provide the service and will not share it with third parties without your consent.",
          ],
          [
            "5. Intellectual Property",
            "The Speachy service and its content are owned by Speachy and protected by applicable intellectual property laws.",
          ],
          [
            "6. Limitation of Liability",
            "Speachy shall not be liable for any indirect, incidental, or consequential damages arising from your use of the service.",
          ],
          [
            "7. Termination",
            "We may terminate or suspend your account without prior notice for any breach of these Terms.",
          ],
          [
            "8. Changes to Terms",
            "We reserve the right to modify these Terms at any time. Material changes will be communicated at least 30 days in advance.",
          ],
        ].map(([title, body]) => (
          <Box key={title} mt={3}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.75 }}>
              {title}
            </Typography>
            <Typography variant="body2" sx={{ color: BODY, lineHeight: 1.7 }}>
              {body}
            </Typography>
          </Box>
        ))}
        <Typography
          variant="body2"
          sx={{ mt: 4, fontStyle: "italic", color: MUTED }}
        >
          Last updated: {TERMS_LAST_UPDATED}
        </Typography>
      </DialogContent>
      <DialogActions sx={{ p: 2.5, borderTop: "1px solid rgba(0,0,0,0.07)" }}>
        <Button
          onClick={onClose}
          variant="contained"
          sx={{
            backgroundColor: CORAL,
            color: "#fff",
            fontWeight: 600,
            textTransform: "none",
            borderRadius: "50px",
            px: 3,
            py: 0.9,
            boxShadow: "none",
            "&:hover": { backgroundColor: CORAL_INK, boxShadow: "none" },
          }}
        >
          I understand
        </Button>
      </DialogActions>
    </Dialog>
  );
});

const SignUp = () => {
  const auth = getAuth();
  const db = getFirestore(firebaseApp);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [snackError, setSnackError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [termsDialogOpen, setTermsDialogOpen] = useState(false);
  const navigate = useNavigate();

  const openTerms = useCallback(() => setTermsDialogOpen(true), []);
  const closeTerms = useCallback(() => setTermsDialogOpen(false), []);

  const validate = () => {
    const e = {
      name: name ? "" : "Name is required",
      email: /\S+@\S+\.\S+/.test(email) ? "" : "Enter a valid email address",
      password:
        password.length > 6 ? "" : "Password must be at least 6 characters",
      terms: acceptedTerms ? "" : "You must accept the Terms and Conditions",
    };
    setErrors(e);
    return Object.values(e).every((v) => v === "");
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setIsSigningUp(true);
    try {
      const { user } = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      await sendEmailVerification(auth.currentUser);
      await updateProfile(auth.currentUser, { displayName: name });
      await setDoc(doc(db, "subscriptions", user.uid), {
        email: user.email,
        userUID: user.uid,
      });
      navigate("/home");
    } catch (err) {
      const code =
        err.code || (err.message.match(/\(auth\/([^)]+)\)/) || [])[1];
      const map = {
        "auth/email-already-in-use":
          "An account with this email already exists.",
        "auth/invalid-email": "That email address doesn't look right.",
        "auth/weak-password":
          "Choose a stronger password (at least 6 characters).",
        "auth/operation-not-allowed": "Account creation is currently disabled.",
      };
      setSnackError(map[code] || "Something went wrong. Please try again.");
    } finally {
      setIsSigningUp(false);
    }
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <CssBaseline />

      {/* Full-screen overlay during account creation — prevents sidebar flash from
          onAuthStateChanged firing before navigate("/home") is called */}
      {isSigningUp && (
        <Box
          sx={{
            position: "fixed",
            inset: 0,
            backgroundColor: "#1e0d07",
            zIndex: 9999,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 2,
          }}
        >
          <CircularProgress sx={{ color: "#FA735B" }} size={32} thickness={3} />
          <Typography sx={{ fontSize: 14, color: "rgba(255,200,175,0.60)", mt: 0.5 }}>
            Setting up your account...
          </Typography>
        </Box>
      )}

      {/* ── Left panel ───────────────────────────────────────────────────────── */}
      <Box
        sx={{
          display: { xs: "none", md: "flex" },
          flexDirection: "column",
          width: "44%",
          minHeight: "100vh",
          backgroundColor: DARK_BG,
          position: "relative",
          overflow: "hidden",
          p: { md: 5, lg: 6 },
        }}
      >
        {/* Ghost text */}
        <Typography
          aria-hidden="true"
          sx={{
            position: "absolute",
            bottom: "-4%",
            left: "50%",
            transform: "translateX(-50%)",
            fontSize: "20vw",
            fontFamily: SERIF,
            fontWeight: 800,
            color: "transparent",
            WebkitTextStroke: "1.5px rgba(255,220,200,0.07)",
            userSelect: "none",
            pointerEvents: "none",
            whiteSpace: "nowrap",
            letterSpacing: "0.04em",
            lineHeight: 1,
          }}
        >
          SPEACHY
        </Typography>

        {/* Logo */}
        <Box sx={{ position: "relative", zIndex: 1, mb: "auto" }}>
          <Link to="/">
            <img
              src="/assets/Speachy_Logo_Full_SVG.svg"
              alt="Speachy"
              style={{
                height: 36,
                width: "auto",
                filter: "brightness(0) invert(1)",
                opacity: 0.9,
              }}
            />
          </Link>
        </Box>

        {/* Centre copy */}
        <Box
          sx={{
            position: "relative",
            zIndex: 1,
            mt: "auto",
            mb: "auto",
            py: 6,
          }}
        >
          {/* Label */}
          <Stack direction="row" spacing={1} alignItems="center" mb={3}>
            <Box
              sx={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                backgroundColor: CORAL,
                flexShrink: 0,
              }}
            />
            <Typography
              sx={{
                fontSize: 11,
                fontWeight: 700,
                color: CORAL,
                textTransform: "uppercase",
                letterSpacing: 1.2,
              }}
            >
              AI Interview Preparation
            </Typography>
          </Stack>

          <Typography
            sx={{
              fontFamily: SERIF,
              fontWeight: 800,
              fontSize: { md: 32, lg: 38 },
              color: PANEL_WHITE,
              lineHeight: 1.1,
              mb: 2,
              letterSpacing: "-0.5px",
            }}
          >
            Master your{" "}
            <Box component="span" sx={{ color: CORAL }}>
              Narrative
            </Box>
            {", "}
            <br />
            bring your best self.
          </Typography>

          <Typography
            sx={{
              fontSize: 15,
              color: PANEL_MUTED,
              lineHeight: 1.75,
              mb: 4.5,
              maxWidth: 300,
            }}
          >
            Practice interviews with AI — get scored, get feedback, and get
            better.
          </Typography>

          {/* Feature list */}
          <Stack spacing={2}>
            {FEATURES.map((item) => (
              <Stack
                key={item}
                direction="row"
                spacing={1.5}
                alignItems="flex-start"
              >
                <Box
                  sx={{
                    width: 18,
                    height: 18,
                    borderRadius: "50%",
                    backgroundColor: "rgba(250,115,91,0.18)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mt: 0.15,
                    flexShrink: 0,
                  }}
                >
                  <Box
                    sx={{
                      width: 5,
                      height: 5,
                      borderRadius: "50%",
                      backgroundColor: CORAL,
                    }}
                  />
                </Box>
                <Typography
                  sx={{ fontSize: 14, color: PANEL_MUTED2, lineHeight: 1.55 }}
                >
                  {item}
                </Typography>
              </Stack>
            ))}
          </Stack>
        </Box>

        {/* Bottom */}
        <Box
          sx={{
            position: "relative",
            zIndex: 1,
            borderTop: "1px solid rgba(255,255,255,0.07)",
            pt: 3,
          }}
        >
          <Typography
            sx={{
              fontSize: 12,
              color: "rgba(255,200,175,0.28)",
              fontStyle: "italic",
            }}
          >
            Built with care, shipped with intention.
          </Typography>
        </Box>
      </Box>

      {/* ── Right panel ──────────────────────────────────────────────────────── */}
      <Box
        sx={{
          flex: 1,
          backgroundColor: PAGE_BG,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          px: { xs: 3, sm: 5 },
          py: 6,
          position: "relative",
        }}
      >
        {isSigningUp && (
          <LinearProgress
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: 3,
              backgroundColor: "rgba(250,115,91,0.10)",
              "& .MuiLinearProgress-bar": { backgroundColor: CORAL },
            }}
          />
        )}

        <Box sx={{ width: "100%", maxWidth: 380 }}>
          {/* Mobile logo */}
          <Box
            sx={{
              display: { xs: "block", md: "none" },
              mb: 5,
              textAlign: "center",
            }}
          >
            <Link to="/">
              <img
                src="/assets/Speachy_Logo_Full_SVG.svg"
                alt="Speachy"
                style={{ height: 30, width: "auto" }}
              />
            </Link>
          </Box>

          <Typography
            sx={{
              fontFamily: SERIF,
              fontWeight: 800,
              fontSize: 30,
              color: HEADING,
              letterSpacing: "-0.4px",
              mb: 0.75,
            }}
          >
            Create your free account
          </Typography>
          <Typography
            sx={{ fontSize: 15, color: MUTED, mb: 4, lineHeight: 1.6 }}
          >
            Start practising for your next interview.
          </Typography>

          <Box component="form" noValidate onSubmit={handleSubmit}>
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              label="Full name"
              name="name"
              autoComplete="off"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={!!errors.name}
              helperText={errors.name}
              sx={fieldSx}
            />
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              label="Email"
              name="email"
              autoComplete="off"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={!!errors.email}
              helperText={errors.email}
              sx={fieldSx}
            />
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              label="Password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={!!errors.password}
              helperText={errors.password}
              sx={fieldSx}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword((p) => !p)}
                      edge="end"
                      size="small"
                      aria-label="toggle password visibility"
                    >
                      {showPassword ? (
                        <VisibilityOffIcon fontSize="small" />
                      ) : (
                        <VisibilityIcon fontSize="small" />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  sx={{
                    color: "rgba(0,0,0,0.25)",
                    "&.Mui-checked": { color: CORAL },
                    pt: 0.5,
                  }}
                />
              }
              label={
                <Typography sx={{ fontSize: 13.5, color: BODY }}>
                  I agree to the{" "}
                  <Box
                    component="span"
                    onClick={openTerms}
                    sx={{
                      color: CORAL,
                      cursor: "pointer",
                      fontWeight: 600,
                      "&:hover": { textDecoration: "underline" },
                    }}
                  >
                    Terms and Conditions
                  </Box>
                </Typography>
              }
              sx={{ mt: 1.5, mb: 0.25, alignItems: "center" }}
            />
            {errors.terms && (
              <Typography
                sx={{ fontSize: 12, color: "error.main", ml: 0.5, mb: 0.5 }}
              >
                {errors.terms}
              </Typography>
            )}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{
                backgroundColor: CORAL,
                color: "#fff",
                fontWeight: 600,
                fontSize: 15,
                textTransform: "none",
                borderRadius: "50px",
                py: 1.5,
                mt: 2.5,
                mb: 2.5,
                boxShadow: "none",
                "&:hover": { backgroundColor: CORAL_INK, boxShadow: "none" },
              }}
            >
              Create account
            </Button>

            <Typography sx={{ fontSize: 14, textAlign: "center", color: BODY }}>
              Already have an account?{" "}
              <Link
                to="/signin"
                style={{
                  color: CORAL,
                  textDecoration: "none",
                  fontWeight: 600,
                }}
              >
                Sign in
              </Link>
            </Typography>
          </Box>
        </Box>
      </Box>

      <Snackbar
        open={!!snackError}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        autoHideDuration={4000}
        onClose={() => setSnackError("")}
      >
        <Alert severity="error" sx={{ width: "100%" }}>
          {snackError}
        </Alert>
      </Snackbar>

      <TermsDialog open={termsDialogOpen} onClose={closeTerms} />
    </Box>
  );
};

export default SignUp;
