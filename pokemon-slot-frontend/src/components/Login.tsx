import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import backgroundImage from "../assets/images/p_11.jpg";
import loadingSound from "../assets/sounds/loadingSound.mp3";

interface LoginProps {
  onLogin: (username: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (username && password) {
      try {
        const response = await axios.post("http://3.24.50.90:3001/api/login", {
          username,
          password
        });
        
        if (response.data.success) {
          localStorage.setItem("userId", response.data.user_id.toString());
          onLogin(username);
          navigate("/game");
          localStorage.setItem("userId",response.data.user_id);
        } else {
          alert(response.data.message || "Invalid username or password");
        }
      } catch (error) {
        console.error("Login error:", error);
        alert("An error occurred during login. Please try again.");
      }
    } else {
      alert("Please enter both username and password");
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        color: "white",
        textAlign: "center",
        padding: "20px",
      }}
    >
      <audio autoPlay loop>
        <source src={loadingSound} type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>

      <h1 style={{ fontSize: "6rem", marginBottom: "20px" }}>Login</h1>
      <input
        type="text"
        placeholder="Enter username..."
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        style={{
          fontSize: "1.5rem",
          padding: "15px",
          margin: "10px 0",
          borderRadius: "5px",
          border: "2px solid #ccc",
          width: "300px",
        }}
      />
      <input
        type="password"
        placeholder="Enter password..."
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{
          fontSize: "1.5rem",
          padding: "15px",
          margin: "10px 0",
          borderRadius: "5px",
          border: "2px solid #ccc",
          width: "300px",
        }}
      />
      <button
        onClick={handleLogin}
        style={{
          fontSize: "1.5rem",
          padding: "10px 20px",
          borderRadius: "5px",
          border: "none",
          backgroundColor: "#4CAF50",
          color: "white",
          cursor: "pointer",
          marginTop: "20px",
        }}
      >
        Login
      </button>
      <button
        onClick={() => navigate("/register")}
        style={{
          fontSize: "1.2rem",
          padding: "10px 20px",
          borderRadius: "5px",
          border: "none",
          backgroundColor: "#007BFF",
          color: "white",
          cursor: "pointer",
          marginTop: "20px",
        }}
      >
        ยังไม่มีบัญชี? ลงทะเบียนที่นี่
      </button>
    </div>
  );
};

export default Login;