import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import backgroundImage from "../assets/images/p_admin.jpg";

const AdminPanel: React.FC = () => {
  const [winRate, setWinRate] = useState<number>(0);
  const navigate = useNavigate();

  useEffect(() => {
    fetchWinRate();
  }, []);

  const fetchWinRate = async () => {
    try {
      const response = await axios.get('http://3.24.50.90:3001/api/win-rate');
      setWinRate(response.data.winRate);
    } catch (error) {
      console.error('Error fetching win rate:', error);
      alert('Failed to fetch win rate');
    }
  };

  const handleUpdateWinRate = async () => {
    try {
      await axios.post('http://3.24.50.90:3001/api/update-win-rate', { winRate });
      alert('Win rate updated successfully');
    } catch (error) {
      console.error('Error updating win rate:', error);
      alert('Failed to update win rate');
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
      <h1>Admin Panel</h1>
      <div>
        <label htmlFor="winRate">Win Rate (%): </label>
        <input
          type="number"
          id="winRate"
          value={winRate}
          onChange={(e) => setWinRate(Number(e.target.value))}
          min="0"
          max="100"
          step="0.01"
        />
      </div>
      <button onClick={handleUpdateWinRate}>Update Win Rate</button>
      <button onClick={() => navigate('/game')}>Back to Game</button>
    </div>
  );
};

export default AdminPanel;