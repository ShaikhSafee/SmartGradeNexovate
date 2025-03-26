import React, { useState } from "react";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebaseConfig";
import { useNavigate } from "react-router-dom";
import "./Auth.css";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const signUp = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    }
  };

  const signIn = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    }
  };

  const guestLogin = () => {
    navigate("/dashboard"); // No auth required for guest
  };

  return (
    <div className="auth-container">
      <h2>Sign In / Sign Up</h2>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={signUp}>Sign Up</button>
      <button onClick={signIn}>Sign In</button>
      <button onClick={guestLogin}>Continue as Guest</button>
      {error && <p>{error}</p>}
    </div>
  );
};

export default Auth;