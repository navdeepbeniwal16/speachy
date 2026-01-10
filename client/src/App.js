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
import PaymentSuccess from "./pages/payments/PaymentSuccess";
import PaymentCancel from "./pages/payments/PaymentCancel";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import DrawerLeft from "./components/DrawerLeft";
import FAQPage from "./pages/FAQPage";
import "@fontsource/amaranth";
import UserProfilePage from "./pages/UserProfilePage";
import PracticePage from "./pages/PracticePage";
import ComingSoonPage from "./pages/ComingSoonPage";

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
      sx={{ display: "flex", backgroundColor: "#fff4ef", minHeight: "100vh" }}
    >
      <Router>
        <CssBaseline />
        <DrawerLeft />

        <Box component="main" sx={{ flexGrow: 1, p: 0 }}>
          <PageWrapper>
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
              <Route path="/practice" element={<PracticePageWrapper />} />
              <Route path="/projects" element={<ComingSoonPage />} />
              <Route
                path="/interview/questions"
                element={<InterviewQuestionsWrapper />}
              />
              <Route
                path="/interview/questions/:questionId"
                element={<InterviewPracticeWrapper />}
              />
              <Route path="/faq" element={<FAQPage />} />
              <Route
                path="/imprompt"
                element={<ImpromptSpeakingPracticeWrapper />}
              />
              <Route path="/profile" element={<UserProfilePageWrapper />} />

              {/* Redirect any unknown routes to home */}
              <Route path="*" element={<Navigate to="/signin" />} />
            </Routes>
          </PageWrapper>
        </Box>
      </Router>
    </Box>
  );
}

// Wrappers for protected routes
const HomePageWrapper = requireAuth(HomePage);
const PracticePageWrapper = requireAuth(PracticePage);
const InterviewHomeWrapper = requireAuth(InterviewHome);
const InterviewQuestionsWrapper = requireAuth(InterviewQuestions);
const InterviewPracticeWrapper = requireAuth(InterviewPractice);
const ImpromptSpeakingPracticeWrapper = requireAuth(ImpromptSpeakingPractice);
const PaymentSuccessWrapper = requireAuth(PaymentSuccess);
const PaymentCancelWrapper = requireAuth(PaymentCancel);
const UserProfilePageWrapper = requireAuth(UserProfilePage);

export default App;
