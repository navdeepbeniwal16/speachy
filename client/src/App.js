import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Box } from "@mui/material";

import "./App.css";
import HomePage from "./pages/HomePage";
import NavigationBar from "./components/NavigationBar";

function App() {
  return (
    <Router>
      <NavigationBar></NavigationBar>
      {/* <PageWrapper> */}
      <Box component="main" sx={{ flexGrow: 1 }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
        </Routes>
      </Box>
      {/* </PageWrapper> */}

      {/* <Footer /> */}
    </Router>
  );
}

export default App;
