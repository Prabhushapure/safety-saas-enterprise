import express from 'express';
import bcrypt from 'bcryptjs';
import pool from '../config/database.js';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import axios from 'axios';

const router = express.Router();

// Helper function to generate company code
const generateCompanyCode = (companyName) => {
  const cleaned = companyName.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  const timestamp = Date.now().toString().slice(-4);
  return `${cleaned.substring(0, 8)}_${timestamp}`;
};


// 🔁 Reusable Corent session generator
export async function generateCorentSession() {
  console.log('➡️ Calling Corent admin session API');

  const CORENT_API_KEY = process.env.CORENT_API_KEY || 'BO3ML5HEWW';

  const xmlRequest = `
    <request>
      <apikey>${CORENT_API_KEY}</apikey>
    </request>
  `;

  const response = await axios.post(
    'https://saasifynow.com/ceapi/v2/admin/sessions',
    xmlRequest,
    {
      headers: { 'Content-Type': 'application/xml' },
      timeout: 10000
    }
  );

  console.log('🔵 Corent raw response:', response.data);

  const match = response.data.match(/<sessionID>(.*?)<\/sessionID>/);

  if (!match || !match[1]) {
    throw new Error('Failed to generate Corent session');
  }

  return match[1];
}



// POST /api/auth/corent-session - Generate Corent session (expires in 3 mins)
router.post('/corent-session', async (req, res) => { try { const sessionId = await generateCorentSession(); return res.json({ success: true, sessionId, expiresInSeconds: 180 }); } catch (error) { console.error( 'Corent session error:', error.response?.status, error.response?.data || error.message ); return res.status(500).json({ success: false, message: 'Unable to create Corent session' }); } });



