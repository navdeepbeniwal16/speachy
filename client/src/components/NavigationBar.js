import { useState, useEffect, Fragment, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Box,
  AppBar,
  Toolbar,
  Button,
  Container,
  Divider,
  IconButton,
  Menu,
  Tooltip,
  MenuItem,
  Drawer,
  Chip,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import Avatar from "@mui/material/Avatar";
import PersonIcon from "@mui/icons-material/Person";
import PaymentsIcon from "@mui/icons-material/Payments";
import Logout from "@mui/icons-material/Logout";
import { deepOrange } from "@mui/material/colors";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import PaymentsService from "../services/payments-service";
import { AppContext } from "../components/AppContext.js";

const logoStyle = {
  width: "100px",
  height: "auto",
  cursor: "pointer",
  marginRight: "16px",
  marginTop: "4px",
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

// Component to display drop down menu including options like 'Profile', 'Payments' & 'Signout' button
const AccountMenu = ({
  user,
  handleProfileClick,
  handlePaymentsClick,
  handleSignoutClick,
  isPaidCustomer,
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  return (
    <Fragment>
      <Box sx={{ display: "flex", alignItems: "center", textAlign: "center" }}>
        <Tooltip title="Account settings">
          <IconButton
            onClick={handleClick}
            size="small"
            sx={{ ml: 2 }}
            aria-controls={open ? "account-menu" : undefined}
            aria-haspopup="true"
            aria-expanded={open ? "true" : undefined}
          >
            <Avatar
              sx={{
                bgcolor: deepOrange[400],
                width: 32,
                height: 32,
                fontSize: "12px",
              }}
            >
              {user && getDisplayNameInitials(user.displayName)}
            </Avatar>
          </IconButton>
        </Tooltip>
      </Box>
      <Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: "visible",
            filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
            mt: 1.5,
            "& .MuiAvatar-root": {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
            "&::before": {
              content: '""',
              display: "block",
              position: "absolute",
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: "background.paper",
              transform: "translateY(-50%) rotate(45deg)",
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <MenuItem onClick={handleProfileClick} sx={{ gap: 1 }}>
          <PersonIcon style={{ color: "gray" }} /> Profile{" "}
          {isPaidCustomer && (
            <Chip size="small" label="Paid" color="warning"></Chip>
          )}
        </MenuItem>
        <MenuItem onClick={handlePaymentsClick} sx={{ gap: 1 }}>
          <PaymentsIcon style={{ color: "gray" }} /> Payments
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleSignoutClick} sx={{ gap: 1 }}>
          <Logout fontSize="small" color="warning" />
          <Button color="warning" size="small" component="a">
            <strong>Sign out</strong>
          </Button>
        </MenuItem>
      </Menu>
    </Fragment>
  );
};

const NavigationBar = () => {
  const auth = getAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const { state, setState } = useContext(AppContext);

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

  const signOut = async () => {
    try {
      await auth.signOut();
      setState((prevState) => ({
        ...prevState,
        isImpromptuSpeakingEnabled: false,
        isInterviewPracticeEnabled: false,
      }));
      console.log("User signed out successfully.");
      navigate("/");
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  const navigateToCustomerPaymentPortal = async () => {
    try {
      const userUID = auth.currentUser.uid; // Fetch current user uid
      const response = await PaymentsService.createCustomerPaymentPortal(
        userUID
      );

      // Redirect to customer-portal url returned by stripe
      const { url } = response.data;
      window.location.href = url;
    } catch (error) {
      console.error("Error navigating to customer payment portal:", error);
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
            </Box>
            {user ? (
              <Box
                sx={{
                  display: { xs: "none", md: "flex" },
                  gap: 0,
                  alignItems: "center",
                }}
              >
                <AccountMenu
                  user={user}
                  handleSignoutClick={signOut}
                  handleProfileClick={() =>
                    console.log("Handle profile is click")
                  }
                  handlePaymentsClick={navigateToCustomerPaymentPortal}
                  isPaidCustomer={
                    state.isImpromptuSpeakingEnabled ||
                    state.isInterviewPracticeEnabled
                  }
                ></AccountMenu>
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
