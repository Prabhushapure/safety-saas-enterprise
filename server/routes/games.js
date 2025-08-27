import express from 'express';
import pool from '../config/database.js';

const router = express.Router();

// GET /api/games - Get all games
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT id, game_title, short_desc, long_desc, image_url, game_code FROM game ORDER BY id ASC');
    
    // Transform data to match frontend expectations
    const transformedRows = rows.map(row => ({
      id: row.id,
      title: row.game_title,
      short_desc: row.short_desc,
      long_desc: row.long_desc,
      image: row.image_url || '/game-placeholder.svg',
      game_code: row.game_code,
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

export default router;
