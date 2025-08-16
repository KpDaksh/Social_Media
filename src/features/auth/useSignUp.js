import { useState } from "react";
import { auth, db } from "../../services/firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

const useSignup = () => {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const signup = async ({ email, password, displayName }) => {
    setError(null);
    setLoading(true);
    try {
      // Create user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      

      // Update display name
      await updateProfile(user, { displayName });

      // Store additional info in Firestore (optional)
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        displayName,
        createdAt: new Date().toISOString(),
      });

      setLoading(false);
      return user;
    } catch (err) {
        console.log(err);
        
      setError(err.message);
      setLoading(false);
      return null;
    }
  };

  return { signup, error, loading };
};

export default useSignup;
