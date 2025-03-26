import React from "react";
import { useNavigate } from "react-router-dom";

const LandingPage = ({ setSubjects }) => {
  const navigate = useNavigate();

  const handleGuestLogin = () => {
    setSubjects({});
    navigate("/dashboard");
  };

  return (
    <div>
      <h2>Welcome to Team Nexovate</h2>
      <button onClick={handleGuestLogin}>Continue as Guest</button>
    </div>
  );
};

export default LandingPage