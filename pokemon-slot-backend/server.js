import bcrypt from 'bcrypt';
import express from 'express';
import pkg from 'pg';
const { Client } = pkg;
import cors from 'cors';
import bodyParser from 'body-parser';

const app = express();
const port = 3001;

app.use(cors());
app.use(bodyParser.json());

const client = new Client({
  host: '3.24.50.90',
  database: 'postgres',
  user: 'postgres',
  password: '123456789',
});

client.connect()
  .then(() => console.log('Connected to PostgreSQL'))
  .catch(err => console.error('Connection error', err.stack));

// เส้นทางหลัก
app.get('/', (req, res) => {
  res.send('Welcome to the Pokémon Battle API!');
});

// API endpoint สำหรับการหมุนสล็อต
app.post('/api/spin-slot', async (req, res) => {
  const { user_id } = req.body;
  const spinCost = 10;
  const winReward = 20;

  try {
    await client.query('BEGIN');

    const checkCoinsResult = await client.query(
      'UPDATE user_id SET coins = coins - $1 WHERE user_id = $2 AND coins >= $1 RETURNING coins',
      [spinCost, user_id]
    );

    if (checkCoinsResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'ไม่มีเครดิตจ๊ะ รบกวนเติมเงิน' });
    }

    // ดึงอัตราการชนะปัจจุบัน
    const winRateResult = await client.query('SELECT win_rate FROM game_settings LIMIT 1');
    const winRate = winRateResult.rows[0].win_rate / 100;

    // สุ่มว่าจะชนะหรือไม่
    const isWin = Math.random() < winRate;

    let slots;
    if (isWin) {
      // ถ้าชนะ, สุ่ม Pokemon ตัวเดียวกันทั้ง 3 ช่อง
      const winningPokemon = await client.query(`
        SELECT pok_name, pok_image 
        FROM pic_poke 
        WHERE pok_image IS NOT NULL
        ORDER BY RANDOM() 
        LIMIT 1
      `);
      slots = Array(3).fill(winningPokemon.rows[0]);
    } else {
      // ถ้าแพ้, สุ่ม Pokemon ทั้ง 3 ช่องแบบปกติ
      const slotResult = await client.query(`
        SELECT pok_name, pok_image 
        FROM pic_poke 
        WHERE pok_image IS NOT NULL
        ORDER BY RANDOM() 
        LIMIT 3
      `);
      slots = slotResult.rows;
    }

    // อัพเดตเหรียญหากชนะ
    if (isWin) {
      await client.query(
        'UPDATE user_id SET coins = coins + $1 WHERE user_id = $2',
        [winReward, user_id]
      );
    }

    // ดึงจำนวนเหรียญปัจจุบัน
    const currentCoinsResult = await client.query('SELECT coins FROM user_id WHERE user_id = $1', [user_id]);
    const currentCoins = currentCoinsResult.rows[0].coins;

    await client.query('COMMIT');

    res.json({ 
      slots: slots.map(slot => ({
        name: slot.pok_name.trim(),
        image: slot.pok_image ? `data:image/png;base64,${slot.pok_image.toString('base64')}` : null
      })),
      win: isWin,
      message: isWin ? "คุณชนะ" : "คุณแพ้",
      reward: isWin ? winReward : 0,
      currentCoins
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error spinning slot:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/pokemon-image/:name', async (req, res) => {
  const { name } = req.params;
  try {
    const result = await client.query('SELECT pok_image FROM pic_poke WHERE pok_name = $1', [name]);
    if (result.rows.length > 0 && result.rows[0].pok_image) {
      const base64Image = result.rows[0].pok_image.toString();
      res.json({ image: `data:image/png;base64,${base64Image}` });
    } else {
      res.status(404).send('Image not found');
    }
  } catch (error) {
    console.error('Error fetching pokemon image:', error);
    res.status(500).send('Internal server error');
  }
});

app.post('/api/topup', async (req, res) => {
  const { user_id, amount } = req.body;
  console.log('Received top-up request:', { user_id, amount });

  if (!user_id || !amount || amount <= 0) {
    return res.status(400).json({ success: false, message: 'Invalid user_id or amount' });
  }

  try {
    await client.query('BEGIN');

    const result = await client.query(
      'UPDATE user_id SET coins = COALESCE(coins, 0) + $1 WHERE user_id = $2 RETURNING coins',
      [amount, user_id]
    );

    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    await client.query('COMMIT');

    console.log(`Top-up successful for user ${user_id}. New balance: ${result.rows[0].coins}`);
    res.json({ success: true, newBalance: result.rows[0].coins });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Top-up error:', error);
    res.status(500).json({ success: false, message: 'An error occurred during top-up' });
  }
});

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const result = await client.query('SELECT user_id, pass FROM user_id WHERE user_name = $1', [username]);
    
    if (result.rows.length > 0) {
      const user = result.rows[0];
      const isPasswordValid = await bcrypt.compare(password, user.pass);
      
      if (isPasswordValid) {
        res.json({ success: true, user_id: user.user_id });
      } else {
        res.json({ success: false, message: 'Invalid username or password' });
      }
    } else {
      res.json({ success: false, message: 'Invalid username or password' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'An error occurred during login' });
  }
});

app.get('/api/user-coins', async (req, res) => {
  const { user_id } = req.query;
  console.log('Fetching coins for user:', user_id);

  try {
    const result = await client.query('SELECT coins FROM user_id WHERE user_id = $1', [user_id]);
    if (result.rows.length > 0) {
      console.log('User coins:', result.rows[0].coins);
      res.json({ coins: result.rows[0].coins });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    console.error('Error fetching user coins:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;

  try {
    const checkUserResult = await client.query('SELECT * FROM user_id WHERE user_name = $1', [username]);
    
    if (checkUserResult.rows.length > 0) {
      return res.status(400).json({ success: false, message: 'Username already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const insertUserResult = await client.query(
      'INSERT INTO user_id (user_name, pass) VALUES ($1, $2) RETURNING user_id',
      [username, hashedPassword]
    );

    res.status(201).json({ success: true, user_id: insertUserResult.rows[0].user_id });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'An error occurred during registration' });
  }
});

// เพิ่ม API endpoint สำหรับดึงอัตราการชนะ
app.get('/api/win-rate', async (req, res) => {
  try {
    const result = await client.query('SELECT win_rate FROM game_settings LIMIT 1');
    res.json({ winRate: result.rows[0].win_rate });
  } catch (error) {
    console.error('Error fetching win rate:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// เพิ่ม API endpoint สำหรับอัปเดตอัตราการชนะ
app.post('/api/update-win-rate', async (req, res) => {
  const { winRate } = req.body;
  if (winRate < 0 || winRate > 100) {
    return res.status(400).json({ error: 'Win rate must be between 0 and 100' });
  }
  try {
    await client.query('UPDATE game_settings SET win_rate = $1', [winRate]);
    res.json({ success: true, message: 'Win rate updated successfully' });
  } catch (error) {
    console.error('Error updating win rate:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// API สำหรับดึงข้อมูล users ทั้งหมด
app.get('/api/users', async (req, res) => {
  try {
    const result = await client.query('SELECT user_id, user_name FROM user_id');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
