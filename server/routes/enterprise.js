import express from 'express';
import bcrypt from 'bcryptjs';
import pool from '../config/database.js';
import { requireAuth } from '../middleware/auth.js';
import { buildAuthPayload, signAuthToken, toPublicProfile } from '../utils/jwt.js';
import { normalizeSlug } from '../utils/companySlug.js';
import { getCatalogForCompany } from '../utils/companyCatalog.js';
import enterpriseEmployeesRouter from './enterpriseEmployees.js';

const router = express.Router();

const ADMIN_ROLES = ['super_admin', 'unit_admin'];

router.use(enterpriseEmployeesRouter);

async function recordLogin(email, req) {
  try {
    await pool.execute(
      `INSERT INTO login_tracker (email_id, login_time, ip_addr, device)
       VALUES (?, NOW(), ?, ?)`,
      [
        email,
        req.ip || null,
        (req.headers['user-agent'] || '').slice(0, 255) || null
      ]
    );
  } catch (error) {
    console.error('login_tracker insert failed:', error.message);
  }
}

router.post('/:slug/login', async (req, res) => {
  try {
    const slug = normalizeSlug(req.params.slug);
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    const [rows] = await pool.execute(
      `SELECT
         bp.id,
         bp.company_id,
         bp.first_name,
         bp.last_name,
         bp.login_id,
         bp.password,
         bp.active,
         bp.role,
         bp.country,
         bp.subscription_plan_id,
         c.company_name,
         c.account_type,
         c.company_slug,
         c.bolactive
       FROM business_partner bp
       JOIN company c ON bp.company_id = c.id
       WHERE bp.login_id = ?
         AND c.company_slug = ?
         AND c.account_type = 'enterprise'`,
      [email, slug]
    );

    if (rows.length > 0) {
      const user = rows[0];

      if (user.bolactive != 1) {
        return res.status(403).json({
          success: false,
          message: 'This enterprise account is inactive.'
        });
      }

      if (user.active != 1) {
        return res.status(403).json({
          success: false,
          message: 'Your account is inactive.'
        });
      }

      if (!ADMIN_ROLES.includes(user.role)) {
        return res.status(403).json({
          success: false,
          message: 'This login is for enterprise administrators.'
        });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      const token = signAuthToken(buildAuthPayload(user));
      await recordLogin(user.login_id, req);

      return res.json({
        success: true,
        message: 'Login successful',
        data: toPublicProfile(user, token)
      });
    }

    const [employees] = await pool.execute(
      `SELECT
         u.id,
         u.name,
         u.email_id,
         u.password_hash,
         u.active,
         u.company_id,
         u.business_partner_id,
         c.company_name,
         c.account_type,
         c.company_slug,
         c.bolactive
       FROM user u
       JOIN company c ON u.company_id = c.id
       WHERE u.email_id = ?
         AND u.user_type = 'employee'
         AND c.company_slug = ?
         AND c.account_type = 'enterprise'`,
      [email, slug]
    );

    if (employees.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const user = {
      ...employees[0],
      role: 'employee',
      subjectType: 'user'
    };

    if (user.bolactive != 1) {
      return res.status(403).json({
        success: false,
        message: 'This enterprise account is inactive.'
      });
    }

    if (user.active != 1) {
      return res.status(403).json({
        success: false,
        message: 'Your account is inactive.'
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash || user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const token = signAuthToken(buildAuthPayload(user));
    await recordLogin(user.email_id, req);
    await pool.execute(
      `UPDATE user SET last_login_at = NOW() WHERE id = ? AND user_type = 'employee'`,
      [user.id]
    );

    return res.json({
      success: true,
      message: 'Login successful',
      data: toPublicProfile(user, token)
    });
  } catch (error) {
    console.error('Enterprise login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Login failed. Please try again.'
    });
  }
});

router.get('/me/games', requireAuth(['super_admin', 'unit_admin', 'employee']), async (req, res) => {
  try {
    const companyId = req.auth.company_id;
    if (!companyId) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    const { companyName, games } = await getCatalogForCompany(pool, companyId, {
      activeOnly: req.auth.role === 'employee'
    });

    return res.json({
      success: true,
      company_name: companyName,
      data: games
    });
  } catch (error) {
    console.error('Enterprise catalog error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to load games'
    });
  }
});

router.get('/me', requireAuth(['super_admin', 'unit_admin', 'employee']), async (req, res) => {
  try {
    if (req.auth.role === 'employee') {
      const [rows] = await pool.execute(
        `SELECT
           u.id,
           u.name,
           u.email_id,
           u.company_id,
           u.business_partner_id,
           u.active,
           c.company_name,
           c.account_type,
           c.company_slug,
           c.bolactive
         FROM user u
         JOIN company c ON u.company_id = c.id
         WHERE u.id = ?
           AND u.user_type = 'employee'`,
        [req.auth.sub]
      );

      if (rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Account not found' });
      }

      const user = { ...rows[0], role: 'employee', subjectType: 'user' };
      if (Number(user.company_id) !== Number(req.auth.company_id) || user.active != 1) {
        return res.status(403).json({ success: false, message: 'Forbidden' });
      }

      return res.json({ success: true, data: toPublicProfile(user) });
    }

    const [rows] = await pool.execute(
      `SELECT
         bp.id,
         bp.company_id,
         bp.first_name,
         bp.last_name,
         bp.login_id,
         bp.role,
         bp.country,
         bp.subscription_plan_id,
         c.company_name,
         c.account_type,
         c.company_slug,
         c.bolactive
       FROM business_partner bp
       JOIN company c ON bp.company_id = c.id
       WHERE bp.id = ?`,
      [req.auth.business_partner_id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Account not found'
      });
    }

    const user = rows[0];

    if (Number(user.company_id) !== Number(req.auth.company_id)) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden'
      });
    }

    return res.json({
      success: true,
      data: toPublicProfile(user)
    });
  } catch (error) {
    console.error('Enterprise me error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to load profile'
    });
  }
});

export default router;
