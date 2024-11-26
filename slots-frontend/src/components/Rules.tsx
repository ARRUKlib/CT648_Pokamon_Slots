import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Rules.css";

// PokeAPI URL สำหรับดึงข้อมูลโปเกมอน
const POKE_API_URL = "https://pokeapi.co/api/v2/pokemon";

interface Pokemon {
  name: string;
  image: string;
}

const Rules: React.FC = () => {
  const [pokemonList, setPokemonList] = useState<Pokemon[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // ดึงข้อมูล Pokémon จาก PokeAPI
  const fetchPokemonList = async () => {
    try {
      setLoading(true);

      const limit = 300; // จำนวนโปเกมอนที่ต้องการแสดง
      const offset = Math.floor(Math.random() * (898 - limit)); // สุ่ม offset เพื่อไม่ให้ซ้ำ
      const response = await axios.get(`${POKE_API_URL}?limit=${limit}&offset=${offset}`);
      const pokemonResults = response.data.results;

      // ดึงข้อมูลของแต่ละโปเกมอน (ชื่อ, รูป)
      const pokemonData = await Promise.all(
        pokemonResults.map(async (pokemon: any) => {
          const details = await axios.get(pokemon.url); // ดึงข้อมูลแต่ละโปเกมอน
          return {
            name: pokemon.name,
            image: details.data.sprites.front_default || "https://via.placeholder.com/96",
          };
        })
      );

      setPokemonList(pokemonData);
    } catch (error) {
      console.error("Error fetching Pokémon list:", error);
    } finally {
      setLoading(false);
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
          - ผู้เล่นจะเลือกจำนวนเงินเดิมพันจากตัวเลือกที่กำหนด (เช่น 100, 200, 300, 500, 1,000, 1,500, 2,000) <br />
          - กดปุ่ม <strong>"Spin"</strong> เพื่อหมุนสล็อต <br />
          - หากสัญลักษณ์เรียงตรงตามเงื่อนไขที่กำหนด ผู้เล่นจะได้รับรางวัล <br />
        </p>
        <h2>2. กติกาในการชนะ</h2>
        <p>
          - การคำนวณรางวัลจะอิงจากเงื่อนไขดังนี้:
          <ul>
            <li>หากสัญลักษณ์ใน <strong>แถวใดแถวหนึ่ง</strong> เหมือนกันทั้งหมด จะได้รับรางวัล <strong>3 เท่า</strong></li>
            <li>หากสัญลักษณ์ใน <strong>คอลัมน์ใดคอลัมน์หนึ่ง</strong> เหมือนกันทั้งหมด จะได้รับรางวัล <strong>3 เท่า</strong></li>
            <li>
              หากสัญลักษณ์เรียง <strong>แนวทแยงมุม</strong> (ซ้ายบน-ขวาล่าง หรือ ขวาบน-ซ้ายล่าง) เหมือนกันทั้งหมด จะได้รับรางวัล
              <strong> 5 เท่า</strong>
            </li>
          </ul>
          - รางวัลคำนวณโดย: <strong>รางวัล × จำนวนเงินเดิมพัน</strong>
        </p>
        <h2>3. รายละเอียดโปเกมอนในเกม</h2>
        {loading ? (
          <p>กำลังโหลดข้อมูลโปเกมอน...</p>
        ) : (
          <div className="r-pokemon-rewards">
            {pokemonList.map((pokemon) => (
              <div key={pokemon.name} className="r-pokemon-item">
                <img src={pokemon.image} alt={pokemon.name} className="r-pokemon-image" />
                <p>
                  <strong>{pokemon.name}</strong>
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Rules;
