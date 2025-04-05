import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../LandingPage.css";

const LandingPage = ({ setSubjects }) => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");

  const handleContinue = () => {
    if (!username) {
      alert("Please enter a username.");
      return;
    }
    localStorage.setItem("username", username);
    setSubjects({});
    navigate("/dashboard");
  };

  return (
    <div className="page-container">
      <h2>Welcome to Team Nexovate</h2>
      <div>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter your username"
          style={{ margin: "10px", padding: "5px" }}
        />
      </div>
      <button onClick={handleContinue}>Continue</button>
    </div>
  );
};

export default LandingPage;
