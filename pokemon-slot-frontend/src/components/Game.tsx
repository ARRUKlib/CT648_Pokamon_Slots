import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Game.css";
import backgroundImage from "../assets/images/p_9.jpg";
import winSound from "../assets/sounds/winSound.mp3";

type ImageUrls = { [key: string]: string };

interface GameProps {
  username: string;
  onLogout: () => void;
}

interface SlotResult {
  name: string;
  image: string | null;
}

const Game: React.FC<GameProps> = ({ username, onLogout }) => {
  const [slots, setSlots] = useState<SlotResult[]>([]); // เก็บผลลัพธ์ของแต่ละช่องสล็อต
  const [spinning, setSpinning] = useState(false); // สถานะของการหมุน
  const [win, setWin] = useState(false); // สถานะของการชนะ
  const [reward, setReward] = useState(0); // จำนวนรางวัลที่ได้รับ
  const [coins, setCoins] = useState<number>(0); // จำนวนเหรียญของผู้ใช้
  const [imageUrls, setImageUrls] = useState<ImageUrls>({}); // เก็บ URL ของภาพแต่ละโปเกมอน
  const userId = localStorage.getItem("userId"); // ดึง user ID จาก localStorage

  useEffect(() => {
    fetchUserCoins(); // ดึงเหรียญของผู้ใช้เมื่อโหลดคอมโพเนนต์
  }, []);

  // ฟังก์ชันสำหรับดึงจำนวนเหรียญของผู้ใช้จาก API
  const fetchUserCoins = async () => {
    if (!userId) return;
    try {
      const response = await axios.get(`http://3.24.50.90:3001/api/user-coins?user_id=${userId}`);
      setCoins(response.data.coins);
    } catch (error) {
      console.error("Error fetching user coins:", error);
    }
  };

  // ฟังก์ชันสุ่มภาพหลายๆ ภาพสำหรับสล็อตแต่ละช่องในขณะหมุน
  const randomizeSlots = () => {
    const randomSlots = Array(3).fill(null).map(() => ({
      name: Object.keys(imageUrls)[Math.floor(Math.random() * Object.keys(imageUrls).length)],
      image: null,
    }));
    setSlots(randomSlots);
  };

  // ฟังก์ชันที่ทำให้สล็อตหมุนเมื่อกดปุ่ม Spin
  const spinSlot = async () => {
    if (spinning || !userId) return;
    setSpinning(true); // ตั้งสถานะหมุนเป็นจริง
    setWin(false); // รีเซ็ตสถานะชนะ
    setReward(0); // รีเซ็ตจำนวนรางวัล

    try {
      const response = await axios.post("http://3.24.50.90:3001/api/spin-slot", { user_id: userId });
      const { slots: newSlots, win, reward, currentCoins } = response.data;

      // เริ่มการสุ่มเปลี่ยนภาพในสล็อตทุกๆ 100ms
      const intervalId = setInterval(randomizeSlots, 100);

      // ตั้งเวลาให้หยุดการสุ่มหลังจาก 3 วินาที
      setTimeout(() => {
        clearInterval(intervalId); // หยุดการสุ่มเปลี่ยนภาพ
        setSlots(newSlots); // แสดงผลลัพธ์สุดท้ายจาก API
        setSpinning(false); // ทำให้ปุ่มกลับมากดได้อีกครั้ง

        // หน่วงเวลา 1 วินาทีก่อนที่จะแสดงข้อความแจ้งเตือน เพื่อให้ภาพสุดท้ายปรากฏให้เห็นก่อน
        setTimeout(() => {
          setWin(win);
          setReward(win ? reward : 0);
          setCoins(currentCoins);

          // แจ้งผลแพ้ชนะ
          if (win) {
            new Audio(winSound).play();
            alert(`ยินดีด้วย! คุณชนะ ${reward} coins! ยอดเงินของคุณคือ ${currentCoins} coins.`);
          } else {
            alert("ขอแสดงความเสียใจด้วยคุณไม่ชนะ");
          }
        }, 1000); // หน่วงเวลา 1 วินาทีหลังจากสล็อตหยุดหมุนเพื่อให้ภาพสุดท้ายแสดง
      }, 3000); // หมุน 3 วินาที
    } catch (error) {
      console.error("Error spinning slot:", error);
      alert("An error occurred while spinning. Please try again.");
      setSpinning(false);
    }
  };

  // ฟังก์ชันสำหรับดึง URL ของภาพโปเกมอนจากชื่อ
  const callImage = async (name: any) => {
    try {
      const response = await axios.get(`http://3.24.50.90:3001/api/pokemon-image/${name}`);
      console.log(`Fetched image URL for ${name}:`, response.data.image); // ตรวจสอบ URL ของภาพ
      return response.data.image;
    } catch (error) {
      console.error(`Error fetching image for ${name}:`, error);
      return ""; // Default to empty if the image can't be fetched
    }
  };

  // ดึงภาพของแต่ละสล็อตหลังจาก slots มีการเปลี่ยนแปลง
  useEffect(() => {
    const fetchImages = async () => {
      const urls: ImageUrls = { ...imageUrls }; // ดึงข้อมูลเก่ามาไว้ก่อนเพื่อไม่ให้ข้อมูลหายไป

      // ตรวจสอบแต่ละตัวใน slots ว่ามีใน imageUrls หรือยัง
      for (const slot of slots) {
        if (slot && slot.name && !urls[slot.name]) {
          const url = await callImage(slot.name);
          if (url) {
            urls[slot.name] = url;
          } else {
            console.warn(`Image for ${slot.name} not found.`); // แสดงคำเตือนใน console ถ้าไม่พบรูปภาพ
          }
        }
      }
      setImageUrls(urls);
    };

    fetchImages();
  }, [slots]);

  return (
    <div className="game-container" style={{ backgroundImage: `url(${backgroundImage})` }}>
      <h1 className="game-title">Pokémon Slot Machine</h1>
      <p className="welcome-message">Welcome, {username}!</p>
      <p className="coin-display">Coins: {coins}</p>
      <button onClick={onLogout} className="logout-button">
        Logout
      </button>

      {/* แสดงผลสล็อต */}
      <div className="slot-machine">
        {slots.map((slot, index) => (
          <div key={index} className={`slot ${spinning ? "spinning" : ""}`}>
            <div className="pokemon-image-wrapper">
              {/* ใช้ default image ถ้าไม่มีภาพใน imageUrls */}
              <img
                src={slot && slot.name ? imageUrls[slot.name] || "path/to/default-image.png" : "path/to/default-image.png"}
                alt={slot && slot.name ? slot.name : "Unknown Pokémon"}
                className="pokemon-image"
              />
              {/* ซ้ำภาพอีกครั้งเพื่อให้เลื่อนต่อเนื่อง */}
              <img
                src={slot && slot.name ? imageUrls[slot.name] || "path/to/default-image.png" : "path/to/default-image.png"}
                alt={slot && slot.name ? slot.name : "Unknown Pokémon"}
                className="pokemon-image"
              />
            </div>
          </div>
        ))}
      </div>

      <button onClick={spinSlot} disabled={spinning} className="spin-button">
        {spinning ? "Spinning..." : "Spin!"}
      </button>

      {win && <p className="win-message">Congratulations! You won {reward} coins!</p>}
    </div>
  );
};

export default Game;
