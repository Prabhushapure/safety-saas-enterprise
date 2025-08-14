import express from 'express';
import pool from '../config/database.js';

const router = express.Router();

// POST /api/play/validate-token - Validate game token
router.post('/validate-token', async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Token is required'
      });
    }
    
    // Check if token exists and get associated data
    const [rows] = await pool.execute(`
      SELECT 
        l.id,
        l.business_partner_id,
        l.game_id,
        l.tier,
        l.token_code,
        l.status,
        l.user_id,
        g.game_title
      FROM license l
      JOIN game g ON l.game_id = g.id
      WHERE l.token_code = ?
    `, [token]);
    
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Invalid token'
      });
    }
    
    const licenseData = rows[0];
    
    // Check if token is already used
    if (licenseData.status === 'used') {
      return res.status(400).json({
        success: false,
        message: 'This token has already been used'
      });
    }
    
    res.json({
      success: true,
      data: {
        licenseId: licenseData.id,
        gameId: licenseData.game_id,
        gameTitle: licenseData.game_title,
        tier: licenseData.tier,
        status: licenseData.status,
        userId: licenseData.user_id
      }
    });
    
  } catch (error) {
    console.error('Error validating token:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to validate token',
      error: error.message
    });
  }
});

// POST /api/play/verify-email - Verify email for token
router.post('/verify-email', async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const { token, email, hasUserId } = req.body;
    
    if (!token || !email) {
      return res.status(400).json({
        success: false,
        message: 'Token and email are required'
      });
    }
    
    // Get license data
    const [licenseRows] = await connection.execute(`
      SELECT id, user_id, status FROM license WHERE token_code = ?
    `, [token]);
    
    if (licenseRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Invalid token'
      });
    }
    
    const license = licenseRows[0];
    
    // Check if user exists
    const [userRows] = await connection.execute(`
      SELECT id, email_id FROM user WHERE email_id = ?
    `, [email]);
    
    if (hasUserId && license.user_id) {
      // Token already has a user assigned, verify email matches
      if (userRows.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No account found with this email address'
        });
      }
      
      const user = userRows[0];
      if (user.id !== license.user_id) {
        return res.status(400).json({
          success: false,
          message: 'Email address does not match the assigned user for this token'
        });
      }
      
      // Email matches, proceed to play
      res.json({
        success: true,
        userExists: true,
        message: 'Email verified successfully'
      });
    } else {
      // Token is unassigned, check if user exists to determine next step
      if (userRows.length > 0) {
        // User exists, assign token to user
        await connection.beginTransaction();
        
        await connection.execute(`
          UPDATE license SET user_id = ?, status = 'assigned' WHERE token_code = ?
        `, [userRows[0].id, token]);
        
        await connection.commit();
        
        res.json({
          success: true,
          userExists: true,
          message: 'Token assigned to existing user'
        });
      } else {
        // User doesn't exist, need registration
        res.json({
          success: true,
          userExists: false,
          message: 'User registration required'
        });
      }
    }
    
  } catch (error) {
    await connection.rollback();
    console.error('Error verifying email:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify email',
      error: error.message
    });
  } finally {
    connection.release();
  }
});

// POST /api/play/register-and-assign - Register user and assign token
router.post('/register-and-assign', async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const { token, email, name, organization } = req.body;
    
    if (!token || !email || !name || !organization) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }
    
    await connection.beginTransaction();
    
    // Create user
    const [userResult] = await connection.execute(`
      INSERT INTO user (email_id, name, organization, created_at, updated_at)
      VALUES (?, ?, ?, NOW(), NOW())
    `, [email, name, organization]);
    
    const userId = userResult.insertId;
    
    // Assign token to user
    await connection.execute(`
      UPDATE license SET user_id = ?, status = 'assigned' WHERE token_code = ?
    `, [userId, token]);
    
    await connection.commit();
    
    res.json({
      success: true,
      message: 'User registered and token assigned successfully',
      userId: userId
    });
    
  } catch (error) {
    await connection.rollback();
    console.error('Error registering user:', error);
    
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(400).json({
        success: false,
        message: 'An account with this email already exists'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to register user',
        error: error.message
      });
    }
  } finally {
    connection.release();
  }
});

export default router;
