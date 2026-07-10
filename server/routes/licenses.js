import express from 'express';
import pool from '../config/database.js';
import { getTokenPriceFields } from '../utils/tokenPrice.js';

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
    
    // Log request for debugging
    console.log('License purchase request:', {
      businessPartnerId,
      licensesCount: Array.isArray(licenses) ? licenses.length : 'not array',
      licensesType: typeof licenses,
      totalAmount,
      fullRequest: req.body
    });
    
    // Validate required fields
    const validationErrors = [];
    
    if (!businessPartnerId) {
      validationErrors.push('Business Partner ID is required');
    }
    
    if (!licenses) {
      validationErrors.push('Licenses data is required');
    } else if (!Array.isArray(licenses)) {
      validationErrors.push('Licenses must be an array');
    } else if (licenses.length === 0) {
      validationErrors.push('At least one license must be selected');
    }
    
    if (validationErrors.length > 0) {
      console.log('Validation failed:', validationErrors);
      return res.status(400).json({
        success: false,
        message: 'Invalid request data',
        details: validationErrors,
        receivedData: {
          businessPartnerId: businessPartnerId || 'missing',
          licensesType: licenses ? (Array.isArray(licenses) ? 'array' : typeof licenses) : 'missing',
          licensesCount: Array.isArray(licenses) ? licenses.length : 'N/A'
        }
      });
    }
    
    const [partnerRows] = await connection.execute(
      'SELECT country FROM business_partner WHERE id = ?',
      [businessPartnerId]
    );

    if (partnerRows.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Business partner not found'
      });
    }

    const partnerCountry = partnerRows[0].country;
    const gamePriceCache = {};

    // Start transaction
    await connection.beginTransaction();
    
    let totalLicensesCreated = 0;
    const createdLicenses = [];
    
    // Process each game's licenses
    for (const licenseData of licenses) {
      const { gameId, count, tier, amount } = licenseData;
      
      // Validate license data
      const licenseErrors = [];
      
      if (!gameId) {
        licenseErrors.push('Game ID is required');
      }
      
      if (!count) {
        licenseErrors.push('License count is required');
      } else if (count <= 0) {
        licenseErrors.push('License count must be greater than 0');
      }
      
      if (!tier) {
        licenseErrors.push('License tier/validity is required');
      }
      
      if (licenseErrors.length > 0) {
        console.log('License validation failed:', licenseErrors, 'for license:', licenseData);
        await connection.rollback();
        return res.status(400).json({
          success: false,
          message: 'Invalid license data',
          details: licenseErrors,
          invalidLicense: {
            gameId: gameId || 'missing',
            count: count || 'missing',
            tier: tier || 'missing',
            amount: amount || 'missing'
          }
        });
      }
      
      // Verify game exists and get list price
      const [gameRows] = await connection.execute(
        'SELECT id, game_list_price FROM game WHERE id = ?',
        [gameId]
      );
      
      if (gameRows.length === 0) {
        await connection.rollback();
        return res.status(400).json({
          success: false,
          message: `Game with ID ${gameId} not found`
        });
      }

      if (!Object.prototype.hasOwnProperty.call(gamePriceCache, gameId)) {
        gamePriceCache[gameId] = gameRows[0].game_list_price;
      }

      const { token_price, token_price_currency } = getTokenPriceFields(
        gamePriceCache[gameId],
        partnerCountry
      );
      
      // Generate and insert licenses for this game
      for (let i = 0; i < count; i++) {
        const tokenCode = await generateUniqueToken();
        const dbTier = mapTierToEnum(tier);
        
        const [result] = await connection.execute(
          `INSERT INTO license (
             business_partner_id, game_id, tier, token_code,
             token_price, token_price_currency, status, created_at
           ) VALUES (?, ?, ?, ?, ?, ?, 'unassigned', NOW())`,
          [businessPartnerId, gameId, dbTier, tokenCode, token_price, token_price_currency]
        );
        
        createdLicenses.push({
          id: result.insertId,
          gameId,
          tokenCode,
          tier: dbTier,
          token_price,
          token_price_currency,
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

// POST /api/licenses/assign-bulk - Assign existing licenses to users by mapping
// Expects: { assignments: [{ licenseId, userId }]} and marks license as 'unassigned' with user_id set
router.post('/assign-bulk', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { assignments } = req.body;

    if (!Array.isArray(assignments) || assignments.length === 0) {
      return res.status(400).json({ success: false, message: 'assignments must be a non-empty array' });
    }

    await connection.beginTransaction();

    for (const item of assignments) {
      const licenseId = Number(item.licenseId);
      const userId = Number(item.userId);
      if (!licenseId || !userId) {
        await connection.rollback();
        return res.status(400).json({ success: false, message: 'licenseId and userId are required for each assignment' });
      }

      await connection.execute(
        `UPDATE license SET user_id = ?, status = 'unassigned' WHERE id = ?`,
        [userId, licenseId]
      );
    }

    await connection.commit();
    res.json({ success: true, message: 'Assignments saved' });
  } catch (error) {
    await connection.rollback();
    console.error('Error in assign-bulk:', error);
    res.status(500).json({ success: false, message: 'Failed to assign licenses', error: error.message });
  } finally {
    connection.release();
  }
});