import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import backgroundImage from "../assets/images/p_admin.jpg";

const AdminTopUp: React.FC = () => {
  const [users, setUsers] = useState<Array<{ user_id: number, user_name: string }>>([]);
  const [selectedUser, setSelectedUser] = useState<number | null>(null);
  const [amount, setAmount] = useState<number>(0);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://3.24.50.90:3001/api/users');
      if (response.data && Array.isArray(response.data)) {
        setUsers(response.data);
      } else {
        console.error('Unexpected response format:', response.data);
        alert('Failed to fetch users: Unexpected data format');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      if (axios.isAxiosError(error) && error.response) {
        alert(`Failed to fetch users: ${error.response.data.error || 'Unknown error'}`);
      } else {
        alert('Failed to fetch users: Network error');
      }
    }
  };

  const handleTopUp = async () => {
    if (!selectedUser || amount <= 0) {
      alert('Please select a user and enter a valid amount');
      return;
    }

    try {
      const response = await axios.post('http://3.24.50.90:3001/api/topup', {
        user_id: selectedUser,
        amount: amount
      });

      if (response.data.success) {
        alert(`Top-up successful. New balance for user: ${response.data.newBalance} coins`);
        setSelectedUser(null);
        setAmount(0);
      } else {
        alert('Top-up failed. Please try again.');
      }
    } catch (error) {
      console.error('Admin top-up error:', error);
      alert('An error occurred during top-up. Please try again.');
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '20px',
      height: '100vh',
      backgroundImage: `url(${backgroundImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      color: 'white',
    }}>
      <h1>Admin Top Up</h1>
      <select
        value={selectedUser || ''}
        onChange={(e) => setSelectedUser(Number(e.target.value))}
        style={{
          fontSize: '1.2rem',
          padding: '10px',
          margin: '10px 0',
          width: '200px',
        }}
      >
        <option value="">Select User</option>
        {users.map(user => (
          <option key={user.user_id} value={user.user_id}>{user.user_name}</option>
        ))}
      </select>
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(Number(e.target.value))}
        placeholder="Enter amount"
        style={{
          fontSize: '1.2rem',
          padding: '10px',
          margin: '10px 0',
          width: '200px',
        }}
      />
      <button
        onClick={handleTopUp}
        style={{
          fontSize: '1.2rem',
          padding: '10px 20px',
          backgroundColor: '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          marginTop: '10px',
        }}
      >
        Top Up
      </button>
      <button
        onClick={() => navigate('/game')}
        style={{
          fontSize: '1rem',
          padding: '10px 20px',
          backgroundColor: '#007BFF',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          marginTop: '20px',
        }}
      >
        Back to Game
      </button>
      
      {/* เพิ่มลิงก์ไปยัง AdminPanel ตรงนี้ */}
      <Link to="/admin" style={{
        fontSize: '1rem',
        padding: '10px 20px',
        backgroundColor: '#28a745',
        color: 'white',
        textDecoration: 'none',
        borderRadius: '5px',
        marginTop: '20px',
        display: 'inline-block'
      }}>
        Go to Admin Panel
      </Link>
    </div>
  );
};

export default AdminTopUp;