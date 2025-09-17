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

// POST /api/users - Create a new user
router.post('/', async (req, res) => {
  try {
    const { name, email, organization } = req.body;

    if (!name || !email) {
      return res.status(400).json({ success: false, message: 'Name and email are required' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(String(email))) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address' });
    }

    const org = organization ?? '';

    const [result] = await pool.execute(
      `INSERT INTO user (email_id, name, organization, created_at, updated_at)
       VALUES (?, ?, ?, NOW(), NOW())`,
      [String(email), String(name), String(org)]
    );

    res.status(201).json({
      success: true,
      data: { id: result.insertId, name: String(name), email: String(email), organization: org }
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ success: false, message: 'A user with this email already exists' });
    }
    console.error('Error creating user:', error);
    res.status(500).json({ success: false, message: 'Failed to create user', error: error.message });
  }
});


