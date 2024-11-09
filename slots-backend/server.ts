import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Pool } from 'pg';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

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

// ตรวจสอบการเชื่อมต่อกับฐานข้อมูล
db.connect((err) => {
  if (err) {
    console.error('Database connection error:', err.stack);
  } else {
    console.log('Connected to PostgreSQL');
  }
});

// Middleware
app.use(cors({
  origin: '*', // หรือระบุโดเมนที่อนุญาต เช่น "http://localhost:3001"
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Middleware
app.use(cors());
app.use(express.json());

interface AuthenticatedRequest extends Request {
  user?: any; // คุณสามารถระบุประเภทที่เฉพาะเจาะจงมากกว่านี้ตามโครงสร้างของ user
}

// Middleware สำหรับตรวจสอบ JWT Token
function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token.' });
    req.user = user; // เพิ่ม role และ userId ลงใน req.user
    next();
  });
}

function authorizeRole(requiredRole: string) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userRole = req.user?.role; // ดึง role จาก token
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
    const result = await db.query('SELECT * FROM users WHERE username = $1', [username]);
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
      `INSERT INTO transactions (admin_id, user_id, amount, action_type) VALUES ($1, $2, $3, 'login')`,
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
      'INSERT INTO users (username, password, balance, win_rate, created_at) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [username, hashedPassword, 0, 50, new Date()]
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
      'INSERT INTO admins (username, password, created_at) VALUES ($1, $2, $3) RETURNING *',
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
    const result = await db.query('SELECT * FROM admins WHERE username = $1', [username]);
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
    const result = await db.query('SELECT id, username, balance AS coins FROM users WHERE id = $1', [userId]);
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


// API สำหรับดึงข้อมูลภาพโปเกมอนทั้งหมด
app.get('/api/all-pokemon-images', async (req: Request, res: Response) => {
  try {
    const result = await db.query('SELECT name, image_url AS image, reward FROM pokemon');
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching all Pokémon images:', error);
    res.status(500).json({ error: 'Failed to fetch Pokémon images' });
  }
});

// API สำหรับการหมุนสล็อต
app.post('/api/spin-slot', authenticateToken, async (req: Request, res: Response) => {
  const { betAmount } = req.body; // รับยอดเดิมพันจากคำขอ
  const userId = (req as any).user.userId; // ดึง userId จาก JWT token

  try {
    const slots = await generateRandomSlots(); // ฟังก์ชันสำหรับสุ่มสล็อต
    const reward = await calculateReward(slots, betAmount); // คำนวณรางวัล

    // อัปเดตยอดเงินของผู้ใช้
    await db.query('UPDATE users SET balance = balance + $1 WHERE id = $2', [reward, userId]);

    res.json({ slots, reward, win: reward > 0 });
  } catch (error) {
    console.error("Error handling spin-slot request:", error);
    res.status(500).json({ error: 'An error occurred during the spin-slot request' });
  }
});

// ฟังก์ชันสำหรับสุ่มสล็อต
const generateRandomSlots = async (): Promise<any[]> => {
  const pokemonList = await db.query('SELECT name, image_url AS image, reward FROM pokemon');
  if (!pokemonList.rows.length) {
    throw new Error('No Pokémon data found in the database.');
  }

  const numRows = 3;
  const numColumns = 3;
  const slots = [];

  for (let i = 0; i < numRows; i++) {
    const row = [];
    for (let j = 0; j < numColumns; j++) {
      const randomPokemon = pokemonList.rows[Math.floor(Math.random() * pokemonList.rowCount)];
      row.push(randomPokemon);
    }
    slots.push(row);
  }

  return slots;
};

// ฟังก์ชันสำหรับคำนวณรางวัล
const calculateReward = async (slots: any[][], betAmount: number): Promise<number> => {
  let reward = 0;
  const pokemonList = await db.query('SELECT name, reward FROM pokemon');
  const bonusSymbol = pokemonList.rows.find(pokemon => pokemon.name === 'Pikachu');
  const wildSymbol = pokemonList.rows.find(pokemon => pokemon.name === 'Jigglypuff');

  if (!bonusSymbol || !wildSymbol) {
    throw new Error('Bonus or Wild symbols not found in database.');
  }

  const firstRowSymbols = slots[0].map(slot => slot.name);
  const allReelMatch = firstRowSymbols.every(symbol => symbol === firstRowSymbols[0]);
  if (allReelMatch) {
    reward += bonusSymbol.reward * betAmount;
  }

  for (let row of slots) {
    const symbols = row.map(slot => slot.name);
    const uniqueSymbols = Array.from(new Set(symbols));
    if (uniqueSymbols.length === 1) {
      reward += 2 * row[0].reward * betAmount;
    }
  }

  const totalBonusCount = slots.flat().filter(slot => slot.name === bonusSymbol.name).length;
  if (totalBonusCount === 9) {
    reward += 3 * bonusSymbol.reward * betAmount;
  }

  for (let row of slots) {
    const bonusCount = row.filter(slot => slot.name === bonusSymbol.name).length;
    if (bonusCount === 3) {
      reward += 4 * bonusSymbol.reward * betAmount;
    }
  }

  return reward;
};

