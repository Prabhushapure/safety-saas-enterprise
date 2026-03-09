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

/**
 * ✅ POST /api/games/categories - Create new category
 */
router.post('/categories', async (req, res) => {
  try {
    const { category_name, category_description } = req.body;

    if (!category_name || !category_name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Category name is required',
      });
    }

    // Check duplicate
    const [exists] = await pool.execute(
      `SELECT id FROM game_category WHERE LOWER(category_name) = LOWER(?) AND bolActive = 1`,
      [category_name.trim()]
    );

    if (exists.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Category already exists',
      });
    }

    const [result] = await pool.execute(
      `INSERT INTO game_category (category_name, category_description, bolActive, dtmCreationDateTime)
       VALUES (?, ?, 1, NOW())`,
      [category_name.trim(), category_description?.trim() || null]
    );

    res.json({
      success: true,
      message: 'Category created successfully',
      data: {
        id: result.insertId,
        category_name: category_name.trim(),
        category_description: category_description?.trim() || null,
      },
    });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create category',
      error: error.message,
    });
  }
});

/**
 * ✅ POST /api/games/lists - Create Game List
 */
router.post('/lists', async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const { list_name, description, games } = req.body;

    if (!list_name || !list_name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'List name is required',
      });
    }

    await connection.beginTransaction();

    const [result] = await connection.execute(
      `INSERT INTO game_lists (list_name, description, bolActive, created_at)
       VALUES (?, ?, 1, NOW())`,
      [list_name.trim(), description?.trim() || null]
    );

    const listId = result.insertId;

    // Insert games
    if (Array.isArray(games) && games.length > 0) {
      const values = games.map((gameId) => [listId, gameId]);

      await connection.query(
        `INSERT INTO game_list_games (game_list_id, game_id)
         VALUES ?`,
        [values]
      );
    }

    await connection.commit();

    res.json({
      success: true,
      message: 'Game list created successfully',
      data: { listId },
    });

  } catch (error) {
    await connection.rollback();
    console.error('Create Game List Error:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to create game list',
      error: error.message,
    });
  } finally {
    connection.release();
  }
});

router.put('/lists/:id', async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const { id } = req.params;
    const { list_name, description, games } = req.body;

    await connection.beginTransaction();

    await connection.execute(
      `UPDATE game_lists
       SET list_name = ?, description = ?
       WHERE id = ?`,
      [list_name, description, id]
    );

    // Remove old mappings
    await connection.execute(
      `DELETE FROM game_list_games WHERE game_list_id = ?`,
      [id]
    );

    // Insert new games
    if (Array.isArray(games) && games.length > 0) {
      const values = games.map((gameId) => [id, gameId]);

      await connection.query(
        `INSERT INTO game_list_games (game_list_id, game_id)
         VALUES ?`,
        [values]
      );
    }

    await connection.commit();

    res.json({
      success: true,
      message: 'List updated successfully',
    });

  } catch (error) {
    await connection.rollback();
    console.error('Update List Error:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to update list',
      error: error.message,
    });
  } finally {
    connection.release();
  }
});

/**
 * ✅ GET /api/games/lists - Fetch all game lists
 */
