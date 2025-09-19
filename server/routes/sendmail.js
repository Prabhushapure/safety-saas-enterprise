import express from 'express';
import pool from '../config/database.js';
import nodemailer from 'nodemailer';

const router = express.Router();

// Gmail SMTP configuration
// NOTE: Use an app password here, not your actual Gmail password
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'prabhushapure240901@gmail.com',  // <-- Replace with your Gmail
    pass: 'dlpqgkkgziutlcpq'               // <-- Replace with your Gmail App Password
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
  const { mappings, gameTitle } = req.body;

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

  try {
    const emailResults = [];

    // Send emails one by one
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

      const mailOptions = {
        from: '"Game Distributor" <prabhushapure240901@gmail.com>', // Sender name & email
        to: user.email, // Recipient email
        subject: `Your License for ${gameTitle}`,
        html: `
          <h3>Dear ${user.name || 'User'},</h3>
          <p>I am pleased to send you this <strong> ${gameTitle} </strong> Token ${license.tokenCode}</>
          <p>Please click on this link and Register yourself for Playing this</p>
           <a href="http://localhost:5173/play?token=${license.tokenCode}" 
             target="_blank" 
             style="color: #007bff; text-decoration: none;">
            Play Game
           </a>
          <p>This Game Token will be active for 3 days after your Registration. You can
           Play this Game any number of times while the Token is active. At the end of
           the 3 days, you will receive a Certificate that will consider your best scores.</p>
          <br/>
          <p>Thank you,<br/>Game Distribution Team</p>
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