router.post('/register', async (req, res) => {
  // Hard-coded secret key
  const SECRET_KEY = "G9m!fA2w@7p#QeL8%zR4^BxT1$cV0nS3uD&hJ5kWqZ*Y";

  // Validate the secret key coming from header
  const apiKey = req.headers['x-api-key'];
  if (!apiKey || apiKey !== SECRET_KEY) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized request – invalid API key"
    });
  }
  const connection = await pool.getConnection();

  try {
    const {
      tenantid,
      companyname,
      firstname,
      lastname,
      email,
      password,
      country,
      address,
      subscription_plan_id
    } = req.body;

    // Validate required fields
    if (!tenantid || !companyname || !firstname || !email || !password || !subscription_plan_id) {
      return res.status(400).json({
        success: false,
        message: 'Required fields missing'
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

    await connection.beginTransaction();

    // Check if tenant exists
    const [existingTenant] = await connection.execute(
      'SELECT id FROM business_partner WHERE tenet_id = ?',
      [tenantid]
    );

    if (existingTenant.length > 0) {
      await connection.rollback();
      return res.status(200).json({
        success: true,
        message: 'Tenant already registered'
      });
    }

     // Check if login_id (email) already exists
     const [existingLogin] = await connection.execute(
      'SELECT id FROM business_partner WHERE login_id = ?',
      [email]
    );

    if (existingLogin.length > 0) {
      await connection.rollback();
      return res.status(200).json({
        success: true,
        message: 'Login ID / Email already registered'
      });
    }
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Insert new record
    const [insertResult] = await connection.execute(
      `INSERT INTO business_partner 
        (company_name, first_name, last_name, login_id, password, tenet_id, country, address, subscription_plan_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        companyname,
        firstname,
        lastname ?? '',
        email,
        hashedPassword,
        tenantid,
        country ?? '',
        address ?? '',
        subscription_plan_id
      ]
    );

    await connection.commit();

    res.status(201).json({
      success: true,
      message: 'Business partner registered successfully',
      data: {
        partnerId: insertResult.insertId,
        tenantid,
        companyname,
        firstname,
        lastname,
        email,
        subscription_plan_id
      }
    });

  } catch (error) {
    await connection.rollback();
    console.error('SaaSOps Registration Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
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
        bp.company_name,
        bp.first_name,
        bp.last_name,
        bp.login_id,
        bp.password,
        bp.country,
        bp.subscription_plan_id
      FROM business_partner bp
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
        businessPartnerId: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.login_id,
        companyName: user.company_name,
        country: user.country,
        subscription_plan_id: user.subscription_plan_id
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

// POST /api/auth/change-password - Change password for business partner
router.post('/change-password', async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const { id, oldPassword, newPassword } = req.body;

    // Validate required fields
    if (!id || !oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    // Validate password length
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters long"
      });
    }

    // Get current password from DB
    const [user] = await connection.execute(
      "SELECT password FROM business_partner WHERE id = ?",
      [id]
    );

    if (user.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const storedPassword = user[0].password;

    // Compare old password
    const isMatch = await bcrypt.compare(oldPassword, storedPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Old password is incorrect"
      });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    await connection.execute(
      "UPDATE business_partner SET password = ? WHERE id = ?",
      [hashedNewPassword, id]
    );

    res.json({
      success: true,
      message: "Password updated successfully"
    });

  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  } finally {
    connection.release();
  }
});

// Helper function to generate random password
const generateRandomPassword = () => {
  const length = 12;
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
};

// Helper function to generate reset token
const generateResetToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// POST /api/auth/forgot-password - Request password reset for business partner
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    // Validate required fields
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
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

    // Find business partner by email
    const [users] = await pool.execute(`
      SELECT 
        bp.id,
        bp.first_name,
        bp.last_name,
        bp.login_id,
        bp.company_name
      FROM business_partner bp
      WHERE bp.login_id = ?
    `, [email]);

    if (users.length === 0) {
      // Don't reveal if email exists or not for security reasons
      return res.json({
        success: true,
        message: 'If the email exists, a password reset email has been sent.'
      });
    }

    const user = users[0];

    // Generate random password
    const newPassword = generateRandomPassword();
    
    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Generate reset token
    const resetToken = generateResetToken();
    
    // Set expiration time (1 hour from now)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    // Store reset token and hashed password temporarily in database
    // Note: This assumes reset_token, reset_password_hash, and reset_token_expires columns exist
    // If they don't exist, you'll need to add them via ALTER TABLE
    try {
      await pool.execute(`
        UPDATE business_partner 
        SET reset_token = ?, 
            reset_password_hash = ?, 
            reset_token_expires = ?
        WHERE id = ?
      `, [resetToken, hashedPassword, expiresAt, user.id]);
    } catch (dbError) {
      // If columns don't exist, provide helpful error message
      if (dbError.code === 'ER_BAD_FIELD_ERROR') {
        console.error('Database columns missing. Please run: ALTER TABLE business_partner ADD COLUMN reset_token VARCHAR(64) NULL, ADD COLUMN reset_password_hash VARCHAR(255) NULL, ADD COLUMN reset_token_expires DATETIME NULL;');
        return res.status(500).json({
          success: false,
          message: 'Database configuration error. Please contact support.'
        });
      }
      throw dbError;
    }

    // Configure email transporter (using same config as sendmail.js)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'support@antiztech.com',
        pass: 'bsxgkmsowtdgctnz'
      }
    });

    // Create confirmation URL
    const baseUrl = req.protocol + '://' + req.get('host');
    const confirmationUrl = `${baseUrl}/AWE-SaaS/partner/confirm-password-reset?token=${resetToken}`;

    // Send email with new password and confirmation button
    const mailOptions = {
      from: '"Gamified Safety" <support@antiztech.com>',
      to: user.login_id,
      subject: 'Password Reset - Partner Account',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc2626;">Gamified Safety Training – Password Reset Request</h2>
          <p>Dear ${user.first_name} ${user.last_name},</p>
          <p>You have requested to reset your password for your partner account.</p>
          <p>Your new temporary password is:</p>
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center;">
            <strong style="font-size: 18px; color: #dc2626; letter-spacing: 2px;">${newPassword}</strong>
          </div>
          <p><strong>Important:</strong> Please click the confirmation button below to activate this new password. This link will expire in 1 hour.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${confirmationUrl}" 
               style="display: inline-block; padding: 12px 24px; background-color: #dc2626; color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: bold;">
              Confirm Password Reset
            </a>
          </div>
          <p>If you did not request this password reset, please ignore this email</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          <p style="color: #6b7280; font-size: 14px;">
            Best Regards,<br>
            Support Team, <br> 
            Gamified Safety
          </p>
        </div>
      `
    };

    try {
      await transporter.sendMail(mailOptions);
      res.json({
        success: true,
        message: 'Password reset email has been sent successfully. Please check your email and confirm the password reset.'
      });
    } catch (emailError) {
      console.error('Error sending password reset email:', emailError);
      // Clean up the reset token if email fails
      await pool.execute(`
        UPDATE business_partner 
        SET reset_token = NULL, 
            reset_password_hash = NULL, 
            reset_token_expires = NULL
        WHERE id = ?
      `, [user.id]);
      
      res.status(500).json({
        success: false,
        message: 'Failed to send email. Please try again later.'
      });
    }

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while processing your request. Please try again later.',
      error: error.message
    });
  }
});

