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

      const fullImageUrl = image && image.startsWith('http')
        ? image
        : `https://www.antiz-digital.com${image}`;
      // Step 3: Build email template dynamically
      const mailOptions = {
        from: '"Gamified Learning" <support@antiztech.com>', // Sender name & email
        to: user.email, // Recipient email
        subject: `Your Game Token for ${gameTitle}`,
        html: `
  <div style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px;">
    <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 800px; margin: auto; background: #ffffff; border-radius: 8px; padding: 20px;">

      <tr>
        <td>

          <p><strong>Dear ${user.name || 'User'},</strong></p>

          <p>
            I am pleased to send you this <strong>${gameTitle}</strong> Learning Game.
            Please click on the <strong>"Play Game"</strong> button below to Register, Play, Learn, and get Certified.
          </p>
          <p><strong>Game:</strong> ${gameTitle}. <strong>Token:</strong> ${license.tokenCode}</p>

          <!-- ✅ GAME CARD IN MIDDLE -->
          <div style="
  max-width: 220px;
  margin: 20px auto;
  border: 2px solid #e53935;
  border-radius: 16px;
  overflow: hidden;
  background-color: #ffffff;
  text-align: center;
">

  <img 
    src="${fullImageUrl}" 
    alt="Game Image" 
    style="
      width: 100%;
      height: 120px;
      object-fit: cover;
      display: block;
    "
  />

  <div style="padding: 10px;">
    <h3 style="
      margin: 6px 0 4px;
      font-size: 15px;
      font-weight: bold;
      color: #333;
    ">
      ${gameTitle}
    </h3>

    <p style="
      font-size: 12px;
      color: #777;
      margin: 0 0 10px;
      line-height: 1.3;
    ">
      ${short_desc ? short_desc.substring(0, 60) + '...' : ''}
    </p>

    <a href="https://www.antiz-digital.com/GamifiedLearning/play?token=${license.tokenCode}" 
       target="_blank"
       style="
         display: block;
         width: 100%;
         background-color: #5b7cff;
         color: #ffffff;
         padding: 10px 0;
         border-radius: 8px;
         font-size: 13px;
         font-weight: bold;
         text-decoration: none;
         box-sizing: border-box;
       ">
      Play Game
    </a>
  </div>

</div>

          <!-- SECOND PARAGRAPH -->
          <p>
            This Game will be active for <strong>3 days</strong> after registration and you can play it any number of times on Windows PC, Android, Apple smartphones & tablets.
            On completion of 3 days, you will receive a Completion Certificate with your best scores.
          </p>

          

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