router.get('/lists', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT 
gl.id,
gl.list_name,
gl.description,
COUNT(glg.game_id) AS game_count
FROM game_lists gl
LEFT JOIN game_list_games glg 
ON gl.id = glg.game_list_id
WHERE gl.bolActive = 1
GROUP BY gl.id
ORDER BY gl.list_name ASC`
    );

    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Fetch Game Lists Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch game lists',
      error: error.message,
    });
  }
});

/**
 * ✅ POST /api/games/companies/:companyId/lists
 */
router.post('/companies/:companyId/lists', async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const { companyId } = req.params;
    const { game_list_ids } = req.body;

    if (!Array.isArray(game_list_ids)) {
      return res.status(400).json({
        success: false,
        message: 'game_list_ids must be array',
      });
    }

    await connection.beginTransaction();

    // remove old mappings
    await connection.execute(
      `DELETE FROM company_game_lists WHERE company_id = ?`,
      [companyId]
    );

    // insert new ones
    if (game_list_ids.length > 0) {
      const values = game_list_ids.map(id => [companyId, id, new Date()]);

      await connection.query(
        `INSERT INTO company_game_lists 
        (company_id, game_list_id, created_at)
        VALUES ?`,
        [values]
      );
    }

    await connection.commit();

    res.json({
      success: true,
      message: 'Company lists updated successfully'
    });

  } catch (error) {
    await connection.rollback();
    console.error(error);

    res.status(500).json({
      success: false,
      message: 'Update failed'
    });
  } finally {
    connection.release();
  }
});

router.get('/company-lists', async (req, res) => {
  try {

    const [rows] = await pool.execute(`
      SELECT
        c.id AS company_id,
        c.company_name,
        gl.id AS list_id,
        gl.list_name
      FROM company c
      LEFT JOIN company_game_lists cgl
        ON c.id = cgl.company_id
      LEFT JOIN game_lists gl
        ON gl.id = cgl.game_list_id
      WHERE c.bolactive = 1
      ORDER BY c.company_name
    `);

    res.json({
      success: true,
      data: rows
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to load company lists"
    });
  }
});
/**
 * ✅ GET /api/games/companies/:companyId/lists
 */
router.get('/companies/:companyId/lists', async (req, res) => {
  try {
    const { companyId } = req.params;

    const [rows] = await pool.execute(
      `SELECT gl.id, gl.list_name, gl.description
       FROM game_lists gl
       JOIN company_game_lists cgl ON gl.id = cgl.game_list_id
       WHERE cgl.company_id = ?`,
      [companyId]
    );

    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Fetch Company Lists Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch company lists',
      error: error.message,
    });
  }
});

/**
 * GET Companies
 */
router.get('/companies', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT id, company_name, address, country
       FROM company
       WHERE bolactive = 1
       ORDER BY company_name ASC`
    );

    res.json({ success: true, data: rows });

  } catch (error) {
    console.error('Fetch Companies Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch companies',
      error: error.message
    });
  }
});

/**
 * ✅ GET /api/games/companies/:companyId/games
 * Return games allowed for that company
 */
router.get('/partner/:partnerId/games', async (req, res) => {
  try {
    const { partnerId } = req.params;

    const [rows] = await pool.execute(`
      SELECT
        ANY_VALUE(c.company_name) AS company_name,
        g.id,
        g.game_title,
        g.short_desc,
        g.long_desc,
        g.image_url,
        g.game_url,
        g.game_list_price,
        g.is_active,

        GROUP_CONCAT(gc.category_id) AS category_ids

      FROM business_partner bp

      JOIN company c
        ON bp.company_id = c.id

      JOIN company_game_lists cgl
        ON bp.company_id = cgl.company_id

      JOIN game_list_games glg
        ON cgl.game_list_id = glg.game_list_id

      JOIN game g
        ON glg.game_id = g.id

      LEFT JOIN game_x_category gc
        ON g.id = gc.game_id

      WHERE bp.id = ?

      GROUP BY g.id

      ORDER BY g.is_active DESC, g.game_title ASC
    `, [partnerId]);

    const companyName = rows.length > 0 ? rows[0].company_name : null;

    const games = rows.map(g => ({
      id: g.id,
      title: g.game_title,
      short_desc: g.short_desc,
      long_desc: g.long_desc,
      image_url: g.image_url,
      game_url: g.game_url,
      list_price: g.game_list_price,
      is_active: g.is_active,

      categories: g.category_ids
        ? g.category_ids.split(',').map(Number)
        : []
    }));

    res.json({
  success: true,
  company_name: companyName,
  data: games
});

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch games'
    });
  }
});

