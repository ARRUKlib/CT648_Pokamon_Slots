import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login";
import Game from "./components/Game";
import Register from "./components/Register";
import TopUp from './components/TopUp';
import AdminTopUp from './components/AdminTopUp';
import AdminPanel from './components/AdminPanel';

const App: React.FC = () => {
  const [user, setUser] = useState<string | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("username");
    if (storedUser) {
      setUser(storedUser);
    }
  }, []);

  const handleLogin = (username: string) => {
    setUser(username);
    localStorage.setItem("username", username);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("username");
    localStorage.removeItem("userId");
  };

  return (
    <Router>
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/game" /> : <Login onLogin={handleLogin} />} />
        <Route path="/register" element={<Register onLogin={handleLogin} />} />
        <Route 
          path="/game" 
          element={user ? <Game username={user} onLogout={handleLogout} /> : <Navigate to="/login" />} 
        />
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/topup" element={<TopUp />} />
        <Route path="/admin-topup" element={<AdminTopUp />} />
        <Route path="/admin" element={<AdminPanel />} />
      </Routes>
    </Router>
  );
};

export default App;