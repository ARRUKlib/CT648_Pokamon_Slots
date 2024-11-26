import React from 'react';
import './Admin.css';

const Admin: React.FC = () => {
  return (
    <div className="admin-container">
      <header className="admin-header">
        <h1>Welcome to Admin Page</h1>
        <p></p>
      </header>
      
      <div className="admin-content">
        <button className="admin-button user" onClick={() => window.location.href = "/user"}>
          About Player
        </button>
        <button className="admin-button set" onClick={() => window.location.href = "/gameset"}>
          Game Setting
        </button>
        <button className="admin-button about" onClick={() => window.location.href = "/about"}>
          About Us
        </button>
      </div>
    </div>
  );
};

export default Admin;