// POST /api/auth/confirm-password-reset - Confirm password reset
router.post('/confirm-password-reset', async (req, res) => {
  try {
    const { token } = req.body;

    // Validate required fields
    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Reset token is required'
      });
    }

    // Find business partner with matching reset token
    const [users] = await pool.execute(`
      SELECT 
        bp.id,
        bp.reset_token,
        bp.reset_password_hash,
        bp.reset_token_expires
      FROM business_partner bp
      WHERE bp.reset_token = ?
    `, [token]);

    if (users.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    const user = users[0];

    // Check if reset password hash exists
    if (!user.reset_password_hash) {
      return res.status(400).json({
        success: false,
        message: 'No pending password reset found'
      });
    }

    // Check if token has expired
    const now = new Date();
    const expiresAt = new Date(user.reset_token_expires);
    if (now > expiresAt) {
      // Clean up expired token
      await pool.execute(`
        UPDATE business_partner 
        SET reset_token = NULL, 
            reset_password_hash = NULL, 
            reset_token_expires = NULL
        WHERE id = ?
      `, [user.id]);
      
      return res.status(400).json({
        success: false,
        message: 'Reset token has expired. Please request a new password reset.'
      });
    }

    // Update password with the new password hash
    await pool.execute(
      'UPDATE business_partner SET password = ?, reset_token = NULL, reset_password_hash = NULL, reset_token_expires = NULL WHERE id = ?',
      [user.reset_password_hash, user.id]
    );

    res.json({
      success: true,
      message: 'Password has been reset successfully. You can now log in with your new password.'
    });

  } catch (error) {
    console.error('Confirm password reset error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while confirming password reset. Please try again later.',
      error: error.message
    });
  }
});


router.post('/upgrade-plan', async (req, res) => {
  const { partnerId } = req.body;

  if (!partnerId) {
    return res.status(400).json({
      success: false,
      message: 'Partner ID is required'
    });
  }

  try {
    // 1️⃣ Fetch partner
    const [rows] = await pool.execute(
      `SELECT subscription_plan_id 
       FROM business_partner
       WHERE id = ?`,
      [partnerId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Partner not found'
      });
    }

    const currentPlan = rows[0].subscription_plan_id;

    // 2️⃣ Allow upgrade only from Trial
    if (currentPlan !== 'Trail Plan') {
      return res.status(400).json({
        success: false,
        message: 'Plan upgrade not allowed'
      });
    }

    // 3️⃣ Update plan
    await pool.execute(
      `UPDATE business_partner
       SET subscription_plan_id = ?
       WHERE id = ?`,
      ['Partner Plan', partnerId]
    );


    // 5️⃣ Success
    return res.json({
      success: true,
      message: 'Plan upgraded successfully',
      newPlan: 'Partner Plan'
    });

  } catch (error) {
    console.error('Upgrade error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

export default router;
