import express from 'express';
import bcrypt from 'bcryptjs';
import pool from '../config/database.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();
const ADMIN_ROLES = ['super_admin', 'unit_admin'];
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function getOwningSuperAdminId(connection, companyId) {
  const [admins] = await connection.execute(
    `SELECT id
     FROM business_partner
     WHERE company_id = ?
       AND role = 'super_admin'
       AND active = 1
     ORDER BY id ASC
     LIMIT 1`,
    [companyId]
  );

  if (admins.length === 0) {
    const error = new Error('No Super Admin found for this company');
    error.statusCode = 400;
    throw error;
  }

  return admins[0].id;
}

function validateEmployeePayload({ name, email, password }, { requirePassword }) {
  if (!name || !String(name).trim()) {
    return 'Name is required';
  }
  if (!email || !EMAIL_REGEX.test(String(email).trim())) {
    return 'A valid email is required';
  }
  if (requirePassword) {
    if (!password || String(password).length < 6) {
      return 'Password must be at least 6 characters long';
    }
  } else if (password && String(password).length < 6) {
    return 'Password must be at least 6 characters long';
  }
  return null;
}

router.get('/employees', requireAuth(ADMIN_ROLES), async (req, res) => {
  try {
    const companyId = req.auth.company_id;
    const q = String(req.query.q || '').trim();

    let sql = `
      SELECT
        id,
        name,
        email_id AS email,
        department,
        employee_code,
        active,
        last_login_at,
        created_at
      FROM user
      WHERE company_id = ?
        AND user_type = 'employee'
    `;
    const params = [companyId];

    if (q) {
      sql += ` AND (name LIKE ? OR email_id LIKE ? OR IFNULL(department, '') LIKE ?)`;
      const like = `%${q}%`;
      params.push(like, like, like);
    }

    sql += ` ORDER BY name ASC, id ASC`;

    const [rows] = await pool.execute(sql, params);
    return res.json({ success: true, data: rows });
  } catch (error) {
    console.error('List employees error:', error);
    return res.status(500).json({ success: false, message: 'Failed to load employees' });
  }
});

router.post('/employees', requireAuth(ADMIN_ROLES), async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const { name, email, password, department, employee_code } = req.body;
    const validationError = validateEmployeePayload({ name, email, password }, { requirePassword: true });
    if (validationError) {
      return res.status(400).json({ success: false, message: validationError });
    }

    const companyId = req.auth.company_id;
    const cleanEmail = String(email).trim();
    const owningPartnerId = await getOwningSuperAdminId(connection, companyId);
    const passwordHash = await bcrypt.hash(String(password), 12);

    const [existing] = await connection.execute(
      `SELECT id FROM user
       WHERE email_id = ? AND company_id = ? AND user_type = 'employee'`,
      [cleanEmail, companyId]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'An employee with this email already exists'
      });
    }

    const [result] = await connection.execute(
      `INSERT INTO user
        (email_id, name, organization, business_partner_id, user_type, company_id, password_hash, employee_code, department, active, created_at, updated_at)
       VALUES (?, ?, '', ?, 'employee', ?, ?, ?, ?, 1, NOW(), NOW())`,
      [
        cleanEmail,
        String(name).trim(),
        owningPartnerId,
        companyId,
        passwordHash,
        employee_code?.trim() || null,
        department?.trim() || null
      ]
    );

    return res.status(201).json({
      success: true,
      message: 'Employee created',
      data: { id: result.insertId, email: cleanEmail }
    });
  } catch (error) {
    console.error('Create employee error:', error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode ? error.message : 'Failed to create employee'
    });
  } finally {
    connection.release();
  }
});

