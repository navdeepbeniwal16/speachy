import * as React from "react";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";

const SnackbarAlert = ({ alertType, alertMessage, isOpen }) => {
  const [state, setState] = React.useState({
    open: isOpen,
    vertical: "bottom",
    horizontal: "center",
  });
  const { vertical, horizontal, open } = state;

  const handleClose = () => {
    setState({ ...state, open: false });
  };

  return (
    <div>
      <Snackbar
        open={open}
        autoHideDuration={6000}
        onClose={handleClose}
        anchorOrigin={{ vertical, horizontal }}
        key={vertical + horizontal}
      >
        <Alert
          onClose={handleClose}
          severity={alertType}
          sx={{ width: "100%" }}
        >
          <AlertTitle>
            {alertType[0].toUpperCase() + alertType.substring(1).toLowerCase()}
          </AlertTitle>
          {alertMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default SnackbarAlert;
