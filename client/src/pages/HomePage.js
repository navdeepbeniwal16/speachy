import React from "react";
import { Typography, Container, Link, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <Container
      maxWidth="md"
      sx={{ marginTop: "-60px", paddingTop: "0px", fontFamily: "Roboto" }}
    >
      {/* <GroupIllustration height="250px"></GroupIllustration> */}
      <Typography variant="h4" gutterBottom sx={{ marginBottom: "40px" }}>
        {" "}
        Welcome to{" "}
        <span color="violet">
          <strong>Speachy</strong>
        </span>
      </Typography>
      <Typography variant="body1" sx={{ marginBottom: "40px" }}>
        {" "}
        Speachy helps you level up your speaking skills for all kinds of
        scenarios. Dive into fun practice sessions, get awesome feedback, and
        gain the confidence to shine in any real life interaction!
      </Typography>

      <Box id="feedback">
        <Typography
          variant="h5"
          sx={{
            // color: "#3B71CA",
            marginBottom: "20px",
          }}
        >
          {" "}
          {/* Adjusted margin */}
          Feedback
        </Typography>
        <Typography variant="body1">
          Got any feedback for us? If so, please contact us at{" "}
          <Link color="inherit" href="navdeepbeniwal16@gmail.com">
            navdeepbeniwal16@gmail.com
          </Link>
        </Typography>
      </Box>
    </Container>
  );
};

export default HomePage;
