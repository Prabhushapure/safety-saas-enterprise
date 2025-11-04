import express from 'express';
import process from 'node:process';
import pool from '../config/database.js';

const router = express.Router();

// GET /api/play/launch - Set cookies and redirect to external game
router.get('/launch', async (req, res) => {
  try {
    const { token, play_no } = req.query;
    let { email } = req.query;

    if (!token) {
      return res.status(400).json({ success: false, message: 'token is required' });
    }

    // ✅ Validate token and fetch user + game info
    const [rows] = await pool.execute(`
      SELECT 
        l.id AS license_id,
        l.token_code,
        l.status,
        l.user_id,
        l.game_id,
        l.registered_at,
        u.email_id,
        g.game_url
      FROM license l
      LEFT JOIN user u ON u.id = l.user_id
      LEFT JOIN game g ON g.id = l.game_id
      WHERE l.token_code = ?
    `, [token]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Invalid token' });
    }

    const license = rows[0];

    // ✅ Check game URL
    if (!license.game_url) {
      return res.status(400).json({ success: false, message: 'Game URL not configured for this license' });
    }

    // ✅ Handle email (from DB or query)
    if (!email) {
      if (!license.user_id || !license.email_id) {
        return res.status(400).json({ success: false, message: 'Token is not assigned to a user yet' });
      }
      email = String(license.email_id);
    } else {
      if (license.user_id && license.email_id && license.email_id.toLowerCase() !== String(email).toLowerCase()) {
        return res.status(400).json({ success: false, message: 'Email does not match assigned user for this token' });
      }
    }

    // ✅ License expiry check (3 days)
    if (license.registered_at) {
      const registeredAt = new Date(license.registered_at);
      const now = new Date();
      const diffMs = now.getTime() - registeredAt.getTime();
      const threeDaysMs = 3 * 24 * 60 * 60 * 1000;
      if (diffMs > threeDaysMs) {
        return res.status(403).json({ success: false, message: 'License has expired' });
      }
    }

    // ✅ Set cookies for client
    const cookieDomain = process.env.COOKIE_DOMAIN || undefined;
    const cookieOptions = {
      httpOnly: false,
      sameSite: 'None',
      secure: true,
      path: '/',
      domain: cookieDomain
    };

    res.cookie('user_email', String(email), cookieOptions);
    res.cookie('license_token', String(token), cookieOptions);

    // ✅ Redirect dynamically using game_url from DB
    const redirectUrl = `${license.game_url}?token=${encodeURIComponent(String(token))}&play_no=${encodeURIComponent(play_no || '')}`;

    console.log(`Redirecting to: ${redirectUrl}`);
    return res.redirect(302, redirectUrl);
  } catch (error) {
    console.error('Error launching play redirect:', error);
    return res.status(500).json({ success: false, message: 'Failed to launch game', error: error.message });
  }
});


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
    
    // Check if token exists and get associated data incl. provider/company
    const [rows] = await pool.execute(`
      SELECT 
        l.id,
        l.game_id,
        l.tier,
        l.token_code,
        l.status,
        l.user_id,
        l.created_at,
        l.registered_at,
        l.business_partner_id,
        g.game_title,
        g.image_url,
        g.short_desc,
        u.email_id AS user_email,
        u.name AS user_name,
        bp.company_code AS provider_company_code,
        bp.first_name AS provider_name,
        c.company_name AS provider_company_name
      FROM license l
      JOIN game g ON l.game_id = g.id
      LEFT JOIN user u ON u.id = l.user_id
      LEFT JOIN business_partner bp ON bp.id = l.business_partner_id
      LEFT JOIN company c ON c.company_code = bp.company_code
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
        userId: licenseData.user_id,
        imageUrl: licenseData.image_url || null,
        shortDescription: licenseData.short_desc || null,
        userEmail: licenseData.user_email || null,
        userName: licenseData.user_name || null,
        createdAt: licenseData.created_at || null,
        registeredAt: licenseData.registered_at || null,
        providerCompany: licenseData.provider_company_name || null,
        providerName: licenseData.provider_name || null,
        providerCompanyCode: licenseData.provider_company_code || null
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



// POST /api/play/complete-registration - Update assigned user's profile and mark license assigned
router.post('/complete-registration', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { token, name, organization } = req.body;

    if (!token || !name || !organization) {
      return res.status(400).json({ success: false, message: 'token, name and organization are required' });
    }

    // Fetch license and assigned user
    const [licenseRows] = await connection.execute(
      `SELECT l.id, l.user_id, u.email_id FROM license l LEFT JOIN user u ON u.id = l.user_id WHERE l.token_code = ?`,
      [token]
    );

    if (licenseRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Invalid token' });
    }

    const lic = licenseRows[0];
    if (!lic.user_id) {
      return res.status(400).json({ success: false, message: 'Token is not pre-assigned to a user' });
    }

    await connection.beginTransaction();

    // Update user profile
    await connection.execute(
      `UPDATE user SET name = ?, organization = ?, updated_at = NOW() WHERE id = ?`,
      [String(name), String(organization), lic.user_id]
    );

    // Mark license as assigned if not already
    await connection.execute(
      `UPDATE license SET status = 'assigned', registered_at = NOW() WHERE id = ?`,
      [lic.id]
    );

    await connection.commit();

    return res.json({ success: true, message: 'Registration completed', userEmail: lic.email_id, userId: lic.user_id });
  } catch (error) {
    await connection.rollback();
    console.error('Error completing registration:', error);
    return res.status(500).json({ success: false, message: 'Failed to complete registration', error: error.message });
  } finally {
    connection.release();
  }
}); 

router.post('/start', async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Token is required'
      });
    }

    // 1️⃣ Fetch license and max_score_possible
    const [licenseRows] = await connection.execute(`
      SELECT 
        l.id AS license_id,
        g.max_score_possible
      FROM license l
      JOIN game g ON l.game_id = g.id
      WHERE l.token_code = ?
    `, [token]);

    if (licenseRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Invalid token'
      });
    }

    const { license_id, max_score_possible } = licenseRows[0];

    // 2️⃣ Get last play_no for this license_id
    const [playRows] = await connection.execute(`
      SELECT COALESCE(MAX(CAST(play_no AS UNSIGNED)), 0) AS last_play_no
      FROM play_tracker
      WHERE license_id = ?
    `, [license_id]);

    const nextPlayNo = Number(playRows[0].last_play_no) + 1;

    // 3️⃣ Insert new play record
    await connection.beginTransaction();

    await connection.execute(`
      INSERT INTO play_tracker (license_id, play_no, play_datetime, play_result, max_score_possible)
      VALUES (?, ?, NOW(), NULL, ?)
    `, [license_id, nextPlayNo, max_score_possible]);

    await connection.commit();

    return res.json({
      success: true,
      message: 'Play record created successfully',
      data: {
        license_id,
        play_no: nextPlayNo,
        max_score_possible
      }
    });

  } catch (error) {
    await connection.rollback();
    console.error('Error creating play record:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create play record',
      error: error.message
    });
  } finally {
    connection.release();
  }
});

router.post('/complete', async (req, res) => {
  try {
    const { token, play_no, score, play_result } = req.body;

    if (!token || !play_no) {
      return res.status(400).json({ success: false, message: 'Token and play_no required' });
    }

    // Find license ID for the token
    const [licenseRows] = await pool.query(
      'SELECT id FROM license WHERE token_code  = ?',
      [token]
    );

    if (licenseRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Invalid token' });
    }

    const license_id = licenseRows[0].id;

    // Update the play_tracker record
    const [result] = await pool.query(
      `UPDATE play_tracker
       SET score = ?, play_result = ?
       WHERE license_id = ? AND play_no = ?`,
      [score, play_result, license_id, play_no]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Play record not found' });
    }

    res.json({ success: true, message: 'Score updated successfully' });

  } catch (err) {
    console.error('Error updating play record:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// ✅ /api/play/history - Get aggregated play history stats
router.get('/history', async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ success: false, message: 'Token is required' });
    }

    // 1️⃣ Find license ID for given token
    const [licenseRows] = await pool.query(
      `SELECT id FROM license WHERE token_code = ?`,
      [token]
    );

    if (licenseRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Invalid token' });
    }

    const licenseId = licenseRows[0].id;

    // 2️⃣ Fetch aggregated play data
    const [statsRows] = await pool.query(
      `SELECT 
         COUNT(*) AS total_plays,
         SUM(CASE WHEN play_result = 'Pass' THEN 1 ELSE 0 END) AS total_pass,
         SUM(CASE WHEN play_result = 'Fail' THEN 1 ELSE 0 END) AS total_fail,
         SUM(CASE WHEN play_result is null THEN 1 ELSE 0 END) AS total_abort,
         MAX(score) AS best_score
       FROM play_tracker
       WHERE license_id = ?`,
      [licenseId]
    );

    const stats = statsRows[0] || {
      total_plays: 0,
      total_pass: 0,
      total_fail: 0,
      total_abort: 0,
      best_score: null
    };

    res.json({
      success: true,
      data: stats
    });

  } catch (err) {
    console.error('Error fetching play history stats:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch play history stats',
      error: err.message
    });
  }
});



export default router;