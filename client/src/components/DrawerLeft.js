import { useState, useEffect, useContext } from "react";
import {
  Box,
  Drawer,
  CssBaseline,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Badge,
  IconButton,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import HomeIcon from "@mui/icons-material/Home";
import WorkIcon from "@mui/icons-material/Work";
import MicIcon from "@mui/icons-material/Mic";
import HelpIcon from "@mui/icons-material/Help";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import LogoutIcon from "@mui/icons-material/Logout";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useTheme, useMediaQuery } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { AppContext } from "../components/AppContext";
import PaymentsService from "../services/payments-service";

const drawerWidth = 240;

const logoStyle = {
  width: "180px",
  height: "auto",
  cursor: "pointer",
};

export default function DrawerLeft() {
  const auth = getAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md")); // Detect screen size
  const [user, setUser] = useState(null);
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const { state, setState } = useContext(AppContext);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
    });
    return () => unsubscribe();
  }, []);

  const signOut = async () => {
    try {
      await auth.signOut();
      setState((prevState) => ({
        ...prevState,
        isImpromptuSpeakingEnabled: false,
        isInterviewPracticeEnabled: false,
      }));
      navigate("/");
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  const navigateToCustomerPaymentPortal = async () => {
    try {
      const userUID = auth.currentUser.uid;
      const response = await PaymentsService.createCustomerPaymentPortal(
        userUID
      );
      const { url } = response.data;
      window.location.href = url;
    } catch (error) {
      console.error("Error navigating to customer payment portal:", error);
    }
  };

  const getEnvironmentLabel = () => {
    const env = process.env.REACT_APP_ENV;
    return env === "local"
      ? "Local"
      : env === "development"
      ? "Development"
      : env === "production"
      ? "Early Access"
      : "Unknown";
  };

  const toggleDrawer = (open) => () => {
    setDrawerOpen(open);
  };

  // Don't render the Drawer if the user is not logged in
  if (!user) {
    return null;
  }

  const drawerContent = (
    <Box
      sx={{
        height: "100%", // Ensure the drawer content fills the height
        display: "flex",
        flexDirection: "column", // Stack items vertically
      }}
    >
      {/* Logo Section */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "80px",
          padding: "16px 0",
          mt: 2,
        }}
      >
        <Link to="/">
          <Badge
            color="warning"
            badgeContent={getEnvironmentLabel()}
            anchorOrigin={{ vertical: "top", horizontal: "right" }}
          >
            <img
              src="/assets/Speachy_Logo_Full_SVG.svg"
              style={logoStyle}
              alt="Speachy Logo"
            />
          </Badge>
        </Link>
      </Box>

      {/* Navigation Links */}
      <List>
        <ListItem disablePadding>
          <ListItemButton component={Link} to="/">
            <ListItemIcon>
              <HomeIcon />
            </ListItemIcon>
            <ListItemText primary="Home" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton component={Link} to="/interview">
            <ListItemIcon>
              <WorkIcon />
            </ListItemIcon>
            <ListItemText primary="Interview" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton component={Link} to="/imprompt">
            <ListItemIcon>
              <MicIcon />
            </ListItemIcon>
            <ListItemText primary="Impromptu" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton component={Link} to="/help">
            <ListItemIcon>
              <HelpIcon />
            </ListItemIcon>
            <ListItemText primary="Help" />
          </ListItemButton>
        </ListItem>
      </List>

      {/* Bottom Section */}
      <Box
        sx={{
          mt: "auto", // Push this section to the bottom
          pb: 2, // Optional padding at the bottom
        }}
      >
        <List>
          <ListItem disablePadding>
            <ListItemButton component={Link} to="/profile">
              <ListItemIcon>
                <AccountCircleIcon />
              </ListItemIcon>
              <ListItemText primary={user.displayName} />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton onClick={signOut}>
              <ListItemIcon>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText primary="Sign Out" />
            </ListItemButton>
          </ListItem>
        </List>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />

      {/* Mobile Drawer */}
      {isMobile ? (
        <>
          <IconButton
            onClick={toggleDrawer(true)}
            sx={{ position: "absolute", top: 16, left: 16 }}
          >
            <MenuIcon />
          </IconButton>
          <Drawer
            open={isDrawerOpen}
            onClose={toggleDrawer(false)}
            ModalProps={{ keepMounted: true }} // Improves performance on mobile
          >
            {drawerContent}
          </Drawer>
        </>
      ) : (
        // Permanent Drawer for larger screens
        <Drawer
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              boxSizing: "border-box",
            },
          }}
          variant="permanent"
          anchor="left"
        >
          {drawerContent}
        </Drawer>
      )}
    </Box>
  );
}
