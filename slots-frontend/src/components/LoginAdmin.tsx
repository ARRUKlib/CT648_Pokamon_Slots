import React, { useState } from 'react';
import axios from 'axios';
import jwt_decode from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import './Auth.css';

interface LoginProps {
  onLogin: (token: string) => void; // ฟังก์ชันสำหรับจัดการการเข้าสู่ระบบ
}

const LoginAdmin: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState(''); // เก็บค่า username
  const [password, setPassword] = useState(''); // เก็บค่า password
  const [error, setError] = useState<string | null>(null); // เก็บข้อความข้อผิดพลาด
  const navigate = useNavigate(); // ใช้สำหรับนำทางไปยังหน้าอื่น

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault(); // ป้องกันการรีเฟรชหน้าเว็บ

    try {
      // เรียก API สำหรับล็อกอินแอดมิน
      const response = await axios.post('http://3.24.50.90:3000/api/admin-login', { username, password });
      const token = response.data.token;

      // บันทึก token ลงใน localStorage
      localStorage.setItem('token', token);

      // แจ้งแอปว่าผู้ใช้ล็อกอินสำเร็จ
      onLogin(token);

      // Decode token เพื่อดึงข้อมูลเพิ่มเติม
      const decodedToken: any = jwt_decode(token);
      console.log('Decoded Admin Token:', decodedToken);

      // เรียก API เพื่อบันทึกการล็อกอิน
      await axios.post(
        'http://3.24.50.90:3000/api/record-login',
        { admin_id: decodedToken.adminId || null }, // ระบุ admin_id หรือ null
        {
          headers: { Authorization: `Bearer ${token}` }, // ส่ง token ไปใน Header
        }
      );

      // นำทางไปยังหน้าแอดมิน
      navigate('/admin');
    } catch (error) {
      // ตั้งค่าข้อความแสดงข้อผิดพลาด
      setError('Admin Login failed. Please check your username and password.');
    }
  };

  return (
    <div className="auth-background">
      <div className="auth-container">
        <h1 className="auth-title">Login Admin</h1>
        {/* แสดงข้อผิดพลาดถ้ามี */}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Enter username..."
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="login-input"
            required
          />
          <input
            type="password"
            placeholder="Enter password..."
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="login-input"
            required
          />
          <button type="submit" className="login-button">Login</button>
        </form>
        {/* เพิ่มปุ่ม Sign Up */}
        <div className="register-link">
          Don't have an account? <a href="/registerAdmin">Sign up</a>
        </div>
      </div>
    </div>
  );
};

export default LoginAdmin;
