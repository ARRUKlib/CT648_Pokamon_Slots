import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import "./Game.css";
import backgroundImage from "../assets/images/p_9.jpg";

const apiURL = process.env.REACT_APP_API_URL || 'http://3.24.50.90:3000/api';

interface GameProps {
  token: string;
  onLogout: () => void;
}

interface SlotResult {
  name: string;
  image: string;
  reward: number;
}

const Game: React.FC<GameProps> = ({ token, onLogout }) => {
  const [username, setUsername] = useState<string | null>(null);
  const [slots, setSlots] = useState<SlotResult[][]>([[], [], []]);
  const [spinning, setSpinning] = useState(false);
  const [win, setWin] = useState(false);
  const [reward, setReward] = useState(0);
  const [coins, setCoins] = useState<number>(0);
  const [betAmount, setBetAmount] = useState<number>(100);
  const [allPokemonImages, setAllPokemonImages] = useState<SlotResult[]>([]);
  const [message, setMessage] = useState<string>("");
  const [userId, setUserId] = useState<number | null>(null); // ประกาศ userId


  const fetchUserProfile = useCallback(async () => {
    try {
      const response = await axios.get(`${apiURL}/user-profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsername(response.data.username);
      setCoins(response.data.coins);
      setUserId(response.data.id); // เก็บ user_id ไว้ใน state
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  }, [token]);
  
  const fetchAllImages = async () => {
    try {
      const response = await axios.get(`${apiURL}/all-pokemon-images`);
      const images = response.data.map((pokemon: { name: string; image: string; reward: number }) => ({
        name: pokemon.name,
        image: pokemon.image,
        reward: pokemon.reward,
      }));
      setAllPokemonImages(images);
      const initialSlots = Array.from({ length: 3 }, () =>
        Array.from({ length: 3 }, () => images[Math.floor(Math.random() * images.length)])
      );
      setSlots(initialSlots);
    } catch (error) {
      console.error("Error fetching all images:", error);
    }
  };

  useEffect(() => {
    fetchUserProfile();
    fetchAllImages();
  }, [fetchUserProfile]);

  const randomizeSlots = () => {
    const randomSlots = Array.from({ length: 3 }, () =>
      Array.from({ length: 3 }, () => allPokemonImages[Math.floor(Math.random() * allPokemonImages.length)])
    );
    setSlots(randomSlots);
  };

  // ฟังก์ชันสำหรับบันทึกการหมุน
  const recordSpin = async (amount: number, winAmount: number) => {
    if (!token) {
      console.error("Token is missing. Cannot record spin.");
      return;
    }
  
    try {
      await axios.post(
        `${apiURL}/record-spin`,
        { bet_amount: amount, win_amount: winAmount },
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      console.log("Spin successfully recorded.");
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        console.error("Error recording spin (Axios):", error.response?.data || error.message);
      } else {
        console.error("Unexpected error:", error);
      }
    }
  };
  
  const spinSlot = async () => {
    if (spinning || coins < betAmount) {
      alert("คุณไม่มียอดเงินเพียงพอในการหมุน กรุณาเติมเงิน");
      return;
    }
  
    setSpinning(true);
    setWin(false);
    setReward(0);
    setMessage("Good Luck!");
  
    const newCoins = coins - betAmount;
    setCoins(newCoins);
  
    const intervalId = setInterval(randomizeSlots, 100);
  
    try {
      const response = await axios.post(
        `${apiURL}/spin-slot`,
        { betAmount },
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      const { slots: newSlots, reward: calculatedReward } = response.data;
  
      setTimeout(async () => {
        clearInterval(intervalId);
        setSlots(newSlots);
        setSpinning(false);
  
        const updatedCoins = newCoins + calculatedReward;
        await axios.post(
          `${apiURL}/update-balance`,
          { user_id: username, balance: updatedCoins },
          { headers: { Authorization: `Bearer ${token}` } }
        );
  
        await recordSpin(betAmount, calculatedReward);
  
        setWin(calculatedReward > 0);
        setReward(calculatedReward);
        setMessage(
          calculatedReward > 0
            ? `Congratulations! You won ${calculatedReward} coins!`
            : "ขอแสดงความเสียใจด้วยคุณไม่ชนะ"
        );
      }, 3000);
    } catch (error) {
      console.error("Error spinning slot:", error);
      clearInterval(intervalId);
      setSpinning(false);
      setCoins(coins);
    }
  };
  

  return (
    <div className="game-container" style={{ backgroundImage: `url(${backgroundImage})` }}>
      <h1 className="game-title">Pokémon Slot Machine</h1>
      <p className="welcome-message">Welcome: {username}</p>
      <p className="coin-display">Coins: {Math.floor(coins)}</p>
      <div>
        <label>เลือกจำนวนเงินเดิมพัน: </label>
        <select value={betAmount} onChange={(e) => setBetAmount(Number(e.target.value))}>
          <option value={100}>100</option>
          <option value={200}>200</option>
          <option value={300}>300</option>
          <option value={500}>500</option>
        </select>
      </div>

      <div className="slot-machine">
        {slots.map((row, rowIndex) => (
          <div key={rowIndex} className="slot-row">
            {row.map((slot, colIndex) => (
              <div key={colIndex} className={`slot ${spinning ? "spinning" : ""}`}>
                <img
                  src={slot && slot.image ? slot.image : "path/to/default-image.png"}
                  alt={slot && slot.name ? slot.name : "Unknown Pokémon"}
                  className="pokemon-image"
                />
              </div>
            ))}
          </div>
        ))}
      </div>

      <button onClick={spinSlot} disabled={spinning} className="spin-button">
        {spinning ? "Spinning..." : "Spin!"}
      </button>

      {message && (
        <p className="win-message">
          {message}
        </p>
      )}

    </div>
    
  );
};

export default Game;
