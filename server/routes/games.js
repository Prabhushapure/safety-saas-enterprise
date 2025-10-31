import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import pool from '../config/database.js';

const router = express.Router();

// Helper to get __dirname (since using ES Modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ POST /api/games/upload-image - Save base64 image
router.post('/upload-image', async (req, res) => {
  try {
    const { fileName, fileData } = req.body;

    if (!fileName || !fileData) {
      return res.status(400).json({ success: false, message: 'Missing fileName or fileData' });
    }

    const uploadDir = path.join(__dirname, '../../public/game_cards');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, fileName);
    fs.writeFileSync(filePath, Buffer.from(fileData, 'base64'));

    const imageUrl = `http://suraxa-safety.com:4000/public/game_cards/${fileName}`;
    res.json({ success: true, imageUrl });
  } catch (err) {
    console.error('Error saving image:', err);
    res.status(500).json({ success: false, message: 'Error saving image', error: err.message });
  }
});


// GET /api/games - Get all games
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT id, game_title, short_desc, long_desc, image_url, game_code, game_url FROM game ORDER BY id ASC');
    
    // Transform data to match frontend expectations
    const transformedRows = rows.map(row => ({
      id: row.id,
      title: row.game_title,
      short_desc: row.short_desc,
      long_desc: row.long_desc,
      image: row.image_url || '/game-placeholder.svg',
      game_code: row.game_code,
      game_url: row.game_url,
      is_featured: ['SAFETY_001', 'SAFETY_002', 'SAFETY_003', 'SAFETY_004'].includes(row.game_code)
    }));
    
    res.json({
      success: true,
      data: transformedRows
    });
  } catch (error) {
    console.error('Error fetching games:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch games',
      error: error.message
    });
  }
});


// GET /api/games/:id - Get a specific game
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.execute('SELECT id, game_title, short_desc, long_desc, image_url, game_code FROM game WHERE id = ?', [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Game not found'
      });
    }
    
    // Transform data to match frontend expectations
    const game = {
      id: rows[0].id,
      title: rows[0].game_title,
      short_desc: rows[0].short_desc,
      long_desc: rows[0].long_desc,
      image: rows[0].image_url || '/game-placeholder.svg',
      game_code: rows[0].game_code,
      is_featured: ['SAFETY_001', 'SAFETY_002', 'SAFETY_003', 'SAFETY_004'].includes(rows[0].game_code)
    };
    
    res.json({
      success: true,
      data: game
    });
  } catch (error) {
    console.error('Error fetching game:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch game',
      error: error.message
    });
  }
});

router.post('/', async (req, res) => {
  try {
    const { game_title, short_desc, long_desc, max_score, image_url, game_code, game_url } = req.body;

    await pool.execute(
      'INSERT INTO game (game_title, short_desc, long_desc, image_url, game_code, game_url, game_version, max_score_possible, is_active, created_at) VALUES (?, ?, ?, ?, ?, ?, 1, ?, 1, Now())',
      [game_title, short_desc, long_desc, image_url, game_code, game_url, max_score]
    );

    res.json({ success: true, message: 'Game added successfully' });
  } catch (error) {
    console.error('Error adding game:', error);
    res.status(500).json({ success: false, message: 'Failed to add game', error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { game_title, short_desc, long_desc, image_url, game_code, game_url } = req.body;

    const [result] = await pool.execute(
      'UPDATE game SET game_title=?, short_desc=?, long_desc=?, image_url=?, game_code=?, game_url=? WHERE id=?',
      [game_title, short_desc, long_desc, image_url, game_code, game_url, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Game not found' });
    }

    res.json({ success: true, message: 'Game updated successfully' });
  } catch (error) {
    console.error('Error updating game:', error);
    res.status(500).json({ success: false, message: 'Failed to update game', error: error.message });
  }
});

export default router;
