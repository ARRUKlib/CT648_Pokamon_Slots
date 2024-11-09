import React from 'react';
import './Home.css';

const Home: React.FC = () => {
  return (
    <div className="home-container">
      <header className="home-header">
        <h1>Welcome to Slot Adventure</h1>
        <p>Spin the reels, try your luck, and win big!</p>
      </header>
      
      <div className="home-content">
        <button className="home-button start-game" onClick={() => window.location.href = "/game"}>
          Start Game
        </button>
        <button className="home-button rules" onClick={() => window.location.href = "/rules"}>
          Game Rules
        </button>
        <button className="home-button about" onClick={() => window.location.href = "/about"}>
          About Us
        </button>
      </div>
    </div>
  );
};

export default Home;
