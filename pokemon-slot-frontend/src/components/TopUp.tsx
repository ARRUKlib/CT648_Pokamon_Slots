import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const TopUp: React.FC = () => {
  const [amount, setAmount] = useState<number>(0);
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');
  console.log('User ID for top-up:', userId);

  const handleTopUp = async () => {
    if (!userId) {
      alert('Please log in first');
      navigate('/login');
      return;
    }

    if (amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    try {
        const response = await axios.post('http://3.24.50.90:3001/api/topup', {
        user_id: userId,
        amount: amount
        });

      if (response.data.success) {
        alert(`Top-up successful. New balance: ${response.data.newBalance} coins`);
        navigate('/game');
      } else {
        alert('Top-up failed. Please try again.');
      }
    } catch (error) {
      console.error('Top-up error:', error);
      alert('An error occurred during top-up. Please try again.');
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '20px',
    }}>
      <h1>Top Up Your Account</h1>
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
        }}
      >
        Top Up
      </button>
    </div>
  );
};

export default TopUp;