router.put('/employees/:id', requireAuth(ADMIN_ROLES), async (req, res) => {
  try {
    const employeeId = Number(req.params.id);
    const companyId = req.auth.company_id;
    const { name, email, password, department, employee_code } = req.body;
    const validationError = validateEmployeePayload({ name, email, password }, { requirePassword: false });
    if (validationError) {
      return res.status(400).json({ success: false, message: validationError });
    }

    const cleanEmail = String(email).trim();

    const [existing] = await pool.execute(
      `SELECT id FROM user
       WHERE id = ? AND company_id = ? AND user_type = 'employee'`,
      [employeeId, companyId]
    );

    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    const [dup] = await pool.execute(
      `SELECT id FROM user
       WHERE email_id = ? AND company_id = ? AND user_type = 'employee' AND id != ?`,
      [cleanEmail, companyId, employeeId]
    );

    if (dup.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'An employee with this email already exists'
      });
    }

    if (password) {
      const passwordHash = await bcrypt.hash(String(password), 12);
      await pool.execute(
        `UPDATE user
         SET name = ?, email_id = ?, department = ?, employee_code = ?, password_hash = ?, updated_at = NOW()
         WHERE id = ? AND company_id = ? AND user_type = 'employee'`,
        [
          String(name).trim(),
          cleanEmail,
          department?.trim() || null,
          employee_code?.trim() || null,
          passwordHash,
          employeeId,
          companyId
        ]
      );
    } else {
      await pool.execute(
        `UPDATE user
         SET name = ?, email_id = ?, department = ?, employee_code = ?, updated_at = NOW()
         WHERE id = ? AND company_id = ? AND user_type = 'employee'`,
        [
          String(name).trim(),
          cleanEmail,
          department?.trim() || null,
          employee_code?.trim() || null,
          employeeId,
          companyId
        ]
      );
    }

    return res.json({ success: true, message: 'Employee updated' });
  } catch (error) {
    console.error('Update employee error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update employee' });
  }
});

router.patch('/employees/:id/status', requireAuth(ADMIN_ROLES), async (req, res) => {
  try {
    const employeeId = Number(req.params.id);
    const companyId = req.auth.company_id;
    const active = req.body.active === 1 || req.body.active === true || req.body.active === '1' ? 1 : 0;

    const [result] = await pool.execute(
      `UPDATE user
       SET active = ?, updated_at = NOW()
       WHERE id = ? AND company_id = ? AND user_type = 'employee'`,
      [active, employeeId, companyId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    return res.json({
      success: true,
      message: active ? 'Employee activated' : 'Employee deactivated'
    });
  } catch (error) {
    console.error('Employee status error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update status' });
  }
});

router.post('/employees/import', requireAuth(ADMIN_ROLES), async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const rows = Array.isArray(req.body.employees) ? req.body.employees : [];
    if (rows.length === 0) {
      return res.status(400).json({ success: false, message: 'No employees to import' });
    }
    if (rows.length > 1000) {
      return res.status(400).json({ success: false, message: 'Import is limited to 1000 rows at a time' });
    }

    const companyId = req.auth.company_id;
    const owningPartnerId = await getOwningSuperAdminId(connection, companyId);

    const created = [];
    const skipped = [];

    await connection.beginTransaction();

    for (let i = 0; i < rows.length; i += 1) {
      const row = rows[i] || {};
      const line = i + 1;
      const validationError = validateEmployeePayload(row, { requirePassword: true });
      if (validationError) {
        skipped.push({ line, email: row.email || '', reason: validationError });
        continue;
      }

      const cleanEmail = String(row.email).trim();
      const [existing] = await connection.execute(
        `SELECT id FROM user
         WHERE email_id = ? AND company_id = ? AND user_type = 'employee'`,
        [cleanEmail, companyId]
      );

      if (existing.length > 0) {
        skipped.push({ line, email: cleanEmail, reason: 'Email already exists' });
        continue;
      }

      const passwordHash = await bcrypt.hash(String(row.password), 12);
      const [result] = await connection.execute(
        `INSERT INTO user
          (email_id, name, organization, business_partner_id, user_type, company_id, password_hash, employee_code, department, active, created_at, updated_at)
         VALUES (?, ?, '', ?, 'employee', ?, ?, ?, ?, 1, NOW(), NOW())`,
        [
          cleanEmail,
          String(row.name).trim(),
          owningPartnerId,
          companyId,
          passwordHash,
          row.employee_code?.trim() || null,
          row.department?.trim() || null
        ]
      );

      created.push({ id: result.insertId, email: cleanEmail, line });
    }

    await connection.commit();

    return res.json({
      success: true,
      message: `Imported ${created.length} employee(s)`,
      data: { createdCount: created.length, skippedCount: skipped.length, skipped }
    });
  } catch (error) {
    await connection.rollback();
    console.error('Import employees error:', error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode ? error.message : 'Failed to import employees'
    });
  } finally {
    connection.release();
  }
});

export default router;
