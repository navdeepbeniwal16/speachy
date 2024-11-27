import { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Box, CssBaseline } from "@mui/material";
import "./App.css";
import HomePage from "./pages/HomePage";
import NavigationBar from "./components/NavigationBar";
import InterviewHome from "./pages/InterviewHome";
import PageWrapper from "./components/PageWrapper";
import InterviewQuestions from "./pages/InterviewQuestions";
import InterviewPractice from "./pages/InterviewPractice";
import SignUp from "./pages/SignUpPage";
import SignIn from "./pages/SignInPage";
import { auth } from "./services/firebase";
import ImpromptSpeakingPractice from "./pages/ImpromptSpeakingPractice";
import BannerWrapper from "./components/BannerWrapper";
import PaymentSuccess from "./pages/payments/PaymentSuccess";
import PaymentCancel from "./pages/payments/PaymentCancel";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import DrawerLeft from "./components/DrawerLeft";

// Function to check if user is authenticated
const requireAuth = (Component) => {
  return (props) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
        setUser(firebaseUser);
        setLoading(false);
      });

      return () => unsubscribe();
    }, []);

    if (loading) {
      return null; // While checking auth status, return null to avoid rendering
    }

    return user ? <Component {...props} /> : <Navigate to="/signin" />;
  };
};

function App() {
  return (
    <Box
      sx={{ display: "flex", backgroundColor: "#f9f5f4", minHeight: "100vh" }}
    >
      <Router>
        <CssBaseline />
        <BannerWrapper />
        <DrawerLeft />
        {/* <NavigationBar /> */}
        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          <Routes>
            <Route path="/signup" element={<SignUp />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route
              path="/payment-success"
              element={<PaymentSuccessWrapper />}
            />
            <Route
              path="/payment-canceled"
              element={<PaymentCancelWrapper />}
            />

            {/* Protected routes */}
            <Route path="/" element={<HomePageWrapper />} />
            <Route path="/interview" element={<InterviewHomeWrapper />} />
            <Route
              path="/interview/questions"
              element={<InterviewQuestionsWrapper />}
            />
            <Route
              path="/interview/questions/:questionId"
              element={<InterviewPracticeWrapper />}
            />
            <Route
              path="/imprompt"
              element={<ImpromptSpeakingPracticeWrapper />}
            />

            {/* Redirect any unknown routes to home */}
            <Route path="*" element={<Navigate to="/signin" />} />
          </Routes>
        </Box>
      </Router>
    </Box>
  );
}

// Wrappers for protected routes
const HomePageWrapper = requireAuth(HomePage);
const InterviewHomeWrapper = requireAuth(InterviewHome);
const InterviewQuestionsWrapper = requireAuth(InterviewQuestions);
const InterviewPracticeWrapper = requireAuth(InterviewPractice);
const ImpromptSpeakingPracticeWrapper = requireAuth(ImpromptSpeakingPractice);
const PaymentSuccessWrapper = requireAuth(PaymentSuccess);
const PaymentCancelWrapper = requireAuth(PaymentCancel);

export default App;
