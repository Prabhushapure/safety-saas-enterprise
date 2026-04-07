import nodemailer from 'nodemailer';
import pool from '../config/database.js';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_USER || 'support@antiztech.com',
    pass: process.env.MAIL_PASS || 'bsxgkmsowtdgctnz'
  }
});

export async function sendGameCompletionMail({
  userName,
  userEmail,
  userOrganization,
  tokenCode,
  gameTitle,
  gameImageUrl,
  businessPartnerId,
  certificatePath
}) {

  const [partnerRows] = await pool.execute(
    `SELECT 
  bp.first_name,
  bp.last_name,
  c.company_name,
  bp.login_id
FROM business_partner bp
LEFT JOIN company c 
  ON bp.company_id = c.id
WHERE bp.id = ?`,
    [businessPartnerId]
  );

  if (!partnerRows.length) {
    throw new Error('Business partner not found');
  }
  const partner = partnerRows[0];

  const [[licenseRow]] = await pool.execute(
    `SELECT id FROM license WHERE token_code = ?`,
    [tokenCode]
  );

  if (!licenseRow) {
    throw new Error('License not found for token');
  }

  const licenseId = licenseRow.id;

  const [statsRows] = await pool.query(
    `SELECT 
      COUNT(*) AS total_plays,
      COALESCE(SUM(CASE WHEN play_result = 'Pass' THEN 1 ELSE 0 END), 0) AS total_pass,
      COALESCE(SUM(CASE WHEN play_result = 'Fail' THEN 1 ELSE 0 END), 0) AS total_fail,
      COALESCE(SUM(CASE WHEN play_result IS NULL THEN 1 ELSE 0 END), 0) AS total_abort,
      COALESCE(MAX(score), 0) AS best_score
     FROM play_tracker
     WHERE license_id = ?`,
    [licenseId]
  );

  const stats = statsRows[0] || {
    total_plays: 0,
    total_pass: 0,
    total_fail: 0,
    total_abort: 0,
    best_score: 0
  };

  // 4️⃣ Email content
  const mailOptions = {
    from: `"Gamified Safety" <${process.env.MAIL_USER}>`,
    to: userEmail,
    cc: partner.login_id,
    subject: `Game Completion – ${gameTitle}`,
    html: `
<div style="max-width: 600px; margin: 0 auto; border: 2px solid #000; font-family: Arial, sans-serif; background-color: #fff;">
  
  <table width="100%" cellspacing="0" cellpadding="0" style="padding: 20px 20px 10px 20px;">
    <tr>
      <td align="left" valign="middle">
        <img src="${process.env.BASE_URL || 'https://www.antiz-digital.com/GamifiedLearning/'}/antiz-logo.png" alt="Antiz Technologies" style="height: 45px; display: block; border: none;" />
      </td>
      <td align="right" valign="middle" style="font-weight: bold; font-size: 16px; text-transform: uppercase;">
        GAMIFIED LEARNING
      </td>
    </tr>
  </table>

  <div style="padding: 0 40px 20px 40px;">
    
    <h2 style="margin: 0 0 10px 0; font-size: 22px; font-weight: bold; text-transform: uppercase;">
      ${gameTitle}
    </h2>
    <p style="margin: 0 0 25px 0; font-size: 15px; font-weight: bold;">
      Sponsored by <span style="font-weight: normal;">${partner.first_name} ${partner.last_name ? ' ' + partner.last_name : ''}, ${partner.company_name}.</span>
    </p>

    <p style="margin: 0 0 5px 0; font-size: 15px;">
      <strong>User Name:</strong> ${userName}
    </p>
    <p style="margin: 0 0 25px 0; font-size: 15px;">
      <strong>Organization:</strong> ${userOrganization || 'N/A'}
    </p>

    <p style="margin: 0 0 25px 0; font-size: 15px; line-height: 1.5;">
      Congratulations on completing the Game on the Topic mentioned above.
    </p>

    <table width="100%" style="max-width: 350px; margin: 0 auto 30px auto; background-color: #fcece0; border-radius: 20px; padding: 20px;">
      <tr>
        <td style="font-size: 15px; line-height: 1.6; color: #000;">
          <strong>Play Statistics:</strong><br>
          Number of times Played: ${stats.total_plays}<br>
          Number of times Passed: ${stats.total_pass}<br>
          Number of Times Failed: ${stats.total_fail}<br>
          Number of times aborted: ${stats.total_abort}<br>
          Best Score: ${stats.best_score}%
        </td>
      </tr>
    </table>

    <p style="margin: 0 0 5px 0; font-size: 15px; font-weight: bold;">
      Topic Completion Certificate
    </p>
    <p style="margin: 0 0 25px 0; font-size: 15px;">
      Your Topic Completion Certificate is attached to this email.
    </p>

    <div style="background-color: #c05a22; color: #fff; padding: 15px; border-radius: 8px; text-align: center; font-size: 15px; margin-bottom: 25px;">
      Please contact your Sponsor for any further clarifications.
    </div>

    <p style="margin: 0 0 15px 0; text-align: center; font-weight: bold; font-size: 18px;">
      THANK YOU
    </p>

  </div>

  <div style="background-color: #000; color: #fff; text-align: center; padding: 15px; font-size: 12px;">
    &copy; ${new Date().getFullYear()} Antiz Technologies (P) Ltd. All rights reserved.
  </div>

</div>
`,
    attachments: [
      {
        filename: `${gameTitle.replace(/\s+/g, '_')}_Certificate.pdf`,
        path: certificatePath,
        contentType: 'application/pdf'
      }
    ]

  };

  // 5️⃣ Send mail
  await transporter.sendMail(mailOptions);
}
