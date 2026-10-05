import pool from '../config/database.js';
import { sendGameCompletionMail } from '../services/mailService.js';
import { generateCertificatePDF } from '../services/certificateService.js';
import fs from 'fs';
import path from 'path';

async function runTokenCompletionJob() {
  console.log('Token Completion Job started:', new Date());

  const [rows] = await pool.query(`
    SELECT
      l.id,
      l.token_code,
      l.game_id,
      l.business_partner_id,
      u.name AS user_name,
      u.email_id AS user_email,
      u.organization AS user_organization,
      g.game_title AS game_title,
      g.image_url AS game_image_url,
      bp.first_name AS partner_first_name,
      bp.last_name AS partner_last_name,
      c.company_name AS partner_company
    FROM license l
    JOIN user u ON u.id = l.user_id
    JOIN game g ON g.id = l.game_id
    JOIN business_partner bp ON bp.id = l.business_partner_id
    LEFT JOIN company c ON bp.company_id = c.id
    WHERE l.status = 'assigned'
      AND l.registered_at IS NOT NULL
      AND l.registered_at + INTERVAL 3 DAY <= NOW()
      AND l.certificate_status = 0
    ORDER BY l.registered_at
    LIMIT 50
  `);

  console.log(`✅ Eligible tokens found: ${rows.length}`);

  const BASE_IMAGE_URL = 'https://www.antiz-digital.com';

  const CERT_DIR = path.join(
    process.cwd(),
    'server',
    'certificates',
    'generated'
  );

  if (!fs.existsSync(CERT_DIR)) {
    fs.mkdirSync(CERT_DIR, { recursive: true });
  }

  for (const row of rows) {
    console.log(`➡ Processing token: ${row.token_code}`);

    try {
      const gameImageUrl = row.game_image_url
        ? `${BASE_IMAGE_URL}${row.game_image_url}`
        : `${BASE_IMAGE_URL}/game_cards/default.png`;

      const certificatePath = path.join(
        CERT_DIR,
        `${row.token_code}.pdf`
      );

      const sponsorName = `${row.partner_first_name} ${row.partner_last_name} – ${row.partner_company}`;

      // 1️⃣ Generate certificate
      if (!fs.existsSync(certificatePath)) {
        await generateCertificatePDF({
          userName: row.user_name,
          userEmail: row.user_email,
          gameTitle: row.game_title,
          tokenCode: row.token_code,
          sponsorName,
          outputPath: certificatePath,
          gameId: row.game_id
        });
      }

      // 2️⃣ Send email with attachment
      await sendGameCompletionMail({
        userName: row.user_name,
        userEmail: row.user_email,
        userOrganization: row.user_organization,
        tokenCode: row.token_code,
        gameTitle: row.game_title,
        gameImageUrl,
        businessPartnerId: row.business_partner_id,
        certificatePath
      });

      // 3️⃣ Update DB
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
    } catch (err) {
      console.error(`❌ Failed for token ${row.token_code}:`, err.message);
    }
  }

  console.log('✅ Token Completion Job finished:', new Date());
  process.exit(0);
}

runTokenCompletionJob().catch(err => {
  console.error('❌ Job failed:', err);
  process.exit(1);
});
