import express from 'express';
import pool from '../config/database.js';

const router = express.Router();

/**
 * ✅ GET /api/games - Fetch all games
 */
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT id, game_title, short_desc, long_desc, game_code, game_list_price, game_url, max_score_possible, image_url, is_active, game_category
       FROM game  ORDER BY is_active DESC, game_title ASC`
    );

    const transformed = rows.map(row => ({
      id: row.id,
      title: row.game_title,
      short_desc: row.short_desc,
      long_desc: row.long_desc,
      game_code: row.game_code, 
      game_list_price: row.game_list_price,
      game_url: row.game_url,
      game_category: row.game_category,
      max_score: row.max_score_possible,
      image_url: row.image_url || '/images/games/placeholder.png',
      is_active: row.is_active
    }));

    res.json({ success: true, data: transformed });
  } catch (error) {
    console.error('Error fetching games:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch games', error: error.message });
  }
});

/**
 * ✅ GET /api/games/:id - Fetch single game
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.execute(
      `SELECT id, game_title, short_desc, long_desc, game_list_price, image_url, game_code, game_url, max_score_possible 
       FROM game WHERE id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Game not found' });
    }

    const row = rows[0];
    const game = {
      id: row.id,
      title: row.game_title,
      short_desc: row.short_desc,
      long_desc: row.long_desc,
      game_list_price: row.game_list_price,
      game_code: row.game_code,
      game_url: row.game_url,
      max_score: row.max_score_possible,
      image_url: row.image_url || '/game_cards/placeholder.png',
    };

    res.json({ success: true, data: game });
  } catch (error) {
    console.error('Error fetching game:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch game', error: error.message });
  }
});

/**
 * ✅ POST /api/games - Add a new game
 */
router.post('/', async (req, res) => {
  try {
    const { title, short_desc, long_desc, image_url, game_list_price, game_code, game_url, max_score } = req.body;

    await pool.execute(
      `INSERT INTO game 
        (game_title, short_desc, long_desc, image_url, game_list_price, game_code, game_url, max_score_possible, is_active, game_version, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 1, 1, NOW())`,
      [title, short_desc, long_desc, image_url, game_list_price, game_code, game_url, max_score]
    );

    res.json({ success: true, message: 'Game added successfully' });
  } catch (error) {
    console.error('Error adding game:', error);
    res.status(500).json({ success: false, message: 'Failed to add game', error: error.message });
  }
});

/**
 * ✅ PUT /api/games/:id - Update an existing game
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, short_desc, long_desc, image_url, list_price, game_code, game_url, max_score } = req.body;

    const [result] = await pool.execute(
      `UPDATE game 
       SET game_title=?, short_desc=?, long_desc=?, image_url=?, game_list_price=?, game_code=?, game_url=?, max_score_possible=? 
       WHERE id=?`,
      [title, short_desc, long_desc, image_url, list_price, game_code, game_url, max_score, id]
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

/**
 * ✅ DELETE /api/games/:id - Soft delete a game (set is_active = 0)
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if game exists
    const [check] = await pool.execute(`SELECT id FROM game WHERE id = ? AND is_active = 1`, [id]);
    if (check.length === 0) {
      return res.status(404).json({ success: false, message: 'Game not found or already inactive' });
    }

    // Update is_active to 0 (soft delete)
    const [result] = await pool.execute(
      `UPDATE game SET is_active = 0 WHERE id = ?`,
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(400).json({ success: false, message: 'Failed to delete game' });
    }

    res.json({ success: true, message: 'Game deleted (is_active set to 0)' });
  } catch (error) {
    console.error('Error deleting game:', error);
    res.status(500).json({ success: false, message: 'Failed to delete game', error: error.message });
  }
});


export default router;
