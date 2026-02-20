import express from 'express';
import nodemailer from 'nodemailer';
import pool from '../config/database.js';

const router = express.Router();

// Gmail SMTP configuration
// NOTE: Use an app password here, not your actual Gmail password
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'support@antiztech.com',  
    pass: 'bsxgkmsowtdgctnz'               
  }
});

/**
 * POST /api/sendemail
 * Body format:
 * {
 *   "mappings": [
 *     { "user": { "name": "John Doe", "email": "johnexample.com" }, "license": { "tokenCode": "ABC123" } }
 *   ],
 *   "gameTitle": "Awesome Game"
 * }
 */
router.post('/', async (req, res) => {
  const { mappings, gameTitle, businessPartnerId } = req.body;

  // Validate request
  if (!Array.isArray(mappings) || mappings.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'No mappings provided. Please include user-license mappings.'
    });
  }

  if (!gameTitle) {
    return res.status(400).json({
      success: false,
      message: 'Game title is required.'
    });
  }

  if (!businessPartnerId) {
    return res.status(400).json({
      success: false,
      message: 'Business Partner ID is required.'
    });
  }

  try {
    // Step 1: Fetch Business Partner details from DB
    const [partnerRows] = await pool.execute(
      `SELECT 
          bp.first_name, 
          bp.last_name, 
          c.company_name
       FROM business_partner bp
       LEFT JOIN company c ON bp.company_id = c.id
       WHERE bp.id = ?`,
      [businessPartnerId]
    );

    if (partnerRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Business partner not found or inactive'
      });
    }

    const partner = partnerRows[0];

    console.log('Business Partner Details:', partner);

    const emailResults = [];

    // Step 2: Send emails one by one
    for (const mapping of mappings) {
      const { user, license } = mapping;
      if (!user || !user.email || !license || !license.tokenCode) {
        emailResults.push({
          user: user || {},
          status: 'failed',
          reason: 'Invalid user or license data'
        });
        continue;
      }

      // Step 3: Build email template dynamically
      const mailOptions = {
        from: '"Gamified Safety" <support@antiztech.com>', // Sender name & email
        to: user.email, // Recipient email
        subject: `Your Game Token for ${gameTitle}`,
        html: `
          <h3>Dear ${user.name || 'User'},</h3>
          <p>
            I am pleased to send you this <strong>${gameTitle}</strong> Learning Game.
            Please click on the <strong>"Play Game"</strong> button below to Register, Play the Game, Learn, and get 
            Certified on the topic
          </p>

           <p style="margin-top: 20px;">
            This Game Token will be active for <strong>3 days</strong> after your registration. 
            You can play this game any number of times while the token is active. 
            At the end of the 3 days, you will receive a Certificate that will consider your best scores.
          </p>

          <p>Do use this Game to Play, Learn & get Cerified.</p>
          <p><strong>Game: ${gameTitle}</string></P>
          <p><strong>Token: ${license.tokenCode}</string></p> 
          
          <a href="https://www.suraxa-safety.com/AWE-SaaS/play?token=${license.tokenCode}" 
             target="_blank" 
             style="
               display: inline-block;
               padding: 12px 24px;
               background-color: #007bff;
               color: #ffffff;
               text-decoration: none;
               border-radius: 6px;
               font-size: 16px;
               font-weight: bold;
               text-align: center;
               cursor: pointer;
               transition: background-color 0.3s ease;
             ">
            Play Game
          </a>

          <br/>
          <p>Best Regards</p>
          <p style="font-size: 14px; color: #555;">
             [${partner.first_name} ${partner.last_name},<br/>
             ${partner.company_name}]
          </p>
        `
      };

      try {
        await transporter.sendMail(mailOptions);
        emailResults.push({ user, status: 'sent' });
      } catch (err) {
        console.error(`Error sending email to ${user.email}:`, err);
        emailResults.push({ user, status: 'failed', reason: err.message });
      }
    }

    res.json({
      success: true,
      message: 'Email sending process completed',
      results: emailResults
    });
  } catch (error) {
    console.error('Email sending error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while sending emails',
      error: error.message
    });
  }
});

export default router;
