import express from 'express';
import bcrypt from 'bcryptjs';
import pool from '../config/database.js';
import nodemailer from 'nodemailer';

const router = express.Router();

// Helper function to generate company code
const generateCompanyCode = (companyName) => {
  const cleaned = companyName.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  const timestamp = Date.now().toString().slice(-4);
  return `${cleaned.substring(0, 8)}_${timestamp}`;
};



// POST /api/auth/register - Register new business partner and company
// router.post('/register', async (req, res) => {
//   const connection = await pool.getConnection();
  
//   try {
//     const {
//       firstName,
//       lastName,
//       email,
//       password,
//       companyName,
//       address,
//       city,
//       country
//     } = req.body;

//     // Validate required fields
//     if (!firstName || !lastName || !email || !password || !companyName || !address || !city || !country) {
//       return res.status(400).json({
//         success: false,
//         message: 'All fields are required'
//       });
//     }

//     // Validate email format
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (!emailRegex.test(email)) {
//       return res.status(400).json({
//         success: false,
//         message: 'Please enter a valid email address'
//       });
//     }

//     // Validate password length
//     if (password.length < 6) {
//       return res.status(400).json({
//         success: false,
//         message: 'Password must be at least 6 characters long'
//       });
//     }

//     await connection.beginTransaction();

//     // Check if email already exists
//     const [existingUsers] = await connection.execute(
//       'SELECT login_id FROM business_partner WHERE login_id = ?',
//       [email]
//     );

//     if (existingUsers.length > 0) {
//       await connection.rollback();
//       return res.status(409).json({
//         success: false,
//         message: 'Email already registered'
//       });
//     }

//     // Generate company code
//     const companyCode = generateCompanyCode(companyName);

//     // Check if company code already exists (unlikely but possible)
//     const [existingCompanies] = await connection.execute(
//       'SELECT company_code FROM company WHERE company_code = ?',
//       [companyCode]
//     );

//     if (existingCompanies.length > 0) {
//       await connection.rollback();
//       return res.status(409).json({
//         success: false,
//         message: 'Company registration failed. Please try again.'
//       });
//     }

//     // Hash password
//     const saltRounds = 12;
//     const hashedPassword = await bcrypt.hash(password, saltRounds);

//     // Insert company record
//     await connection.execute(
//       'INSERT INTO company (company_code, company_name, address, city, country) VALUES (?, ?, ?, ?, ?)',
//       [companyCode, companyName, address, city, country]
//     );

//     // Insert business partner record
//     const [bpResult] = await connection.execute(
//       'INSERT INTO business_partner (company_code, first_name, last_name, login_id, password) VALUES (?, ?, ?, ?, ?)',
//       [companyCode, firstName, lastName, email, hashedPassword]
//     );

//     const businessPartnerId = bpResult.insertId;

//     await connection.commit();

//     res.status(201).json({
//       success: true,
//       message: 'Registration successful',
//       data: {
//         businessPartnerId,
//         companyCode,
//         firstName,
//         lastName,
//         email,
//         companyName
//       }
//     });

//   } catch (error) {
//     await connection.rollback();
//     console.error('Registration error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Registration failed. Please try again.',
//       error: error.message
//     });
//   } finally {
//     connection.release();
//   }
// });

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
        bp.country
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

// POST /api/auth/forgot-password - Reset password for business partner
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

    // Update password in database
    await pool.execute(
      'UPDATE business_partner SET password = ? WHERE id = ?',
      [hashedPassword, user.id]
    );

    // Configure email transporter (using same config as sendmail.js)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'prabhushapure240901@gmail.com',
        pass: 'dlpqgkkgziutlcpq'
      }
    });

    // Send email with new password
    const mailOptions = {
      from: '"Gamified Safety" <prabhushapure240901@gmail.com>',
      to: user.login_id,
      subject: 'Password Reset - Partner Account',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc2626;">Password Reset Request</h2>
          <p>Dear ${user.first_name} ${user.last_name},</p>
          <p>You have requested to reset your password for your partner account.</p>
          <p>Your new temporary password is:</p>
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center;">
            <strong style="font-size: 18px; color: #dc2626; letter-spacing: 2px;">${newPassword}</strong>
          </div>
          <p><strong>Important:</strong> Please log in with this password and change it to a secure password of your choice as soon as possible.</p>
          <p>If you did not request this password reset, please contact support immediately.</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          <p style="color: #6b7280; font-size: 14px;">
            Best Regards,<br>
            Gamified Safety Team
          </p>
        </div>
      `
    };

    try {
      await transporter.sendMail(mailOptions);
      res.json({
        success: true,
        message: 'Password reset email has been sent successfully. Please check your email.'
      });
    } catch (emailError) {
      console.error('Error sending password reset email:', emailError);
      // Password was already updated, so we should still return success but log the error
      res.json({
        success: true,
        message: 'Password has been reset. However, there was an issue sending the email. Please contact support.'
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


export default router;
