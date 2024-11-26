import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Pool } from 'pg';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import axios from 'axios';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET_KEY = process.env.SECRET_KEY || 'default_secret_key';

const db = new Pool({
  user: process.env.DATABASE_USER,
  host: process.env.DATABASE_HOST,
  database: process.env.DATABASE_NAME,
  password: process.env.DATABASE_PASSWORD,
  port: parseInt(process.env.DATABASE_PORT || '5432'),
});

// ฟังก์ชัน Retry Logic สำหรับการเชื่อมต่อ Database
const connectToDatabase = async () => {
  let retries = 5;
  while (retries > 0) {
    try {
      await db.connect();
      console.log('Connected to PostgreSQL');
      break;
    } catch (err) {
      console.error('Database connection failed. Retrying in 5 seconds...', err);
      retries -= 1;
      await new Promise((res) => setTimeout(res, 5000));
    }
  }
  if (retries === 0) {
    console.error('Failed to connect to the database after multiple retries.');
    process.exit(1);
  }
};

connectToDatabase();

// Middleware
app.use(cors({
  origin: '*', // หรือระบุโดเมนที่อนุญาต เช่น "http://localhost:3001"
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

interface AuthenticatedRequest extends Request {
  user?: {
    userId: number;
    role: string;
  };
}

// Middleware สำหรับตรวจสอบ JWT Token
function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY) as AuthenticatedRequest['user'];
    req.user = decoded; // เซ็ตค่า req.user
    next();
  } catch (err) {
    console.error('Token verification failed:', err);
    return res.status(403).json({ error: 'Invalid token.' });
  }
}


function authorizeRole(requiredRole: string) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userRole = req.user?.role;
    if (userRole !== requiredRole) {
      return res.status(403).json({ error: `Access denied for role: ${userRole}` });
    }
    next();
  };
}


