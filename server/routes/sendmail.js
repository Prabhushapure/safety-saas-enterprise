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
  const { mappings, gameTitle, image, short_desc, businessPartnerId } = req.body;

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
  <div style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px;">
    <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 8px; padding: 20px;">

      <tr>
        <td>

          <p><strong>Dear ${user.name || 'User'},</strong></p>

          <p>
            I am pleased to send you this <strong>${gameTitle}</strong> Learning Game.
            Please click on the <strong>"Play Game"</strong> button below to Register, Play, Learn, and get Certified.
          </p>

          <!-- ✅ GAME CARD IN MIDDLE -->
          <div style="
            border: 1px solid #ddd;
            border-radius: 12px;
            padding: 12px;
            margin: 20px 0;
            text-align: center;
          ">

            <img 
              src="${image}" 
              alt="Game Image" 
              style="width: 100%; max-width: 400px; border-radius: 8px;"
            />

            <h3 style="margin: 10px 0 5px;">
              ${gameTitle}
            </h3>

            <p style="font-size: 14px; color: #666; margin: 0 0 10px;">
              ${short_desc || ''}
            </p>

            <a href="https://www.suraxa-safety.com/AWE-SaaS/play?token=${license.tokenCode}" 
              style="
                display: inline-block;
                padding: 12px 20px;
                background-color: #4f7cff;
                color: #ffffff;
                text-decoration: none;
                border-radius: 6px;
                font-size: 14px;
                font-weight: bold;
              ">
              ▶ Play Game
            </a>

          </div>

          <!-- SECOND PARAGRAPH -->
          <p>
            This Game Token will be active for <strong>3 days</strong> after your registration.
            You can play this game any number of times while active. At the end, you will receive a certificate based on your best score.
          </p>

          <p><strong>Game:</strong> ${gameTitle}</p>
          <p><strong>Token:</strong> ${license.tokenCode}</p>

          <br/>

          <p>Best Regards,</p>
          <p style="font-size: 14px; color: #555;">
            ${partner.first_name} ${partner.last_name}<br/>
            ${partner.company_name}
          </p>

        </td>
      </tr>

    </table>
  </div>
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
