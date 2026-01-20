import React from "react";
import { Box, CssBaseline } from "@mui/material";
import { useLocation } from "react-router-dom";

const PageWrapper = ({ children }) => {
  const location = useLocation();
  const authRoutes = ["/signup", "/signin", "/forgot-password"];
  const fullBleedRoutes = [...authRoutes, "/", "/imprompt", "/interview"];
  const isFullBleedRoute = fullBleedRoutes.includes(location.pathname);

  return (
    <>
      <CssBaseline />
      <Box component="main" sx={{ p: isFullBleedRoute ? 0 : 3 }}>
        {children}
      </Box>
    </>
  );
};

export default PageWrapper;
