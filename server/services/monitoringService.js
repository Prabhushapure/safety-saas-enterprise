import axios from 'axios';
import pool from '../config/database.js';

export async function sendRegistrationEvent({ tenantId, gameName }) {
  try {
    const payload = {
      account: '20e6a18a-5edd-4e7d-b36a-e8b6c8fd1863',
      tenant: tenantId,
      applicationid: 'c47f517a-b1d8-43a3-af32-9e2e3ade0ac6',
      [gameName]: 1
    };

    await axios.post(
      'https://saasifynow.com/qeapi/datastream',
      [payload],
      {
        params: {
          account: '20e6a18a-5edd-4e7d-b36a-e8b6c8fd1863',
          stream: gameName,
          enablekey: true
        },
        headers: {
          'c_session_id': '03e3d5bc-5bdd-4588-8246-cc99b9e43579',
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: 5000
      }
    );

    // ✅ SUCCESS log
    await pool.execute(
      `INSERT INTO monitoring_event_log 
       (tenant_id, game_name, status)
       VALUES (?, ?, 'SUCCESS')`,
      [tenantId, gameName]
    );

    console.log(`✅ Monitoring event sent for game: ${gameName}`);

  } catch (error) {
    const statusCode = error.response?.status;
    const errorMsg = error.response?.data
      ? JSON.stringify(error.response.data)
      : error.message;

    if ([401, 403].includes(statusCode)) {
      console.error('🚨 Monitoring session expired. Regenerate c_session_id');
    }

    // ❌ FAILURE log
    try {
      await pool.execute(
        `INSERT INTO monitoring_event_log 
         (tenant_id, game_name, status, error)
         VALUES (?, ?, 'FAILED', ?)`,
        [tenantId, gameName, errorMsg]
      );
    } catch (dbError) {
      console.error('Failed to log monitoring failure:', dbError);
    }

    console.error(
      `❌ Monitoring API failed for game ${gameName}:`,
      statusCode,
      errorMsg
    );
  }
}
