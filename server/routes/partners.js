import express from 'express';
import pool from '../config/database.js';

const router = express.Router();

router.get('/summary', async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT
        bp.id AS id,
        CONCAT(bp.first_name, ' ', bp.last_name) AS partner_name,
        COALESCE(c.company_name, '') AS partner_company,
        COALESCE(c.country, bp.country, '') AS partner_country,
        bp.subscription_plan_id AS subscription_id,
        bp.active as is_active,
        (SELECT COUNT(*) FROM user u WHERE u.business_partner_id = bp.id) AS users_count,
        (SELECT COUNT(*) FROM license l WHERE l.business_partner_id = bp.id) AS tokens_sent,
        (SELECT COUNT(*) FROM license l WHERE l.business_partner_id = bp.id AND l.status = 'used') AS tokens_used
      FROM business_partner bp
      LEFT JOIN company c ON c.id = bp.company_id
      ORDER BY partner_name ASC
    `);

    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch partner summary',
      error: error.message
    });
  }
});

export default router;
