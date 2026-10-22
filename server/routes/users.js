import express from 'express';
import pool from '../config/database.js';

const router = express.Router();

// GET /api/users - List users for a given business partner (filter optional)
router.get('/', async (req, res) => {
  try {
    const { q, businessPartnerId } = req.query;

    if (!businessPartnerId) {
      return res.status(400).json({ success: false, message: 'businessPartnerId is required' });
    }

    let sql = `
      SELECT id, name, email_id AS email, organization
      FROM user
      WHERE business_partner_id = ?
        AND user_type = 'partner_customer'
    `;
    const params = [businessPartnerId];

    if (q && String(q).trim().length > 0) {
      sql += ` AND (name LIKE ? OR email_id LIKE ?)`;
      const like = `%${String(q).trim()}%`;
      params.push(like, like);
    }

    sql += ` ORDER BY name ASC`;

    const [rows] = await pool.execute(sql, params);

    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch users', error: error.message });
  }
});


// POST /api/users - Create a new user for a business partner
router.post('/', async (req, res) => {
  try {
    const { name, email, organization, business_partner_id } = req.body;

    if (!name || !email || !business_partner_id) {
      return res.status(400).json({ success: false, message: 'Name, email, and businessPartnerId are required' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(String(email))) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address' });
    }

    const org = organization ?? '';

    // ✅ Check if this partner already has this email
    const [existingUser] = await pool.execute(
      `SELECT id FROM user WHERE email_id = ? AND business_partner_id = ?`,
      [String(email), business_partner_id]
    );

    if (existingUser.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'You have already created a user with this email.'
      });
    }

    // ✅ If not, insert a new record — even if another partner has created the same email
    const [result] = await pool.execute(
      `INSERT INTO user (email_id, name, organization, business_partner_id, created_at, updated_at)
       VALUES (?, ?, ?, ?, NOW(), NOW())`,
      [String(email), String(name), String(org), business_partner_id]
    );

    res.status(201).json({
      success: true,
      data: { id: result.insertId, name: String(name), email: String(email), organization: org }
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      // This should now only trigger if the same partner tries to insert twice
      return res.status(409).json({ success: false, message: 'User with this email already exists for this partner' });
    }
    console.error('Error creating user:', error);
    res.status(500).json({ success: false, message: 'Failed to create user', error: error.message });
  }
});


// PUT /api/users/:id - Edit an existing user
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, organization, business_partner_id } = req.body;

    if (!name || !email || !business_partner_id) {
      return res.status(400).json({ success: false, message: 'Name, email, and businessPartnerId are required' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(String(email))) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address' });
    }

    const org = organization ?? '';

    // ✅ Check if another user with the same email exists for the same partner
    const [existing] = await pool.execute(
      `SELECT id FROM user 
       WHERE email_id = ? AND business_partner_id = ? AND id != ?`,
      [String(email), business_partner_id, id]
    );

    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: 'A user with this email already exists under your partner' });
    }

    // ✅ Update the user
    const [result] = await pool.execute(
      `UPDATE user 
       SET name = ?, email_id = ?, organization = ?, updated_at = NOW()
       WHERE id = ? AND business_partner_id = ?`,
      [String(name), String(email), org, id, business_partner_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'User not found or not owned by your partner' });
    }

    res.json({
      success: true,
      data: { id, name: String(name), email: String(email), organization: org }
    });

  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ success: false, message: 'A user with this email already exists' });
    }
    console.error('Error updating user:', error);
    res.status(500).json({ success: false, message: 'Failed to update user', error: error.message });
  }
});


export default router;
