// src/components/Login.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    // Example static validation (replace with API validation later if needed)
    if (username === "admin" && password === "1234") {
      try {
        // Save login attempt to backend
        await fetch(
          "https://lindsey-antidogmatical-unsumptuously.ngrok-free.app/api/login/save-login",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "ngrok-skip-browser-warning": "true",
            },
            body: JSON.stringify({ username, password }),
          }
        );

        // Store login state
        localStorage.setItem("isLoggedIn", "true");

        // Navigate to home page
        navigate("/home", { replace: true });
      } catch (error) {
        console.error("Error saving login:", error);
        alert("Login failed, try again!");
      }
    } else {
      alert("Invalid credentials!");
    }
  };

  return (
    <div className="login-container">
      <h2 className="login-title">Sign In</h2>
      <form onSubmit={handleLogin} className="login-form">
        <div className="form-row">
          <label htmlFor="username">Username</label>
          <input
            id="username"
            type="text"
            placeholder="Enter Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="login-input"
            required
          />
        </div>
        <div className="form-row">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            placeholder="Enter Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="login-input"
            required
          />
        </div>
        <button type="submit" className="login-btn">
          Login
        </button>
      </form>
    </div>
  );
}
