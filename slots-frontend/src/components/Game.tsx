import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import "./Game.css";
import backgroundImage from "../assets/images/p_9.jpg";

const apiURL = process.env.REACT_APP_API_URL || "http://localhost:3000/api";

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
  const [userId, setUserId] = useState<number | null>(null);

  // Fetch user profile and update coins
  const fetchUserProfile = useCallback(async () => {
    try {
      const response = await axios.get(`${apiURL}/user-profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsername(response.data.username);
      setCoins(response.data.coins);
      setUserId(response.data.id);
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  }, [token]);

  // Fetch Pokémon images
  const fetchAllImages = useCallback(async () => {
    try {
      const limit = 50; // Number of Pokémon to fetch
      const uniqueIds = new Set<number>();
      const allImages: SlotResult[] = [];

      while (uniqueIds.size < limit) {
        uniqueIds.add(Math.floor(Math.random() * 898) + 1);
      }

      const requests = Array.from(uniqueIds).map((id) =>
        axios.get(`https://pokeapi.co/api/v2/pokemon/${id}`)
      );

      const responses = await Promise.all(requests);

      responses.forEach((response) => {
        allImages.push({
          name: response.data.name,
          image: response.data.sprites.front_default,
          reward: Math.floor(Math.random() * 500) + 100,
        });
      });

      setAllPokemonImages(allImages);

      // Set initial slot machine layout
      const initialSlots = Array.from({ length: 3 }, () =>
        Array.from({ length: 3 }, () =>
          allImages[Math.floor(Math.random() * allImages.length)]
        )
      );
      setSlots(initialSlots);
    } catch (error) {
      console.error("Error fetching Pokémon images:", error);
    }
  }, []);

  useEffect(() => {
    fetchUserProfile();
    fetchAllImages();
  }, [fetchUserProfile, fetchAllImages]);

  // Randomize slot machine
  const randomizeSlots = () => {
    const randomSlots = Array.from({ length: 3 }, () =>
      Array.from({ length: 3 }, () =>
        allPokemonImages[Math.floor(Math.random() * allPokemonImages.length)]
      )
    );
    setSlots(randomSlots);
  };

  // Record spin
  const recordSpin = async (amount: number, winAmount: number) => {
    try {
      await axios.post(
        `${apiURL}/record-spin`,
        { user_id: userId, bet_amount: amount, win_amount: winAmount },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error) {
      console.error("Error recording spin:", error);
    }
  };

  // Update balance
  const updateBalance = async () => {
    try {
      await fetchUserProfile(); // Refresh user's coin balance
    } catch (error) {
      console.error("Error updating balance:", error);
    }
  };

  // Spin slot machine
  const spinSlot = async () => {
    if (spinning || coins < betAmount) {
      alert("Insufficient balance or spinning in progress.");
      return;
    }

    setSpinning(true);
    setMessage("Good Luck!");
    setWin(false);
    setReward(0);

    const newCoins = coins - betAmount;
    setCoins(newCoins);

    try {
      const intervalId = setInterval(randomizeSlots, 100);

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

        if (calculatedReward > 0) {
          setWin(true);
          setReward(calculatedReward);
          setMessage(`You Win! Reward: ${calculatedReward}`);
        } else {
          setMessage("You Lose! Try again.");
        }

        // Update balance and record spin
        try {
          await updateBalance();
          await recordSpin(betAmount, calculatedReward);
        } catch (error) {
          console.error("Error updating balance or recording spin:", error);
        }
      }, 2000);
    } catch (error) {
      console.error("Error spinning slot:", error);
      setSpinning(false);
      setMessage("An error occurred. Please try again.");
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
          <option value={1000}>1000</option>
          <option value={1500}>1500</option>
          <option value={2000}>2000</option>
        </select>
      </div>

      <div className="slot-machine">
        {slots.map((row, rowIndex) => (
          <div key={rowIndex} className="slot-row">
            {row.map((slot, colIndex) => (
              <div key={colIndex} className={`slot ${spinning ? "spinning" : ""}`}>
                <img
                  src={slot.image}
                  alt={slot.name}
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
        <p className={`win-message ${win ? "win" : "lose"}`}>
          {message}
        </p>
      )}
    </div>
  );
};

export default Game;
