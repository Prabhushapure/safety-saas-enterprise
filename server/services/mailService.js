import nodemailer from 'nodemailer';
import pool from '../config/database.js';

// SMTP transporter (same as your sendmail.js)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_USER || 'prabhushapure240901@gmail.com',
    pass: process.env.MAIL_PASS || 'dlpqgkkgziutlcpq'
  }
});

/**
 * Send GAME COMPLETION email (used ONLY by CRON)
 */
export async function sendGameCompletionMail({
  userName,
  userEmail,
  tokenCode,
  gameTitle,
  businessPartnerId
}) {
  // 1️⃣ Fetch business partner details
  const [partnerRows] = await pool.execute(
    `
    SELECT first_name, last_name, company_name, email
    FROM business_partner
    WHERE id = ?
    `,
    [businessPartnerId]
  );

  if (partnerRows.length === 0) {
    throw new Error('Business partner not found');
  }

  const partner = partnerRows[0];

  // 2️⃣ Email content
  const mailOptions = {
    from: `"Gamified Safety" <${process.env.MAIL_USER || 'prabhushapure240901@gmail.com'}>`,
    to: userEmail,
    cc: partner.email,
    subject: `Game Completion – ${gameTitle}`,
    html: `
      <h3>Dear ${userName},</h3>

      <p>
        Congratulations on completing the <strong>${gameTitle}</strong> game.
      </p>

      <p>
        <strong>Game Token:</strong> ${tokenCode}
      </p>

      <p>
        Your completion certificate will be issued shortly.
      </p>

      <p>Best Regards,</p>
      <p style="font-size:14px;color:#555">
        ${partner.first_name} ${partner.last_name}<br/>
        ${partner.company_name}
      </p>
    `
  };

  // 3️⃣ Send mail
  await transporter.sendMail(mailOptions);
}
