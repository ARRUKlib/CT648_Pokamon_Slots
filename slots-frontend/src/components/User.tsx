import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './User.css';

interface User {
  id: number;
  username: string;
  balance: any; // ใช้ any เพื่อรองรับค่าที่เป็น string ได้
  win_rate: any; // ใช้ any เพื่อรองรับค่าที่เป็น string ได้
  created_at: string;
}

interface Transaction {
  transaction_id: number;
  admin_id: number | null;
  user_id: number;
  amount: any;
  action_type: string;
  new_win_rate: any;
  previous_win_rate: any;
  timestamp: string;
}

interface PlayerStatistic {
  user_id: number;
  total_spins: number;
  total_wins: number;
  total_win_amount: any;
  last_win_date: string;
}

const UserList: React.FC = () => {
  const [view, setView] = useState<'users' | 'transactions' | 'player_statistics'>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [playerStatistics, setPlayerStatistics] = useState<PlayerStatistic[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (view === 'users') {
      fetchUsers();
    } else if (view === 'transactions') {
      fetchTransactions();
    } else if (view === 'player_statistics') {
      fetchPlayerStatistics();
    }
  }, [view]);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://3.24.50.90:3000/api/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to load user data');
    }
  };

  const fetchTransactions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://3.24.50.90:3000/api/transactions', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTransactions(response.data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setError('Failed to load transaction data');
    }
  };

  const fetchPlayerStatistics = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://3.24.50.90:3000/api/player-statistics', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPlayerStatistics(response.data);
    } catch (error) {
      console.error('Error fetching player statistics:', error);
      setError('Failed to load player statistics data');
    }
  };

  return (
    <div className="user-container">
      <h1>Data Tables</h1>
      <div className="button-group">
        <button 
          onClick={() => setView('users')} 
          className={view === 'users' ? 'active' : ''}
        >
          Users
        </button>
        <button 
          onClick={() => setView('transactions')} 
          className={view === 'transactions' ? 'active' : ''}
        >
          Transactions
        </button>
        <button 
          onClick={() => setView('player_statistics')} 
          className={view === 'player_statistics' ? 'active' : ''}
        >
          Player Statistics
        </button>
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {view === 'users' && (
        <div>
          <h2>User List</h2>
          <table className="user-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Balance</th>
                <th>Win Rate</th>
                <th>Created At</th>
              </tr>
            </thead>
            <tbody>
              {users.length > 0 ? (
                users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>{user.username}</td>
                    <td>{user.balance !== null ? parseFloat(user.balance).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 }) : '0'}</td>
                    <td>{user.win_rate !== null ? parseFloat(user.win_rate).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 }) : '0'}</td>
                    <td>{new Date(user.created_at).toLocaleDateString('th-TH', { day: 'numeric', month: 'numeric', year: 'numeric' })}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center' }}>No user data available</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {view === 'transactions' && (
        <div>
          <h2>Transaction List</h2>
          <table className="user-table">
            <thead>
              <tr>
                <th>Transaction ID</th>
                <th>Admin ID</th>
                <th>User ID</th>
                <th>Amount</th>
                <th>Action Type</th>
                <th>New Win Rate</th>
                <th>Previous Win Rate</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length > 0 ? (
                transactions.map((transaction) => (
                  <tr key={transaction.transaction_id}>
                    <td>{transaction.transaction_id}</td>
                    <td>{transaction.admin_id || '-'}</td>
                    <td>{transaction.user_id}</td>
                    <td>{transaction.amount !== null ? parseFloat(transaction.amount).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 }) : '0'}</td>
                    <td>{transaction.action_type}</td>
                    <td>{transaction.new_win_rate !== null ? parseFloat(transaction.new_win_rate).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 }) : '-'}</td>
                    <td>{transaction.previous_win_rate !== null ? parseFloat(transaction.previous_win_rate).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 }) : '-'}</td>
                    <td>{new Date(transaction.timestamp).toLocaleDateString('th-TH', { day: 'numeric', month: 'numeric', year: 'numeric' })}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center' }}>No transaction data available</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {view === 'player_statistics' && (
        <div>
          <h2>Player Statistics</h2>
          <table className="user-table">
            <thead>
              <tr>
                <th>User ID</th>
                <th>Total Spins</th>
                <th>Total Wins</th>
                <th>Total Win Amount</th>
                <th>Last Win Date</th>
              </tr>
            </thead>
            <tbody>
              {playerStatistics.length > 0 ? (
                playerStatistics.map((stat) => (
                  <tr key={stat.user_id}>
                    <td>{stat.user_id}</td>
                    <td>{stat.total_spins}</td>
                    <td>{stat.total_wins}</td>
                    <td>{stat.total_win_amount !== null ? parseFloat(stat.total_win_amount).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 }) : '0'}</td>
                    <td>{stat.last_win_date ? new Date(stat.last_win_date).toLocaleDateString('th-TH', { day: 'numeric', month: 'numeric', year: 'numeric' }) : '-'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center' }}>No player statistics data available</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UserList;
