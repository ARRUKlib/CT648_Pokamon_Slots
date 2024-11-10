import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Rules.css";

const apiURL = process.env.REACT_APP_API_URL || "http://3.24.50.90:3000/api";

interface Pokemon {
  name: string;
  image: string;
  reward: number;
}

const Rules: React.FC = () => {
  const [pokemonList, setPokemonList] = useState<Pokemon[]>([]);
  const [wildSymbol, setWildSymbol] = useState<Pokemon | null>(null);
  const [bonusSymbol, setBonusSymbol] = useState<Pokemon | null>(null);

  // ดึงข้อมูลโปเกมอนจาก API
  const fetchPokemonList = async () => {
    try {
      const response = await axios.get(`${apiURL}/all-pokemon-images`);
      const pokemonData = response.data;

      // แยกข้อมูล Wild Symbol และ Bonus Symbol
      const wild = pokemonData.find((pokemon: Pokemon) => pokemon.name === "Jigglypuff"); // Wild Symbol
      const bonus = pokemonData.find((pokemon: Pokemon) => pokemon.name === "Pikachu"); // Bonus Symbol

      setPokemonList(pokemonData);
      setWildSymbol(wild || null);
      setBonusSymbol(bonus || null);
    } catch (error) {
      console.error("Error fetching Pokémon list:", error);
    }
  };

  useEffect(() => {
    fetchPokemonList();
  }, []);

  return (
    <div className="rules-container">
      <h1>กติกาเกม Pokémon Slot Machine</h1>
      <div className="rules-content">
        <h2>1. วิธีการเล่น</h2>
        <p>
          - ผู้เล่นจะเลือกจำนวนเงินเดิมพันจากตัวเลือกที่กำหนด (เช่น 100, 200, 300, 500) <br />
          - กดปุ่ม <strong>"Spin"</strong> เพื่อหมุนสล็อต <br />
          - หากสัญลักษณ์เรียงตรงตามเงื่อนไขที่กำหนด ผู้เล่นจะได้รับรางวัล <br />
        </p>
        <h2>2. กติกาในการชนะ</h2>
        <p>
          - การคำนวณรางวัลจะอิงจากเงื่อนไขดังนี้:
          <ul>
            <li>หากสัญลักษณ์ในแถวใดแถวหนึ่งเหมือนกันทั้งหมด (รวม Wild) จะได้รับรางวัล</li>
            <li>หากสัญลักษณ์ในคอลัมน์ใดคอลัมน์หนึ่งเหมือนกันทั้งหมด (รวม Wild) จะได้รับรางวัล</li>
            <li>หากสัญลักษณ์เรียงแนวทแยงมุม (ซ้ายบน-ขวาล่าง หรือขวาบน-ซ้ายล่าง) เหมือนกันทั้งหมด (รวม Wild) จะได้รับรางวัล</li>
          </ul>
          - รางวัลคำนวณโดย: <strong>รางวัลของสัญลักษณ์ × จำนวนเงินเดิมพัน</strong> <br />
        </p>
        <h2>3. เงื่อนไขโบนัส</h2>
        <p>
          - สัญลักษณ์ <strong>Wild</strong>: สามารถแทนที่สัญลักษณ์อื่น ๆ ได้ ยกเว้น Bonus <br />
          - สัญลักษณ์ <strong>Bonus</strong>: หากปรากฏ 3 ตัวขึ้นไป จะได้รับรางวัลพิเศษตามจำนวน Bonus <br />
          <ul>
            <li>โบนัส = รางวัลของ Bonus × จำนวน Bonus × จำนวนเงินเดิมพัน</li>
          </ul>
        </p>
        <h2>4. รายละเอียดรางวัลของโปเกมอน</h2>
        <div className="r-pokemon-rewards">
          {pokemonList.length > 0 ? (
            pokemonList.map((pokemon) => (
              <div key={pokemon.name} className="r-pokemon-item">
                <img src={pokemon.image} alt={pokemon.name} className="r-pokemon-image" />
                <p>
                  <strong>{pokemon.name}</strong>: {pokemon.reward} คะแนน
                </p>
              </div>
            ))
          ) : (
            <p>กำลังโหลดข้อมูลโปเกมอน...</p>
          )}
        </div>
        {wildSymbol && (
          <div className="r-special-symbol">
            <h3>สัญลักษณ์ Wild</h3>
            <div className="r-pokemon-item">
              <img src={wildSymbol.image} alt={wildSymbol.name} className="pokemon-image" />
              <p>
                <strong>{wildSymbol.name}</strong>: ใช้แทนสัญลักษณ์อื่นได้
              </p>
            </div>
          </div>
        )}
        {bonusSymbol && (
          <div className="r-special-symbol">
            <h3>สัญลักษณ์ Bonus</h3>
            <div className="r-pokemon-item">
              <img src={bonusSymbol.image} alt={bonusSymbol.name} className="pokemon-image" />
              <p>
                <strong>{bonusSymbol.name}</strong>: ให้รางวัลพิเศษหากปรากฏ 3 ตัวขึ้นไป
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Rules;
