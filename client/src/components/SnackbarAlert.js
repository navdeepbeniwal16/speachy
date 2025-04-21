import * as React from "react";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";

const SnackbarAlert = ({ alertType, alertMessage, isOpen, onClose }) => {
  return (
    <Snackbar
      open={isOpen}
      autoHideDuration={4000}
      onClose={onClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
    >
      <Alert severity={alertType} sx={{ width: "100%" }}>
        {/* <AlertTitle>
          {alertType[0].toUpperCase() + alertType.substring(1).toLowerCase()}
        </AlertTitle> */}
        {alertMessage}
      </Alert>
    </Snackbar>
  );
};

export default SnackbarAlert;
