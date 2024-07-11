import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Box } from "@mui/material";
import "./App.css";
import HomePage from "./pages/HomePage";
import NavigationBar from "./components/NavigationBar";
import InterviewHome from "./pages/InterviewHome";
import PageWrapper from "./components/PageWrapper";
import InterviewQuestions from "./pages/InterviewQuestions";
import InterviewPractice from "./pages/InterviewPractice";

function App() {
  return (
    <Router>
      <NavigationBar></NavigationBar>
      <PageWrapper>
        <Box component="main" sx={{ flexGrow: 1 }}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/interview" element={<InterviewHome />} />
            <Route
              path="/interview/questions"
              element={<InterviewQuestions />}
            />
            <Route
              path="/interview/questions/:questionId"
              element={<InterviewPractice />}
            />
          </Routes>
        </Box>
      </PageWrapper>

      {/* <Footer /> */}
    </Router>
  );
}

export default App;
