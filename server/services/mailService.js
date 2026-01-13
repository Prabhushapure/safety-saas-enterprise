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
  tokenCode,
  gameTitle,
  gameImageUrl,
  businessPartnerId,
  certificatePath
}) {
  // 1️⃣ Fetch partner details
  const [partnerRows] = await pool.execute(
    `SELECT first_name, last_name, company_name, login_id
     FROM business_partner
     WHERE id = ?`,
    [businessPartnerId]
  );

  if (!partnerRows.length) {
    throw new Error('Business partner not found');
  }
  const partner = partnerRows[0];

  // 2️⃣ Get license_id from token
  const [[licenseRow]] = await pool.execute(
    `SELECT id FROM license WHERE token_code = ?`,
    [tokenCode]
  );

  if (!licenseRow) {
    throw new Error('License not found for token');
  }

  const licenseId = licenseRow.id;

  // 3️⃣ Fetch aggregated play data (YOUR QUERY)
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
<div style="font-family:Arial;background:#f5f6fa;padding:20px">

<p>Dear <strong>${userName}</strong>,</p>

<p>
Congratulations on completing the <strong>${gameTitle}</strong> game.
Please find your final play statistics and completion certificate attached.
</p>

<table width="100%" style="max-width:520px;margin:auto;background:#fff;border:2px solid #5b6ef5;border-radius:8px">
  <tr>
    <td style="padding:12px;background:#5b6ef5;color:#fff;font-weight:bold">
      ${gameTitle} – Final Play Statistics
    </td>
  </tr>

  <tr>
    <td style="padding:14px;font-size:13px">
      <p>🎮 <b>No. of Times Played:</b> ${stats.total_plays}</p>
      <p>✅ <b>No. of Times Passed:</b> ${stats.total_pass}</p>
      <p>❌ <b>No. of Times Failed:</b> ${stats.total_fail}</p>
      <p>⚠️ <b>No. of Times Aborted:</b> ${stats.total_abort}</p>
      <p>🏆 <b>Best Score:</b> ${stats.best_score}%</p>
      <p>📌 <b>Token Status:</b> Completed</p>
    </td>

    <td style="padding:14px;vertical-align:top;width:40%">
      <table width="100%" style="border:1px solid #e0e0e0;border-radius:6px;background:#fafafa">
        <tr>
          <td style="padding:6px;text-align:center">
            <img 
              src="${gameImageUrl}" 
              alt="${gameTitle}"
              style="width:100%;max-width:160px;border-radius:6px;display:block;margin:auto"
            />
          </td>
        </tr>
        <tr>
          <td style="padding:6px;text-align:center;font-size:12px;font-weight:bold;color:#333">
            ${gameTitle}
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <tr>
    <td style="padding:10px;background:#f9f9f9;font-size:12px;color:#777">
      Game Token: <b>${tokenCode}</b>
    </td>
  </tr>
</table>



<p>Best Regards,</p>
<p style="font-size:13px;color:#555">
${partner.first_name} ${partner.last_name}<br/>
${partner.company_name}
</p>

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
