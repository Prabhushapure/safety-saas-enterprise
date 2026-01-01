import pool from '../config/database.js';
import { sendGameCompletionMail } from '../services/mailService.js';

async function runTokenCompletionJob() {
  console.log('🔁 Token Completion Job started:', new Date());

  const [rows] = await pool.query(`
    SELECT
      l.id,
      l.token_code,
      l.business_partner_id,
      u.name AS user_name,
      u.email_id AS user_email,
      g.game_title AS game_title
    FROM license l
    JOIN user u ON u.id = l.user_id
    JOIN game g ON g.id = l.game_id
    WHERE l.status = 'assigned'
      AND l.registered_at IS NOT NULL
      AND l.registered_at + INTERVAL 3 DAY <= NOW()
      AND l.certificate_status = 0
  `);

  console.log(`✅ Eligible tokens found: ${rows.length}`);

  for (const row of rows) {
    console.log(`➡ Processing token: ${row.token_code}`);

    // 1️⃣ Send email
    await sendGameCompletionMail({
      userName: row.user_name,
      userEmail: row.user_email,
      tokenCode: row.token_code,
      gameTitle: row.game_title,
      businessPartnerId: row.business_partner_id
    });

    // 2️⃣ Update DB ONLY after email success
    await pool.query(
      `
      UPDATE license
      SET status = 'used',
          certificate_status = 1
      WHERE id = ?
      `,
      [row.id]
    );

    console.log(`✔ Email sent & token marked as used: ${row.token_code}`);
  }

  console.log('✅ Token Completion Job finished:', new Date());
  process.exit(0);
}

runTokenCompletionJob().catch(err => {
  console.error('❌ Job failed:', err);
  process.exit(1);
});
