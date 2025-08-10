import React from "react";
import { Box, Typography, Paper } from "@mui/material";
import EngineeringIcon from "@mui/icons-material/Engineering";

const ComingSoonPage = () => {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        py: 8,
        px: 3,
        // backgroundColor: "#fff",
      }}
    >
      <Typography
        variant="h4"
        fontWeight="bold"
        align="center"
        gutterBottom
        sx={{
          background: "linear-gradient(90deg, #FA735B 20%, #FF8E53 90%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        Your Projects, Your Way - Coming Soon!
      </Typography>

      <Typography
        variant="body1"
        align="center"
        sx={{
          color: "gray",
          maxWidth: "600px",
          mb: 6,
        }}
      >
        Soon, you’ll be able to create and manage your own practice projects —
        whether it’s for job interviews, impromptu speaking, or upcoming
        real-life scenarios. Personalised. Flexible. Just for you.
      </Typography>

      <Paper
        elevation={0}
        sx={{
          width: "100%",
          maxWidth: "700px",
          mt: 2,
          py: 6,
          px: 4,
          borderRadius: 2,
          backgroundColor: "#fff",
          textAlign: "center",
        }}
      >
        <EngineeringIcon
          sx={{
            fontSize: 60,
          }}
        ></EngineeringIcon>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Projects Under Construction
        </Typography>
        <Typography variant="body2" sx={{ color: "gray", mt: 1 }}>
          We’re working on something powerful. Stay tuned and be the first to
          try it.
        </Typography>
      </Paper>
    </Box>
  );
};

export default ComingSoonPage;
