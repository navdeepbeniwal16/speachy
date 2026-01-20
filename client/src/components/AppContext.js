import React, { createContext, useCallback, useEffect, useState } from "react";
import SnackbarAlert from "./SnackbarAlert";
import { setGlobalApiErrorHandler } from "../services/backendAPIClient";

const AppContext = createContext();

const AppProvider = ({ children }) => {
  const [state, setState] = useState({
    isInterviewPracticeEnabled: false,
    isImpromptuSpeakingEnabled: false,
  });
  const [snackbar, setSnackbar] = useState({
    isOpen: false,
    message: "",
    type: "error",
  });

  const showSnackbar = useCallback((type, message) => {
    setSnackbar({ isOpen: true, message, type });
  }, []);

  const closeSnackbar = useCallback(() => {
    setSnackbar((prev) => ({ ...prev, isOpen: false }));
  }, []);

  useEffect(() => {
    setGlobalApiErrorHandler(({ message }) => {
      if (!message) return;
      showSnackbar("error", message);
    });

    return () => {
      setGlobalApiErrorHandler(null);
    };
  }, [showSnackbar]);

  return (
    <AppContext.Provider value={{ state, setState, showSnackbar }}>
      {children}
      <SnackbarAlert
        alertType={snackbar.type}
        alertMessage={snackbar.message}
        isOpen={snackbar.isOpen}
        onClose={closeSnackbar}
      />
    </AppContext.Provider>
  );
};

export { AppContext, AppProvider };