router.post('/companies', async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const { company_name, address } = req.body;

    await connection.beginTransaction();

    // Insert company
    const [result] = await connection.execute(
      `INSERT INTO company (company_name, address, bolactive, created_at)
       VALUES (?, ?, 1, NOW())`,
      [company_name, address]
    );

    const companyId = result.insertId;

  

    res.json({
      success: true,
      message: 'Company created successfully',
      id: companyId
    });

  } catch (error) {
    await connection.rollback();
    console.error(error);

    res.status(500).json({
      success: false,
      message: 'Failed to create company'
    });
  } finally {
    connection.release();
  }
});

router.put('/companies/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { company_name, address } = req.body;

    await pool.execute(
      `UPDATE company
       SET company_name = ?, address = ?
       WHERE id = ?`,
      [company_name, address, id]
    );

    res.json({
      success: true,
      message: 'Company updated'
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Failed to update company'
    });
  }
});
/**
 * ✅ POST /api/games/lists/:listId/games
 */
router.post('/lists/:listId/games', async (req, res) => {
  try {
    const { listId } = req.params;
    const { game_ids } = req.body;

    if (!Array.isArray(game_ids) || game_ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'game_ids must be a non-empty array',
      });
    }

    const values = game_ids.map((gameId) => [listId, gameId]);

    await pool.query(
      `INSERT IGNORE INTO game_list_games (game_list_id, game_id, created_at)
       VALUES ?`,
      [values]
    );

    res.json({
      success: true,
      message: 'Games added to list successfully',
    });
  } catch (error) {
    console.error('Add Games Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add games to list',
      error: error.message,
    });
  }
});

/**
 * ✅ GET /api/games/lists/:listId/games
 */
router.get('/lists/:listId/games', async (req, res) => {
  try {
    const { listId } = req.params;

    const [rows] = await pool.execute(
      `SELECT g.id, g.game_title, g.game_url, g.image_url, g.game_list_price
       FROM game g
       JOIN game_list_games glg ON g.id = glg.game_id
       WHERE glg.game_list_id = ?`,
      [listId]
    );

    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Fetch List Games Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch games in list',
      error: error.message,
    });
  }
});

/**
 * ✅ DELETE /api/games/lists/:listId/games/:gameId
 */
router.delete('/lists/:listId/games/:gameId', async (req, res) => {
  try {
    const { listId, gameId } = req.params;

    await pool.execute(
      `DELETE FROM game_list_games
       WHERE game_list_id = ? AND game_id = ?`,
      [listId, gameId]
    );

    res.json({
      success: true,
      message: 'Game removed from list successfully',
    });
  } catch (error) {
    console.error('Remove Game Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove game',
      error: error.message,
    });
  }
});

// Public catalog (trial list)
router.get('/public', async (req, res) => {
  try {

    const [rows] = await pool.execute(`
      SELECT 
       c.company_name,
        g.id,
        g.game_title,
        g.short_desc,
        g.long_desc,
        g.game_list_price,
        g.image_url,
        g.game_url,
        g.is_active,

        GROUP_CONCAT(gc.category_id) AS category_ids

      FROM company c

      JOIN company_game_lists cgl
        ON c.id = cgl.company_id

      JOIN game_list_games glg
        ON cgl.game_list_id = glg.game_list_id

      JOIN game g
        ON glg.game_id = g.id

      LEFT JOIN game_x_category gc
        ON g.id = gc.game_id

      WHERE LOWER(c.company_name) = 'Antiz'

      GROUP BY g.id, c.company_name

      ORDER BY g.is_active DESC, g.game_title ASC
    `);

    const companyName = rows.length > 0 ? rows[0].company_name : null;

    const games = rows.map(g => ({
      id: g.id,
      title: g.game_title,
      short_desc: g.short_desc,
      long_desc: g.long_desc,
      list_price: g.game_list_price,
      image_url: g.image_url,
      game_url: g.game_url,
      is_active: g.is_active,

      categories: g.category_ids
        ? g.category_ids.split(',').map(Number)
        : []
    }));

    res.json({
      success: true,
      company_name: companyName,
      data: games
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch public catalog"
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
