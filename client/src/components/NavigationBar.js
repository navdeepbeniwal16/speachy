import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";
import MenuItem from "@mui/material/MenuItem";
import Drawer from "@mui/material/Drawer";
import MenuIcon from "@mui/icons-material/Menu";
import Avatar from "@mui/material/Avatar";
import { deepOrange } from "@mui/material/colors";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const logoStyle = {
  width: "100px",
  height: "auto",
  cursor: "pointer",
  marginRight: "16px",
  marginTop: "4px",
};

const NavigationBar = () => {
  const auth = getAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
    });

    return () => unsubscribe();
  }, []);

  const toggleDrawer = (newOpen) => () => {
    setOpen(newOpen);
  };

  const getDisplayNameInitials = (displayName) => {
    if (!displayName || displayName.length === 0) {
      return "N/A";
    } else {
      const nameSplitted = displayName.split(" ");
      if (nameSplitted.length > 1) {
        return nameSplitted[0][0] + nameSplitted[1][0];
      } else {
        return nameSplitted[0][0];
      }
    }
  };

  const signOut = async () => {
    try {
      await auth.signOut();
      console.log("User signed out successfully.");
      navigate("/");
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  return (
    <div>
      <AppBar
        position="relative"
        width="100%"
        sx={{
          boxShadow: 0,
          bgcolor: "#FAF9F2",
          pt: 5,
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
              <Link to="/">
                <img
                  src="/assets/Speachy_Logo_SVG.svg"
                  style={logoStyle}
                  alt="logo of speachy"
                />
              </Link>

              <Box sx={{ display: { xs: "none", md: "flex" } }}>
                {/* <MenuItem
                  onClick={() => scrollToSection("home")}
                  sx={{ py: "10px", px: "12px" }}
                >
                  <Typography variant="body2" color="grey">
                    <strong>Home</strong>
                  </Typography>
                </MenuItem> */}
              </Box>
            </Box>
            {user ? (
              <Box
                sx={{
                  display: { xs: "none", md: "flex" },
                  gap: 0.5,
                  alignItems: "center",
                }}
              >
                <Button
                  color="warning"
                  size="small"
                  component="a"
                  onClick={signOut}
                >
                  <strong>Sign out</strong>
                </Button>
                <Avatar
                  sx={{
                    bgcolor: deepOrange[400],
                    width: 30,
                    height: 30,
                    fontSize: "12px",
                  }}
                >
                  {user && getDisplayNameInitials(user.displayName)}
                </Avatar>
              </Box>
            ) : (
              <Box
                sx={{
                  display: { xs: "none", md: "flex" },
                  gap: 0.5,
                  alignItems: "center",
                }}
              >
                <Button
                  color="warning"
                  variant="text"
                  size="small"
                  component="a"
                  onClick={() => navigate("/signin")}
                >
                  <strong>Sign in</strong>
                </Button>
                <Button
                  color="warning"
                  variant="contained"
                  size="small"
                  component="a"
                  onClick={() => navigate("/signup")}
                >
                  Sign up
                </Button>
              </Box>
            )}

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
                  <MenuItem onClick={() => navigate("/")}>Home</MenuItem>
                  <Divider />
                  <MenuItem>
                    <Button
                      //   color="violet"
                      variant="contained"
                      component="a"
                      onClick={() => navigate("/signup")}
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
                      onClick={() => navigate("/signin")}
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
