import * as React from "react";

import Box from "@mui/material/Box";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import MenuItem from "@mui/material/MenuItem";
import Drawer from "@mui/material/Drawer";
import MenuIcon from "@mui/icons-material/Menu";
import { Link, useNavigate } from "react-router-dom";

const logoStyle = {
  width: "140px",
  height: "auto",
  cursor: "pointer",
  marginRight: "16px",
  marginTop: "4px",
};

const NavigationBar = () => {
  const [open, setOpen] = React.useState(false);
  const navigate = useNavigate();

  const toggleDrawer = (newOpen) => () => {
    setOpen(newOpen);
  };

  const scrollToSection = (sectionId) => {
    const sectionElement = document.getElementById(sectionId);
    const offset = 128;
    if (sectionElement) {
      const targetScroll = sectionElement.offsetTop - offset;
      sectionElement.scrollIntoView({ behavior: "smooth" });
      window.scrollTo({
        top: targetScroll,
        behavior: "smooth",
      });
      setOpen(false);
    }
  };

  return (
    <div>
      <AppBar
        position="fixed"
        width="100%"
        sx={{
          boxShadow: 0,
          bgcolor: "#fff",
          pt: 5,
          mt: -2,
          border: "0.5px solid lightgrey",
        }}
      >
        <Container width="100%">
          <Toolbar
            variant="regular"
            sx={(theme) => ({
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexShrink: 0,
              maxHeight: 40,
            })}
          >
            <Box
              sx={{
                flexGrow: 1,
                display: "flex",
                alignItems: "center",
                ml: "-18px",
                px: 0,
              }}
            >
              {/* <Link to="/">
                <img
                  src="/assets/app_title_logo_bg_removed.png"
                  style={logoStyle}
                  alt="logo of ceenarios"
                />
              </Link> */}

              <Typography variant="h3" color="black">
                <strong>Speachy</strong>
              </Typography>

              <Box sx={{ display: { xs: "none", md: "flex" } }}>
                <MenuItem
                  onClick={() => scrollToSection("home")}
                  sx={{ py: "10px", px: "12px" }}
                >
                  <Typography variant="body2" color="grey">
                    <strong>Home</strong>
                  </Typography>
                </MenuItem>
                <MenuItem
                  onClick={() => scrollToSection("faq")}
                  sx={{ py: "10px", px: "12px" }}
                >
                  <Typography variant="body2" color="grey">
                    <strong>FAQ</strong>
                  </Typography>
                </MenuItem>
                <MenuItem
                  onClick={() => scrollToSection("feedback")}
                  sx={{ py: "10px", px: "12px" }}
                >
                  <Typography variant="body2" color="grey">
                    <strong>Feedback</strong>
                  </Typography>
                </MenuItem>
              </Box>
            </Box>
            <Box
              sx={{
                display: { xs: "none", md: "flex" },
                gap: 0.5,
                alignItems: "center",
              }}
            >
              <Button
                // color="violet"
                variant="text"
                size="small"
                component="a"
                href="#"
              >
                Sign in
              </Button>
              <Button
                // color="violet"
                variant="contained"
                size="small"
                component="a"
                href="#"
              >
                Sign up
              </Button>
            </Box>

            <Box sx={{ display: { sm: "", md: "none" } }}>
              <Button
                variant="text"
                // color="violet"
                aria-label="menu"
                onClick={toggleDrawer(true)}
                sx={{ minWidth: "30px", p: "4px" }}
              >
                <MenuIcon />
              </Button>
              <Drawer anchor="right" open={open} onClose={toggleDrawer(false)}>
                <Box
                  sx={{
                    minWidth: "60dvw",
                    p: 2,
                    backgroundColor: "background.paper",
                    flexGrow: 1,
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "end",
                      flexGrow: 1,
                    }}
                  ></Box>
                  <MenuItem onClick={() => scrollToSection("home")}>
                    Home
                  </MenuItem>
                  <MenuItem onClick={() => scrollToSection("faq")}>
                    FAQ
                  </MenuItem>
                  <MenuItem onClick={() => scrollToSection("feedback")}>
                    Feedback
                  </MenuItem>
                  <Divider />
                  <MenuItem>
                    <Button
                      //   color="violet"
                      variant="contained"
                      component="a"
                      href="#"
                      sx={{ width: "100%" }}
                    >
                      Sign up
                    </Button>
                  </MenuItem>
                  <MenuItem>
                    <Button
                      //   color="violet"
                      variant="outlined"
                      component="a"
                      href="#"
                      sx={{ width: "100%" }}
                    >
                      Sign in
                    </Button>
                  </MenuItem>
                </Box>
              </Drawer>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
    </div>
  );
};

export default NavigationBar;
