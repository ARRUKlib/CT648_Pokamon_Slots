import React, { useState } from 'react';
import axios from 'axios';
import './Auth.css';

const Register: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // กำหนดค่า URL ของ API จาก environment variable (หากไม่มีจะใช้ localhost เป็นค่าเริ่มต้น)
  const apiURL = process.env.REACT_APP_API_URL || 'http://3.24.50.90:3000/api';

  const handleRegister = async () => {
    if (password === confirmPassword) {
      try {
        await axios.post(`${apiURL}/register-admin`, { username, password });
        alert("Registration successful! Please log in.");
        window.location.href = "/"; // เปลี่ยนเส้นทางไปที่หน้า Login
      } catch (error) {
        console.error("Registration failed:", error);
        alert("Registration failed. Please try again.");
      }
    } else {
      alert("Passwords do not match!");
    }
  };

  return (
    <div className="auth-background">
      <div className="auth-container">
        <h1 className="auth-title">Register Admin</h1>
        <input
          type="text"
          placeholder="Enter username..."
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="auth-input"
        />
        <input
          type="password"
          placeholder="Enter password..."
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="auth-input"
        />
        <input
          type="password"
          placeholder="Confirm password..."
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="auth-input"
        />
        <button onClick={handleRegister} className="auth-button">Register</button>
        <p className="auth-link">Already have an account? <a href="/admin">Login</a></p>
      </div>
    </div>
  );
};

export default Register;
