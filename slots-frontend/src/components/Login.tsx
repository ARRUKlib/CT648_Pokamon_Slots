import React, { useState } from 'react';
import axios from 'axios';
import jwt_decode from 'jwt-decode';
import './Auth.css';

interface LoginProps {
  onLogin: (token: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      const response = await axios.post('http://3.24.50.90:3000/api/login', { username, password });
      const token = response.data.token;

      onLogin(token);
      localStorage.setItem('token', token);

      const decodedToken: any = jwt_decode(token);
      console.log('Decoded Token:', decodedToken);

      await axios.post(
        'http://3.24.50.90:3000/api/record-login',
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      window.location.href = '/home';
    } catch (error) {
      console.error('Login Error:', error);
      setError('Login failed. Please check your username and password.');
    }
  };

  return (
    <div className="auth-background">
      <div className="auth-container">
        <h1 className="auth-title">Login Game</h1>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Enter username..."
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="login-input"
          />
          <input
            type="password"
            placeholder="Enter password..."
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="login-input"
          />
          <button type="submit" className="login-button">Login</button>
        </form>
        {/* เพิ่มปุ่ม Register Link */}
        <div className="register-link">
          Don't have an account? <a href="/register">Sign up</a>
        </div>
      </div>
    </div>
  );
};

export default Login;
