import React from 'react';

const Logout: React.FC = () => {
  const handleLogout = () => {
    // ลบ token หรือจัดการ session
    alert('Logged out successfully!');
  };

  return (
    <div>
      <h2>Logout</h2>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default Logout;
