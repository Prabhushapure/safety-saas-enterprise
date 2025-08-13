import express from 'express';
import bcrypt from 'bcryptjs';
import pool from '../config/database.js';

const router = express.Router();

// Helper function to generate company code
const generateCompanyCode = (companyName) => {
  const cleaned = companyName.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  const timestamp = Date.now().toString().slice(-4);
  return `${cleaned.substring(0, 8)}_${timestamp}`;
};

// Helper function to generate business partner ID
const generateBusinessPartnerId = (firstName, lastName, companyCode) => {
  const firstInitial = firstName.charAt(0).toUpperCase();
  const lastCleaned = lastName.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  const timestamp = Date.now().toString().slice(-6);
  return `${companyCode}_${firstInitial}${lastCleaned.substring(0, 6)}_${timestamp}`;
};

// POST /api/auth/register - Register new business partner and company
router.post('/register', async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      companyName,
      address,
      city,
      country
    } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !password || !companyName || !address || !city || !country) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email address'
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    await connection.beginTransaction();

    // Check if email already exists
    const [existingUsers] = await connection.execute(
      'SELECT login_id FROM business_partner WHERE login_id = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      await connection.rollback();
      return res.status(409).json({
        success: false,
        message: 'Email already registered'
      });
    }

    // Generate company code
    const companyCode = generateCompanyCode(companyName);

    // Check if company code already exists (unlikely but possible)
    const [existingCompanies] = await connection.execute(
      'SELECT company_code FROM company WHERE company_code = ?',
      [companyCode]
    );

    if (existingCompanies.length > 0) {
      await connection.rollback();
      return res.status(409).json({
        success: false,
        message: 'Company registration failed. Please try again.'
      });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert company record
    await connection.execute(
      'INSERT INTO company (company_code, company_name, address, city, country) VALUES (?, ?, ?, ?, ?)',
      [companyCode, companyName, address, city, country]
    );

    // Generate business partner ID
    const businessPartnerId = generateBusinessPartnerId(firstName, lastName, companyCode);

    // Insert business partner record
    await connection.execute(
      'INSERT INTO business_partner (business_partner_id, company_code, first_name, last_name, login_id, password) VALUES (?, ?, ?, ?, ?, ?)',
      [businessPartnerId, companyCode, firstName, lastName, email, hashedPassword]
    );

    await connection.commit();

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        businessPartnerId,
        companyCode,
        firstName,
        lastName,
        email,
        companyName
      }
    });

  } catch (error) {
    await connection.rollback();
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed. Please try again.',
      error: error.message
    });
  } finally {
    connection.release();
  }
});

// POST /api/auth/login - Login business partner
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find business partner by email
    const [users] = await pool.execute(`
      SELECT 
        bp.id,
        bp.business_partner_id,
        bp.company_code,
        bp.first_name,
        bp.last_name,
        bp.login_id,
        bp.password,
        c.company_name,
        c.city,
        c.country
      FROM business_partner bp
      JOIN company c ON bp.company_code = c.company_code
      WHERE bp.login_id = ?
    `, [email]);

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const user = users[0];

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Return user data (excluding password)
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        id: user.id,
        businessPartnerId: user.business_partner_id,
        companyCode: user.company_code,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.login_id,
        companyName: user.company_name,
        city: user.city,
        country: user.country
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed. Please try again.',
      error: error.message
    });
  }
});

export default router;
