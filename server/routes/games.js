import express from 'express';
import pool from '../config/database.js';

const router = express.Router();


/**
 * ✅ GET /api/games/categories - Fetch all active categories
 */
router.get('/categories', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT id, category_name, category_description
       FROM game_category
       WHERE bolActive = 1
       ORDER BY category_name ASC`
    );

    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories',
      error: error.message,
    });
  }
});

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT 
        g.id,
        g.game_title,
        g.short_desc,
        g.long_desc,
        g.game_code,
        g.game_list_price,
        g.game_url,
        g.max_score_possible,
        g.image_url,
        g.is_active,

        GROUP_CONCAT(gc.category_id) AS category_ids,
        GROUP_CONCAT(c.category_name) AS category_names

      FROM game g
      LEFT JOIN game_x_category gc ON g.id = gc.game_id
      LEFT JOIN game_category c ON gc.category_id = c.id

      GROUP BY g.id
      ORDER BY g.is_active DESC, g.game_title ASC
    `);

    const transformed = rows.map((row) => ({
      id: row.id,
      title: row.game_title,
      short_desc: row.short_desc,
      long_desc: row.long_desc,
      game_code: row.game_code,
      list_price: row.game_list_price,
      game_url: row.game_url,
      max_score: row.max_score_possible,
      image_url: row.image_url || '/images/games/placeholder.png',
      is_active: row.is_active,

      // IMPORTANT: convert string "1,2,3" to [1,2,3]
      categories: row.category_ids
        ? row.category_ids.split(',').map((x) => Number(x))
        : [],

      category_names: row.category_names
        ? row.category_names.split(',')
        : [],
    }));

    res.json({ success: true, data: transformed });
  } catch (error) {
    console.error('Error fetching games:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch games',
      error: error.message,
    });
  }
});


router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.execute(
      `SELECT 
        id, game_title, short_desc, long_desc, game_list_price, image_url,
        game_code, game_url, max_score_possible
       FROM game
       WHERE id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Game not found' });
    }

    // fetch category ids for this game
    const [catRows] = await pool.execute(
      `SELECT category_id
       FROM game_x_category
       WHERE game_id = ?`,
      [id]
    );

    const categories = catRows.map((r) => r.category_id);

    const row = rows[0];

    const game = {
      id: row.id,
      title: row.game_title,
      short_desc: row.short_desc,
      long_desc: row.long_desc,
      list_price: row.game_list_price,
      game_code: row.game_code,
      game_url: row.game_url,
      max_score: row.max_score_possible,
      image_url: row.image_url || '/game_cards/placeholder.png',

      // NEW
      categories,
    };

    res.json({ success: true, data: game });
  } catch (error) {
    console.error('Error fetching game:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch game',
      error: error.message,
    });
  }
});

router.post('/', async (req, res) => {
  try {
    const {
      title,
      short_desc,
      long_desc,
      image_url,
      list_price,
      game_code,
      game_url,
      max_score,
      categories, // NEW
    } = req.body;

    // Insert into game table
    const [result] = await pool.execute(
      `INSERT INTO game 
        (game_title, short_desc, long_desc, image_url, game_list_price, game_code, game_url, max_score_possible, is_active, game_version, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, 1, NOW())`,
      [title, short_desc, long_desc, image_url, list_price, game_code, game_url, max_score]
    );

    const gameId = result.insertId;

    // Insert mapping rows
    if (Array.isArray(categories) && categories.length > 0) {
      const values = categories.map((catId) => [gameId, catId]);

      await pool.query(
        `INSERT INTO game_x_category (game_id, category_id)
         VALUES ?`,
        [values]
      );
    }

    res.json({ success: true, message: 'Game added successfully' });
  } catch (error) {
    console.error('Error adding game:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add game',
      error: error.message,
    });
  }
});

/**
 * ✅ PUT /api/games/:id - Update an existing game
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const {
      title,
      short_desc,
      long_desc,
      image_url,
      list_price,
      game_code,
      game_url,
      max_score,
      categories, // NEW
    } = req.body;

    const [result] = await pool.execute(
      `UPDATE game 
       SET game_title=?, short_desc=?, long_desc=?, image_url=?, game_list_price=?, game_code=?, game_url=?, max_score_possible=? 
       WHERE id=?`,
      [title, short_desc, long_desc, image_url, list_price, game_code, game_url, max_score, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Game not found' });
    }

    // Delete old mappings
    await pool.execute(`DELETE FROM game_x_category WHERE game_id = ?`, [id]);

    // Insert new mappings
    if (Array.isArray(categories) && categories.length > 0) {
      const values = categories.map((catId) => [id, catId]);

      await pool.query(
        `INSERT INTO game_x_category (game_id, category_id)
         VALUES ?`,
        [values]
      );
    }

    res.json({ success: true, message: 'Game updated successfully' });
  } catch (error) {
    console.error('Error updating game:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update game',
      error: error.message,
    });
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
