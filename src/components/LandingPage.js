import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const LandingPage = ({ setSubjects, setGuestUsername }) => {
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  const handleGuestLogin = () => {
    if (!username.trim()) {
      alert("Please enter a username!");
      return;
    }

    localStorage.setItem("guestUsername", username); // Persist the exact username
    setGuestUsername(username); // Update App.js state with the exact username
    setSubjects({}); // Reset subjects for new guest
    navigate("/dashboard");
  };

  return (
    <div className="landing-container">
      <h2>Welcome to Team Nexovate</h2>
      <p>Please enter a username to continue as a guest:</p>
      <input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Enter your username"
        className="input-field"
      />
      <div className="button-container">
        <button onClick={handleGuestLogin} className="btn">
          Continue as Guest
        </button>
      </div>
    </div>
  );
};

export default LandingPage;