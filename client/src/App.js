import { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Box } from "@mui/material";
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
    <Router>
      <NavigationBar />
      <PageWrapper>
        <Box component="main" sx={{ flexGrow: 1 }}>
          <Routes>
            <Route path="/signup" element={<SignUp />} />
            <Route path="/signin" element={<SignIn />} />

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

            {/* Redirect any unknown routes to home */}
            <Route path="*" element={<Navigate to="/signin" />} />
          </Routes>
        </Box>
      </PageWrapper>
    </Router>
  );
}

// Wrappers for protected routes
const HomePageWrapper = requireAuth(HomePage);
const InterviewHomeWrapper = requireAuth(InterviewHome);
const InterviewQuestionsWrapper = requireAuth(InterviewQuestions);
const InterviewPracticeWrapper = requireAuth(InterviewPractice);

export default App;