// API สำหรับการลงทะเบียนผู้ใช้
app.post('/api/login', async (req: Request, res: Response) => {
  const { username, password } = req.body;

  try {
    const result = await db.query('SELECT * FROM jsusers WHERE username = $1', [username]);
    const user = result.rows[0];

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    const token = jwt.sign(
      { userId: user.id, username: user.username, role: 'user' }, // ระบุ role เป็น user
      SECRET_KEY,
      { expiresIn: '1h' }
    );

    res.status(200).json({ message: 'Login successful', token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// API สำหรับบันทึกการล็อกอิน
app.post('/api/record-login', authenticateToken, async (req: Request, res: Response) => {
  const user = (req as any).user; // ดึงข้อมูลผู้ใช้จาก token
  const userId = user.userId || null; // กรณี user
  const adminId = user.adminId || null; // กรณี admin

  try {
    // ตรวจสอบว่าเป็น user หรือ admin แล้วบันทึกในตาราง transactions
    await db.query(
      `INSERT INTO jstransactions (admin_id, user_id, amount, action_type) VALUES ($1, $2, $3, 'login')`,
      [adminId, userId, 0] // ใส่ adminId หรือ userId ตามที่มี และตั้ง amount เป็น 0
    );

    res.status(201).json({ message: 'Login recorded successfully.' });
  } catch (error) {
    console.error('Error recording login:', error);
    res.status(500).json({ error: 'Failed to record login.' });
  }
});

// API สำหรับการลงทะเบียนผู้ใช้
app.post('/api/register', async (req: Request, res: Response) => {
  const { username, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await db.query(
      'INSERT INTO jsusers (username, password, balance, win_rate, created_at) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [username, hashedPassword, 0, 30, new Date()]
    );

    res.status(201).json({ message: 'Registration successful. Please log in.', user: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// API สำหรับการลงทะเบียนผู้ดูแลระบบ
app.post('/api/register-admin', async (req: Request, res: Response) => {
  const { username, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await db.query(
      'INSERT INTO jsadmins (username, password, created_at) VALUES ($1, $2, $3) RETURNING *',
      [username, hashedPassword, new Date()]
    );

    res.status(201).json({ message: 'Admin registration successful.', admin: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// API สำหรับการล็อกอินผู้ดูแลระบบ
app.post('/api/admin-login', async (req: Request, res: Response) => {
  const { username, password } = req.body;

  try {
    const result = await db.query('SELECT * FROM jsadmins WHERE username = $1', [username]);
    const admin = result.rows[0];

    if (!admin) {
      return res.status(404).json({ error: 'Admin not found' });
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    const token = jwt.sign(
      { adminId: admin.admin_id, username: admin.username, role: 'admin' }, // ระบุ role เป็น admin
      SECRET_KEY,
      { expiresIn: '1h' }
    );

    res.status(200).json({ message: 'Admin login successful', token });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// API สำหรับดึงข้อมูลโปรไฟล์ผู้ใช้
app.get('/api/user-profile', authenticateToken, authorizeRole('user'), async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const result = await db.query('SELECT id, username, balance AS coins FROM jsusers WHERE id = $1', [userId]);
    const user = result.rows[0];

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({ username: user.username, coins: user.coins });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// ตัวแปรเก็บข้อมูล Pokémon
let pokemonCache: { name: string; image: string }[] = [];

// ฟังก์ชันโหลดภาพ Pokémon ล่วงหน้าจาก PokeAPI
const preloadPokemonImages = async (limit: number) => {
  console.log(`Preloading ${limit} Pokémon images...`);
  const uniqueIds = Array.from(new Set(Array.from({ length: limit }, (_, i) => i + 1))); // Unique IDs

  try {
    const responses = await Promise.allSettled(
      uniqueIds.map((id) => axios.get(`https://pokeapi.co/api/v2/pokemon/${id}`))
    );

    pokemonCache = responses
      .filter((result) => result.status === "fulfilled")
      .map((result: any) => ({
        name: result.value.data.name,
        image: result.value.data.sprites.front_default || "https://via.placeholder.com/96", // Fallback image
      }));

    console.log(`Successfully preloaded ${pokemonCache.length} Pokémon images.`);
  } catch (error) {
    console.error('Error preloading Pokémon images:', error.message || error);
  }
};

// โหลด Pokémon ล่วงหน้าก่อนเริ่มเซิร์ฟเวอร์
preloadPokemonImages(300); // โหลด 300 ตัว

// API สำหรับดึงภาพ Pokémon ทั้งหมดที่โหลดไว้
app.get('/api/pokemon-images', (req: Request, res: Response) => {
  if (pokemonCache.length === 0) {
    return res.status(500).json({ error: 'No Pokémon images preloaded.' });
  }
  res.json({ images: pokemonCache });
});

// API สำหรับการหมุนสล็อต
app.post('/api/spin-slot', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { betAmount } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(400).json({ error: 'Invalid or missing user ID' });
    }

    if (typeof betAmount !== 'number' || betAmount <= 0) {
      return res.status(400).json({ error: 'Invalid bet amount. Must be a positive number.' });
    }

    if (pokemonCache.length === 0) {
      return res.status(500).json({ error: 'Pokémon images are not loaded yet. Please try again later.' });
    }

    // ดึงข้อมูลผู้ใช้จากฐานข้อมูล
    const userResult = await db.query('SELECT balance, win_rate FROM jsusers WHERE id = $1', [userId]);
    const user = userResult.rows[0];

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const { balance, win_rate } = user;

    if (balance < betAmount) {
      return res.status(400).json({ error: 'Insufficient balance.' });
    }

    // สุ่มผลลัพธ์สล็อต
    const slots = generateRandomSlotsFromCache(win_rate);
    const reward = calculateRewardFromCache(slots, betAmount);

    // อัปเดตยอดเงินในฐานข้อมูล
    await db.query('UPDATE jsusers SET balance = balance - $1 + $2 WHERE id = $3', [betAmount, reward, userId]);

    res.status(200).json({ slots, reward, win: reward > 0 });
  } catch (error) {
    console.error('Error processing spin-slot request:', error.message || error);
    res.status(500).json({ error: 'An error occurred while processing the spin. Please try again.' });
  }
});



// ฟังก์ชันสำหรับสุ่มผลสล็อตจาก pokemonCache
const generateRandomSlotsFromCache = (winRate: number): { name: string; image: string }[][] => {
  const numRows = 3; // จำนวนแถว
  const numColumns = 3; // จำนวนคอลัมน์
  const slots: { name: string; image: string }[][] = [];

  const isWin = Math.random() * 100 < winRate; // ใช้ winRate เป็นเปอร์เซ็นต์ (0-100)

  let winningPokemon: { name: string; image: string } | null = null;
  if (isWin) {
    // หากชนะ เลือก Pokémon ที่จะใช้สำหรับการชนะ
    winningPokemon = pokemonCache[Math.floor(Math.random() * pokemonCache.length)];
  }

  // สร้างสล็อตสุ่ม
  for (let i = 0; i < numRows; i++) {
    const row = [];
    for (let j = 0; j < numColumns; j++) {
      const randomPokemon = pokemonCache[Math.floor(Math.random() * pokemonCache.length)];
      row.push(randomPokemon);
    }
    slots.push(row);
  }

  // หากชนะ ให้ปรับผลลัพธ์สล็อต
  if (isWin && winningPokemon) {
    const winPattern = Math.floor(Math.random() * 3); // 0 = ชนะในแถว, 1 = ชนะในคอลัมน์, 2 = ชนะในแนวทแยง

    if (winPattern === 0) {
      // ชนะในแถว (สุ่มเลือกแถว)
      const winningRow = Math.floor(Math.random() * numRows);
      for (let col = 0; col < numColumns; col++) {
        slots[winningRow][col] = winningPokemon;
      }
    } else if (winPattern === 1) {
      // ชนะในคอลัมน์ (สุ่มเลือกคอลัมน์)
      const winningCol = Math.floor(Math.random() * numColumns);
      for (let row = 0; row < numRows; row++) {
        slots[row][winningCol] = winningPokemon;
      }
    } else if (winPattern === 2) {
      // ชนะในแนวทแยง (สุ่มเลือกแนวทแยง)
      const diagonalType = Math.random() < 0.5 ? 'LTR' : 'RTL'; // Left-to-Right หรือ Right-to-Left
      for (let i = 0; i < numRows; i++) {
        if (diagonalType === 'LTR') {
          slots[i][i] = winningPokemon; // แนวทแยงจากซ้ายไปขวา
        } else {
          slots[i][numColumns - 1 - i] = winningPokemon; // แนวทแยงจากขวาไปซ้าย
        }
      }
    }
  }

  return slots;
};

// ฟังก์ชันสำหรับคำนวณรางวัลจาก pokemonCache
const calculateRewardFromCache = (
  slots: { name: string; image: string }[][],
  betAmount: number
): number => {
  let reward = 0;

  // ตรวจสอบการเรียงแนวนอน
  slots.forEach((row) => {
    const names = row.map((slot) => slot.name);
    if (new Set(names).size === 1) {
      reward += betAmount * 3;
    }
  });

  // ตรวจสอบการเรียงแนวตั้ง
  for (let col = 0; col < slots[0].length; col++) {
    const columnNames = slots.map((row) => row[col].name);
    if (new Set(columnNames).size === 1) {
      reward += betAmount * 3;
    }
  }

  // ตรวจสอบการเรียงแนวทแยง
  const diagonal1 = slots.map((row, i) => row[i].name);
  const diagonal2 = slots.map((row, i) => row[row.length - 1 - i].name);

  if (new Set(diagonal1).size === 1) {
    reward += betAmount * 5;
  }
  if (new Set(diagonal2).size === 1) {
    reward += betAmount * 5;
  }

  return reward;
};




// API บันทึก spin
app.post('/api/record-spin', authenticateToken, async (req: Request, res: Response) => {
  const { bet_amount, win_amount } = req.body;
  const user_id = req.user?.userId;

  // ตรวจสอบข้อมูลเบื้องต้น
  if (!user_id || typeof bet_amount !== 'number' || typeof win_amount !== 'number') {
    console.error(`[Error] Invalid data. user_id: ${user_id}, bet_amount: ${bet_amount}, win_amount: ${win_amount}`);
    return res.status(400).json({ error: 'Invalid data. Please ensure bet_amount and win_amount are numbers.' });
  }

  try {
    console.log(`[Info] Recording spin for user_id: ${user_id}. Bet: ${bet_amount}, Win: ${win_amount}`);

    // บันทึกการหมุนลงในตาราง jsspins
    await db.query(
      `INSERT INTO jsspins (user_id, bet_amount, win_amount, timestamp) VALUES ($1, $2, $3, $4)`,
      [user_id, bet_amount, win_amount, new Date()]
    );

    // บันทึกการทำธุรกรรมลงในตาราง jstransactions
    await db.query(
      `INSERT INTO jstransactions (user_id, amount, action_type) VALUES ($1, $2, 'spin')`,
      [user_id, win_amount]
    );

    // อัปเดตข้อมูลในตาราง jsplayer_statistics
    const isWin = win_amount > 0 ? 1 : 0;
    await db.query(
      `INSERT INTO jsplayer_statistics (user_id, total_spins, total_wins, total_win_amount, last_win_date)
       VALUES ($1, 1, $2, $3, $4)
       ON CONFLICT (user_id) DO UPDATE 
       SET 
         total_spins = jsplayer_statistics.total_spins + 1,
         total_wins = jsplayer_statistics.total_wins + $2,
         total_win_amount = jsplayer_statistics.total_win_amount + $3,
         last_win_date = $4`,
      [
        user_id,
        isWin, // ถ้าชนะให้เพิ่ม 1, ถ้าไม่ชนะให้เพิ่ม 0
        win_amount,
        new Date(),
      ]
    );

    console.log(`[Success] Spin recorded and statistics updated for user_id: ${user_id}`);
    res.status(201).json({ message: 'Spin recorded and statistics updated successfully.' });
  } catch (error) {
    console.error('Error recording spin:', error.message || error);
    res.status(500).json({ error: 'Failed to record spin.' });
  }
});




// API สำหรับอัปเดตยอดเงิน
app.post('/api/update-balance', authenticateToken, async (req: Request, res: Response) => {
  const { user_id, balance, action_type } = req.body;
  const requester_id = req.user?.id; // ID ของผู้ที่ทำคำขอ (Admin หรือ Player)
  const requester_role = req.user?.role; // Role ของผู้ที่ทำคำขอ ('admin' หรือ 'user')

  try {
    // ตรวจสอบข้อมูลเบื้องต้น
    if (!user_id || typeof user_id !== 'number') {
      console.error('Invalid user ID:', user_id);
      return res.status(400).json({ error: 'Invalid user ID. User ID must be a number.' });
    }

    if (typeof balance !== 'number' || isNaN(balance)) {
      console.error('Invalid balance:', balance);
      return res.status(400).json({ error: 'Invalid balance. Balance must be a number.' });
    }

    if (!action_type || !['admin_update', 'game_update'].includes(action_type)) {
      console.error('Invalid action type:', action_type);
      return res.status(400).json({ error: 'Invalid action type. Must be "admin_update" or "game_update".' });
    }

    // ตรวจสอบว่าผู้ใช้ที่ระบุมีอยู่ในระบบ
    const userCheck = await db.query('SELECT id, balance FROM jsusers WHERE id = $1', [user_id]);
    if (userCheck.rowCount === 0) {
      console.error(`User with ID "${user_id}" not found.`);
      return res.status(404).json({ error: `User with ID "${user_id}" not found.` });
    }

    const currentBalance = userCheck.rows[0].balance;

    // ตรวจสอบกรณียอดเงินติดลบสำหรับเกม
    if (action_type === 'game_update' && requester_role === 'user' && currentBalance + balance < 0) {
      console.error('Insufficient balance for user:', user_id);
      return res.status(400).json({ error: 'Insufficient balance.' });
    }

    // อัปเดตยอดเงินในฐานข้อมูล
    const updateResult = await db.query(
      `UPDATE jsusers SET balance = balance + $1 WHERE id = $2 RETURNING id, username, balance`,
      [balance, user_id]
    );

    if (updateResult.rowCount === 0) {
      console.error('Failed to update balance for user ID:', user_id);
      return res.status(500).json({ error: 'Failed to update balance.' });
    }

    const updatedUser = updateResult.rows[0];

    // บันทึกการทำรายการในตาราง transactions
    await db.query(
      `INSERT INTO jstransactions (user_id, admin_id, amount, action_type) VALUES ($1, $2, $3, $4)`,
      [
        user_id,
        requester_role === 'admin' ? requester_id : null, // บันทึก admin_id ถ้าเป็น Admin
        balance,
        action_type,
      ]
    );

    // ส่งผลลัพธ์กลับไปยัง client
    console.log('Balance updated successfully for user ID:', user_id);
    res.status(200).json({
      message: 'Balance updated successfully.',
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        new_balance: updatedUser.balance,
      },
    });
  } catch (error: any) {
    console.error('Error updating balance:', error.message || error);
    res.status(500).json({ error: 'Failed to update balance. Please try again later.' });
  }
});



app.post('/api/update-win-rate', authenticateToken, async (req: Request, res: Response) => {
  const { user_id, new_win_rate } = req.body;
  const admin_id = req.user.id; // ดึง admin_id จาก token

  try {
    // ตรวจสอบข้อมูล
    if (!user_id || new_win_rate === undefined || typeof new_win_rate !== 'number' || new_win_rate < 0 || new_win_rate > 100) {
      return res.status(400).json({ error: 'Invalid or missing user_id or new_win_rate. Win rate must be between 0 and 100.' });
    }

    // ดึงค่า win_rate ปัจจุบันของผู้ใช้
    const userQuery = await db.query('SELECT win_rate FROM jsusers WHERE id = $1', [user_id]);
    if (userQuery.rowCount === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }
    const currentWinRate = userQuery.rows[0].win_rate;

    // อัปเดต Win Rate ในตาราง users
    const updateResult = await db.query(
      `UPDATE jsusers SET win_rate = $1 WHERE id = $2 RETURNING id, username, win_rate`,
      [new_win_rate, user_id]
    );

    if (updateResult.rowCount === 0) {
      return res.status(404).json({ error: 'Failed to update win rate.' });
    }

    const updatedUser = updateResult.rows[0];

    // บันทึกใน transactions table
    await db.query(
      `INSERT INTO jstransactions (user_id, admin_id, amount, action_type, new_win_rate, previous_win_rate) 
       VALUES ($1, $2, 0, 'update_win_rate', $3, $4)`,
      [user_id, admin_id, new_win_rate, currentWinRate]
    );

    // ส่งผลลัพธ์กลับไปยัง client
    res.status(200).json({
      message: 'Win rate updated successfully.',
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        new_win_rate: updatedUser.win_rate,
      },
    });
  } catch (error) {
    console.error('Error updating win rate:', error);
    res.status(500).json({ error: 'Failed to update win rate.' });
  }
});



// API สำหรับดึงสถิติการเล่นของผู้เล่น
app.get('/api/player-statistics/:userId', authenticateToken, async (req: Request, res: Response) => {
  const { userId } = req.params;

  try {
    const result = await db.query('SELECT * FROM jsplayer_statistics WHERE user_id = $1', [userId]);
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Player statistics not found' });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching player statistics:', error);
    res.status(500).json({ error: 'Failed to fetch player statistics.' });
  }
});

// API สำหรับบันทึกการทำรายการของผู้ดูแลระบบ
app.post('/api/record-admin', authenticateToken, async (req: Request, res: Response) => {
  const { admin_id, user_id, amount, action_type, new_win_rate, previous_win_rate } = req.body;

  // ตรวจสอบว่าข้อมูลที่จำเป็นทั้งหมดถูกส่งมาจาก frontend
  if (!admin_id || !user_id || !amount || !action_type) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }

  try {
    // บันทึกข้อมูลลงในตาราง transactions
    await db.query(
      `INSERT INTO jstransactions (admin_id, user_id, amount, action_type, new_win_rate, previous_win_rate) 
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [admin_id, user_id, amount, action_type, new_win_rate || null, previous_win_rate || null]
    );

    res.status(201).json({ message: 'Admin action recorded successfully.' });
  } catch (error) {
    console.error('Error recording admin action:', error);
    res.status(500).json({ error: 'Failed to record admin action.' });
  }
});

// API สำหรับปรับอัตราการชนะ
app.post('/api/win-rate', authenticateToken, async (req: Request, res: Response) => {
  const { userId, newWinRate } = req.body;

  try {
    await db.query('UPDATE jsusers SET win_rate = $1 WHERE id = $2', [newWinRate, userId]);
    res.status(200).json({ message: 'Win rate updated successfully.' });
  } catch (error) {
    console.error('Error updating win rate:', error);
    res.status(500).json({ error: 'Failed to update win rate.' });
  }
});


// API สำหรับดึงข้อมูลจากตาราง users โดยเรียงลำดับจากใหม่ไปเก่า
app.get('/api/users', authenticateToken, authorizeRole('admin'), async (req: Request, res: Response) => {
  try {
    const result = await db.query(`
      SELECT id, username, balance, win_rate, created_at 
      FROM jsusers
      ORDER BY created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch user data' });
  }
});


// API สำหรับดึงข้อมูลจากตาราง transactions โดยเรียงลำดับจากใหม่ไปเก่า
app.get('/api/transactions', async (req: Request, res: Response) => {
  try {
    const result = await db.query(`
      SELECT transaction_id, admin_id, user_id, amount, action_type, new_win_rate, previous_win_rate, timestamp 
      FROM jstransactions
      ORDER BY timestamp DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Failed to fetch transaction data' });
  }
});

// API สำหรับดึงข้อมูลจากตาราง player_statistics โดยเรียงลำดับจากใหม่ไปเก่า
app.get('/api/player-statistics', async (req: Request, res: Response) => {
  try {
    const result = await db.query(`
      SELECT user_id, total_spins, total_wins, total_win_amount, last_win_date 
      FROM jsplayer_statistics
      ORDER BY last_win_date DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching player statistics:', error);
    res.status(500).json({ error: 'Failed to fetch player statistics data' });
  }
});

// API สำหรับดึงข้อมูลจากตาราง jsspins โดยเรียงลำดับจากใหม่ไปเก่า
app.get('/api/spins', async (req: Request, res: Response) => {
  try {
    const result = await db.query(`
      SELECT spin_id, user_id, bet_amount, win_amount, timestamp 
      FROM jsspins
      ORDER BY timestamp DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching spin data:', error);
    res.status(500).json({ error: 'Failed to fetch spin data' });
  }
});

// API เพื่อดึง README.md จาก GitHub
app.get("/api/readme", async (req, res) => {
  try {
    // ใช้ Raw URL ของไฟล์ README.md
    const response = await axios.get(
      "https://raw.githubusercontent.com/ARRUKlib/CT648_Pokamon_Slots/main/README.md"
    );
    res.send(response.data);
  } catch (error) {
    console.error("Error fetching README.md from GitHub:", error);
    res.status(500).json({ error: "Failed to fetch README.md from GitHub" });
  }
});



// เริ่มต้นเซิร์ฟเวอร์
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
