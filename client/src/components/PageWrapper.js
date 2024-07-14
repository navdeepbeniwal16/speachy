import React from "react";
import { Box, CssBaseline } from "@mui/material";

const PageWrapper = ({ children }) => {
  return (
    <>
      <CssBaseline />
      <Box component="main" sx={{ p: 3, mt: 8 }}>
        {children}
      </Box>
    </>
  );
};

export default PageWrapper;
