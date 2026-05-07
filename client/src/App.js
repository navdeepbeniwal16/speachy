import { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Box, CssBaseline, CircularProgress } from "@mui/material";
import "./App.css";
import HomePage from "./pages/HomePage";
import LandingPage from "./pages/LandingPage";
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
import ProjectsPage from "./pages/ProjectsPage";
import CollectionsPage from "./pages/CollectionsPage";
import HistoryPage from "./pages/HistoryPage";
import QuestionHistoryPage from "./pages/QuestionHistoryPage";
import QuestionsListPrototype from "./pages/prototype/QuestionsListPrototype";

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
      return (
        <Box
          sx={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#fff4ef",
            minHeight: "100vh",
          }}
        >
          <CircularProgress sx={{ color: "#FA735B" }} size={28} thickness={3} />
        </Box>
      );
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

              {/* Public landing page */}
              <Route path="/" element={<LandingPage />} />

              {/* Protected routes */}
              <Route path="/home" element={<HomePageWrapper />} />
              <Route path="/projects" element={<ProjectsPageWrapper />} />
              <Route path="/interview/collections" element={<CollectionsPageWrapper />} />
              <Route
                path="/interview/questions"
                element={<InterviewQuestionsWrapper />}
              />
              <Route
                path="/interview/questions/:questionId"
                element={<InterviewPracticeWrapper />}
              />
              {/* Prototype routes — no auth */}
              <Route path="/prototype/questions" element={<QuestionsListPrototype />} />

              <Route path="/faq" element={<FAQPage />} />
              <Route
                path="/imprompt"
                element={<ImpromptSpeakingPracticeWrapper />}
              />
              <Route path="/profile" element={<UserProfilePageWrapper />} />
              <Route path="/history" element={<HistoryPageWrapper />} />
              <Route path="/history/question" element={<QuestionHistoryPageWrapper />} />

              {/* Redirect any unknown routes to landing */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </PageWrapper>
        </Box>
      </Router>
    </Box>
  );
}

// Wrappers for protected routes
const HomePageWrapper = requireAuth(HomePage);
const InterviewQuestionsWrapper = requireAuth(InterviewQuestions);
const InterviewPracticeWrapper = requireAuth(InterviewPractice);
const ImpromptSpeakingPracticeWrapper = requireAuth(ImpromptSpeakingPractice);
const PaymentSuccessWrapper = requireAuth(PaymentSuccess);
const PaymentCancelWrapper = requireAuth(PaymentCancel);
const UserProfilePageWrapper = requireAuth(UserProfilePage);
const ProjectsPageWrapper = requireAuth(ProjectsPage);
const CollectionsPageWrapper = requireAuth(CollectionsPage);
const HistoryPageWrapper = requireAuth(HistoryPage);
const QuestionHistoryPageWrapper = requireAuth(QuestionHistoryPage);

export default App;
