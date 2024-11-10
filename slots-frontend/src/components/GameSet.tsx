import React, { useState, useEffect } from "react";
import axios from "axios";
import "./GameSet.css";

const apiURL = process.env.REACT_APP_API_URL || "http://3.24.50.90:3000/api";

interface User {
  id: number;
  username: string;
  balance: number;
  win_rate: number;
}

const GameSet: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [amount, setAmount] = useState<number>(0);
  const [winRate, setWinRate] = useState<number>(5);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // ฟังก์ชันล้างข้อความข้อผิดพลาด/สำเร็จ
  const clearMessages = () => {
    setError(null);
    setSuccessMessage(null);
  };

  // ดึงข้อมูลผู้ใช้ทั้งหมด
  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${apiURL}/users`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
      setError("Failed to load user data.");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // ฟังก์ชันสำหรับการเติมเงิน
  const handleAddBalance = async () => {
    clearMessages();
    if (!selectedUser) {
      setError("Please select a user first.");
      return;
    }
    if (amount <= 0) {
      setError("Amount must be greater than 0.");
      return;
    }
    try {
      const response = await axios.post(
        `${apiURL}/update-balance`,
        {
          user_id: selectedUser.id,
          balance: amount, // ส่งยอดเงินที่ต้องการอัปเดต
          action_type: "admin_update", // ระบุว่าเป็นการอัปเดตโดย Admin
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setSuccessMessage(`Balance updated successfully for ${selectedUser.username}.`);
      fetchUsers(); // อัปเดตรายการผู้ใช้ใหม่
      setAmount(0); // รีเซ็ตช่องกรอกยอดเงิน
    } catch (error: any) {
      console.error("Error updating balance:", error.response?.data?.error || error.message);
      setError(error.response?.data?.error || "Failed to update balance.");
    }
  };

  // ฟังก์ชันสำหรับปรับอัตราชนะ
  const handleUpdateWinRate = async () => {
    clearMessages();
    if (!selectedUser) {
      setError("Please select a user first.");
      return;
    }
    if (winRate < 0 || winRate > 100) {
      setError("Win rate must be between 0 and 100.");
      return;
    }
    try {
      const response = await axios.post(
        `${apiURL}/update-win-rate`,
        {
          user_id: selectedUser.id,
          new_win_rate: winRate, // ส่ง win rate ใหม่
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setSuccessMessage(`Win rate updated successfully for ${selectedUser.username}.`);
      fetchUsers(); // อัปเดตรายการผู้ใช้ใหม่
      setWinRate(5); // รีเซ็ตช่องเลือก Win Rate
    } catch (error: any) {
      console.error("Error updating win rate:", error.response?.data?.error || error.message);
      setError(error.response?.data?.error || "Failed to update win rate.");
    }
  };

  return (
    <div className="game-set-container">
      <h1>Game Settings</h1>
      {error && <p className="g-error-message">{error}</p>}
      {successMessage && <p className="g-success-message">{successMessage}</p>}

      <div className="g-user-selection">
        <label>Select User:</label>
        <select
          onChange={(e) => {
            clearMessages();
            const user = users.find((u) => u.id === Number(e.target.value));
            setSelectedUser(user || null);
          }}
        >
          <option value="">-- Select User --</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.id} - {user.username}
            </option>
          ))}
        </select>
      </div>

      {selectedUser && (
        <div className="g-user-details">
          <p>
            User ID: <strong>{selectedUser.id}</strong>
          </p>
          <p>
            Username: <strong>{selectedUser.username}</strong>
          </p>
          <p>
            <strong>Current Balance:</strong> {Math.floor(selectedUser.balance).toLocaleString()}
          </p>
          <p>
            <strong>Current Win Rate:</strong> {Math.floor(selectedUser.win_rate)}%
          </p>
        </div>
      )}

      <div className="g-balance-update">
        <h2>Add Balance:</h2>
        <input
          type="number"
          placeholder="Enter amount"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
        />
        <button className="g-button" onClick={handleAddBalance}>
          Update Balance
        </button>
      </div>

      <div className="g-win-rate-update">
        <h2>Update Win Rate:</h2>
        <select value={winRate} onChange={(e) => setWinRate(Number(e.target.value))}>
          {Array.from({ length: 20 }, (_, i) => (i + 1) * 5).map((rate) => (
            <option key={rate} value={rate}>
              {rate}%
            </option>
          ))}
        </select>
        <button className="g-button" onClick={handleUpdateWinRate}>
          Update Win Rate
        </button>
      </div>
    </div>
  );
};

export default GameSet;