// API บันทึก spin
app.post('/api/record-spin', authenticateToken, async (req: Request, res: Response) => {
  const { bet_amount, win_amount } = req.body;
  const user_id = req.user.id;

  if (!user_id || typeof bet_amount !== 'number' || typeof win_amount !== 'number') {
    return res.status(400).json({ error: 'Invalid or missing data.' });
  }

  try {
    await db.query(
      `INSERT INTO transactions (user_id, amount, action_type) VALUES ($1, $2, 'spin')`,
      [user_id, win_amount]
    );

    await db.query(
      `INSERT INTO spins (user_id, bet_amount, win_amount, timestamp) VALUES ($1, $2, $3, $4)`,
      [user_id, bet_amount, win_amount, new Date()]
    );

    await db.query(
      `INSERT INTO player_statistics (user_id, total_spins, total_wins, total_win_amount, last_win_date)
       VALUES ($1, 1, $2, $3, $4)
       ON CONFLICT (user_id) DO UPDATE 
       SET 
         total_spins = player_statistics.total_spins + 1,
         total_wins = player_statistics.total_wins + $2,
         total_win_amount = player_statistics.total_win_amount + $3,
         last_win_date = $4`,
      [
        user_id,
        win_amount > 0 ? 1 : 0,
        win_amount,
        new Date(),
      ]
    );

    res.status(201).json({ message: 'Spin recorded successfully.' });
  } catch (error) {
    console.error('Error recording spin:', error);
    res.status(500).json({ error: 'Failed to record spin.' });
  }
});



// API สำหรับอัปเดตยอดเงิน
app.post('/api/update-balance', authenticateToken, async (req: Request, res: Response) => {
  const { user_id, balance } = req.body; // รับ user_id และ balance จาก body
  const admin_id = req.user.id; // ดึง admin_id จาก token

  try {
    // ตรวจสอบว่า user_id และ balance ถูกต้อง
    if (!user_id || balance === undefined || typeof balance !== 'number' || isNaN(balance)) {
      return res.status(400).json({ error: 'Invalid or missing user_id or balance.' });
    }

    // ตรวจสอบว่าผู้ใช้ที่ระบุมีอยู่ในระบบ
    const userCheck = await db.query('SELECT id FROM users WHERE id = $1', [user_id]);
    if (userCheck.rowCount === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // อัปเดตยอดเงินของผู้ใช้ในฐานข้อมูล
    const updateResult = await db.query(
      `UPDATE users SET balance = balance + $1 WHERE id = $2 RETURNING id, username, balance`,
      [balance, user_id]
    );

    const updatedUser = updateResult.rows[0];

    // บันทึกการทำรายการในตาราง transactions
    await db.query(
      `INSERT INTO transactions (user_id, admin_id, amount, action_type) VALUES ($1, $2, $3, 'update_balance')`,
      [user_id, admin_id, balance]
    );

    // ส่งข้อมูลผู้ใช้ที่อัปเดตกลับไปยัง client
    res.status(200).json({
      message: 'Balance updated successfully.',
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        new_balance: updatedUser.balance,
      },
    });
  } catch (error) {
    console.error('Error updating balance:', error);
    res.status(500).json({ error: 'Failed to update balance.' });
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
    const userQuery = await db.query('SELECT win_rate FROM users WHERE id = $1', [user_id]);
    if (userQuery.rowCount === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }
    const currentWinRate = userQuery.rows[0].win_rate;

    // อัปเดต Win Rate ในตาราง users
    const updateResult = await db.query(
      `UPDATE users SET win_rate = $1 WHERE id = $2 RETURNING id, username, win_rate`,
      [new_win_rate, user_id]
    );

    if (updateResult.rowCount === 0) {
      return res.status(404).json({ error: 'Failed to update win rate.' });
    }

    const updatedUser = updateResult.rows[0];

    // บันทึกใน transactions table
    await db.query(
      `INSERT INTO transactions (user_id, admin_id, amount, action_type, new_win_rate, previous_win_rate) 
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
    const result = await db.query('SELECT * FROM player_statistics WHERE user_id = $1', [userId]);
    
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
      `INSERT INTO transactions (admin_id, user_id, amount, action_type, new_win_rate, previous_win_rate) 
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
    await db.query('UPDATE users SET win_rate = $1 WHERE id = $2', [newWinRate, userId]);
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
      FROM users
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
      FROM transactions
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
      FROM player_statistics
      ORDER BY last_win_date DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching player statistics:', error);
    res.status(500).json({ error: 'Failed to fetch player statistics data' });
  }
});




// เริ่มต้นเซิร์ฟเวอร์
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
