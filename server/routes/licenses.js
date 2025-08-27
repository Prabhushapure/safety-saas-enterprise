import express from 'express';
import pool from '../config/database.js';

const router = express.Router();

// Function to generate a unique 16-character token in XXXX-XXXX-XXXX-XXXX format
const generateTokenCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let token = '';
  
  for (let i = 0; i < 16; i++) {
    if (i > 0 && i % 4 === 0) {
      token += '-';
    }
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return token;
};

// Function to check if token already exists and generate a unique one
const generateUniqueToken = async () => {
  let token;
  let exists = true;
  
  while (exists) {
    token = generateTokenCode();
    
    // Check if token already exists in database
    const [rows] = await pool.execute(
      'SELECT COUNT(*) as count FROM license WHERE token_code = ?',
      [token]
    );
    
    exists = rows[0].count > 0;
  }
  
  return token;
};

// Map frontend tier values to database enum values
const mapTierToEnum = (tier) => {
  const tierMap = {
    'one-time': 'OneTime',
    '1-month': 'OneMonth',
    '6-months': 'SixMonth',
    '1-year': 'OneYear'
  };
  
  return tierMap[tier] || 'OneTime';
};

// POST /api/licenses/purchase - Purchase licenses
router.post('/purchase', async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const { businessPartnerId, licenses, totalAmount } = req.body;
    
    // Validate required fields
    if (!businessPartnerId || !licenses || !Array.isArray(licenses) || licenses.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request data'
      });
    }
    
    // Start transaction
    await connection.beginTransaction();
    
    let totalLicensesCreated = 0;
    const createdLicenses = [];
    
    // Process each game's licenses
    for (const licenseData of licenses) {
      const { gameId, count, tier, amount } = licenseData;
      
      // Validate license data
      if (!gameId || !count || count <= 0 || !tier) {
        await connection.rollback();
        return res.status(400).json({
          success: false,
          message: 'Invalid license data'
        });
      }
      
      // Verify game exists
      const [gameRows] = await connection.execute(
        'SELECT id FROM game WHERE id = ?',
        [gameId]
      );
      
      if (gameRows.length === 0) {
        await connection.rollback();
        return res.status(400).json({
          success: false,
          message: `Game with ID ${gameId} not found`
        });
      }
      
      // Generate and insert licenses for this game
      for (let i = 0; i < count; i++) {
        const tokenCode = await generateUniqueToken();
        const dbTier = mapTierToEnum(tier);
        
        const [result] = await connection.execute(
          `INSERT INTO license (business_partner_id, game_id, tier, token_code, status, created_at) 
           VALUES (?, ?, ?, ?, 'unassigned', NOW())`,
          [businessPartnerId, gameId, dbTier, tokenCode]
        );
        
        createdLicenses.push({
          id: result.insertId,
          gameId,
          tokenCode,
          tier: dbTier,
          status: 'unassigned'
        });
        
        totalLicensesCreated++;
      }
    }
    
    // Commit transaction
    await connection.commit();
    
    res.json({
      success: true,
      message: 'Licenses purchased successfully',
      totalLicenses: totalLicensesCreated,
      totalAmount,
      licenses: createdLicenses
    });
    
  } catch (error) {
    // Rollback transaction on error
    await connection.rollback();
    console.error('Error purchasing licenses:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to purchase licenses',
      error: error.message
    });
  } finally {
    connection.release();
  }
});

// GET /api/licenses/partner/:partnerId - Get licenses for a business partner
router.get('/partner/:partnerId', async (req, res) => {
  try {
    const { partnerId } = req.params;
    
    const [rows] = await pool.execute(`
      SELECT 
        l.id,
        l.token_code,
        l.tier,
        l.status,
        l.created_at,
        g.game_title,
        g.short_desc as game_short_desc
      FROM license l
      JOIN game g ON l.game_id = g.id
      WHERE l.business_partner_id = ?
      ORDER BY l.created_at DESC
    `, [partnerId]);
    
    res.json({
      success: true,
      data: rows
    });
    
  } catch (error) {
    console.error('Error fetching partner licenses:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch licenses',
      error: error.message
    });
  }
});

export default router;
