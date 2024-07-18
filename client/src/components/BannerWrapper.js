import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import EmailVerificationBanner from "./EmailVerificationBanner";

const BannerWrapper = () => {
  const [isUserVerified, setIsUserVerified] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        setIsUserVerified(firebaseUser.emailVerified);
        // Start polling for email verification status
        const intervalId = setInterval(async () => {
          await firebaseUser.reload();
          setIsUserVerified(firebaseUser.emailVerified);
        }, 5000); // Check every 5 seconds

        return () => clearInterval(intervalId); // Clean up interval on unmount
      } else {
        setIsUserVerified(false);
      }
    });

    return () => unsubscribe();
  }, []);

  if (user === null || isUserVerified === null) {
    return null; // Render nothing while checking authentication state
  }

  return !isUserVerified ? <EmailVerificationBanner /> : null;
};

export default BannerWrapper;
