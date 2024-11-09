// components/Navbar.tsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';
import logo from '../assets/images/logo.jpeg';

interface NavbarProps {
  user: string | null; // Token ของผู้ใช้ (null ถ้ายังไม่ได้ล็อกอิน)
  role: string | null; // บทบาทของผู้ใช้ เช่น 'user' หรือ 'admin'
  onLogout: () => void; // ฟังก์ชันสำหรับออกจากระบบ
}

const Navbar: React.FC<NavbarProps> = ({ user, role, onLogout }) => {
  const navigate = useNavigate();

  // ฟังก์ชันสำหรับการกดปุ่ม Admin
  const handleAdminClick = () => {
    if (role === 'admin') {
      navigate('/admin'); // พาไปหน้า Admin ถ้าบทบาทคือ admin
    } else {
      navigate('/loginAdmin'); // พาไปหน้า LoginAdmin ถ้ายังไม่ได้ล็อกอินในฐานะ Admin
    }
  };

  return (
    <nav>
      <ul>
        <li>
          <Link to="/home">
            <img src={logo} alt="Logo" className="navbar-logo" />
          </Link>
        </li>
        <li><Link to="/home">Home</Link></li>
        <li><Link to="/about">About</Link></li>
        <li>
          <button onClick={handleAdminClick}>Admin</button>
        </li>
        {user ? (
          <>
            <li><Link to="/game">Game</Link></li>
            <li><button onClick={onLogout}>Logout</button></li>
          </>
        ) : (
          <>
            <li><Link to="/">Login Game</Link></li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
