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
      setIsUserVerified(firebaseUser ? firebaseUser.emailVerified : false);
    });

    return () => unsubscribe();
  }, []);

  if (user === null || isUserVerified === null) {
    return null; // Render nothing while checking authentication state
  }

  return !isUserVerified ? <EmailVerificationBanner /> : null;
};

export default BannerWrapper;
