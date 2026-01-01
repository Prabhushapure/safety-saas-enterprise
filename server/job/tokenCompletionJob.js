import pool from '../config/database.js';

async function runTokenCompletionJob() {
  console.log('🔁 Token Completion Job started:', new Date());

  const [licenses] = await pool.query(`
    SELECT id, token_code
    FROM license
    WHERE status = 'assigned'
      AND registered_at IS NOT NULL
      AND registered_at + INTERVAL 3 DAY <= NOW()
      AND certificate_status = 0
  `);

  console.log(`✅ Eligible tokens found: ${licenses.length}`);

  for (const license of licenses) {
    console.log(`➡ Processing token: ${license.token_code}`);

    // (Email logic will come next)

    await pool.query(`
      UPDATE license
      SET status = 'used',
          certificate_status = 1
      WHERE id = ?
    `, [license.id]);

    console.log(`✔ Token marked as used: ${license.token_code}`);
  }

  console.log('✅ Token Completion Job finished:', new Date());
  process.exit(0);
}

runTokenCompletionJob().catch(err => {
  console.error('❌ Job failed:', err);
  process.exit(1);
});
