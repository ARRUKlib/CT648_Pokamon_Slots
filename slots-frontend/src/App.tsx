import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import jwt_decode from 'jwt-decode';
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import Game from './components/Game';
import Admin from './components/Admin';
import About from './components/About';
import Navbar from './components/Navbar';
import LoginAdmin from './components/LoginAdmin';
import RegisterAdmin from './components/RegisterAdmin';
import User from './components/User';
import Doc from './components/Doc';
import Footer from './components/Footer';
import GameSet from './components/GameSet';
import Rules from './components/Rules';

// โครงสร้างของ Token ที่จะถอดรหัส
interface DecodedToken {
  role?: string; // บทบาท เช่น 'user' หรือ 'admin'
  exp?: number;  // เวลาหมดอายุของ Token (timestamp)
}

const App: React.FC = () => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      try {
        const decoded: DecodedToken = jwt_decode(token);
        // ตรวจสอบบทบาทและกำหนดค่าใน State
        if (decoded.role) setRole(decoded.role);
        else setRole(null);

        // ตรวจสอบ Token หมดอายุ
        if (decoded.exp && decoded.exp * 1000 < Date.now()) {
          handleLogout();
        }
      } catch (error) {
        console.error('Error decoding token:', error);
        handleLogout(); // ถ้ามีข้อผิดพลาดในการถอดรหัส Token
      }
    } else {
      setRole(null);
    }
  }, [token]);

  // ฟังก์ชันสำหรับเข้าสู่ระบบ
  const handleLogin = (newToken: string) => {
    setToken(newToken); // อัปเดต Token
    localStorage.setItem('token', newToken); // บันทึก Token ลงใน localStorage
  };

  // ฟังก์ชันสำหรับออกจากระบบ
  const handleLogout = () => {
    setToken(null); // ลบ Token
    setRole(null); // ลบบทบาท
    localStorage.removeItem('token'); // ลบ Token ออกจาก localStorage
  };

  return (
    <Router>
      <div className="app-container">
        {/* Navbar */}
        <Navbar user={token} role={role} onLogout={handleLogout} />
        
        {/* Routes */}
        <Routes>
          {/* สำหรับ User */}
          <Route
            path="/"
            element={token ? <Navigate to="/home" /> : <Login onLogin={handleLogin} />}
          />
          <Route
            path="/home"
            element={token ? <Home /> : <Navigate to="/" />}
          />
          <Route path="/register" element={<Register />} />
          <Route
            path="/game"
            element={token ? <Game token={token} onLogout={handleLogout} /> : <Navigate to="/" />}
          />
          <Route path="/about" element={<About />} />
          <Route path="/doc" element={<Doc />} />
          <Route path="/rules" element={<Rules />} />

          {/* สำหรับ Admin */}
          <Route
            path="/admin"
            element={
              token && role === 'admin' ? (
                <Admin />
              ) : token ? (
                <Navigate to="/admin" /> // กรณีมี token แต่ไม่ได้เป็น admin
              ) : (
                <Navigate to="/loginAdmin" /> // กรณีไม่มี token
              )
            }
          />
          <Route
            path="/user"
            element={
              token && role === 'admin' ? (
                <User />
              ) : token ? (
                <Navigate to="/user" />
              ) : (
                <Navigate to="/loginAdmin" />
              )
            }
            />

          <Route path="/registerAdmin" element={<RegisterAdmin />} />

          <Route
            path="/loginAdmin"
            element={<LoginAdmin onLogin={handleLogin} />}
          />

          <Route
            path="/gameset"
            element={
              token && role === "admin" ? (
                <GameSet /> // แสดงหน้า GameSet ถ้าผู้ใช้มี token และเป็น admin
              ) : token ? (
                <Navigate to="/gameset" /> 
              ) : (
                <Navigate to="/loginAdmin" /> // ถ้ายังไม่ได้ล็อกอิน ให้พาไปที่หน้า LoginAdmin
              )
            }
          />
          
        </Routes>

        {/* Footer */}
        <Footer />
      </div>
    </Router>
  );
};

export default App;
