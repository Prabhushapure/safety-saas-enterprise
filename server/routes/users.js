import express from 'express';
import pool from '../config/database.js';

const router = express.Router();

// GET /api/users - List users (optionally filter by q in name or email)
router.get('/', async (req, res) => {
  try {
    const { q } = req.query;

    if (q && String(q).trim().length > 0) {
      const like = `%${String(q).trim()}%`;
      const [rows] = await pool.execute(`
        SELECT id, name, email_id AS email, organization
        FROM user
        WHERE name LIKE ? OR email_id LIKE ?
        ORDER BY name ASC
      `, [like, like]);

      return res.json({ success: true, data: rows });
    }

    const [rows] = await pool.execute(`
      SELECT id, name, email_id AS email, organization
      FROM user
      ORDER BY name ASC
    `);

    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch users', error: error.message });
  }
});

export default router;


