/** Game 43 uses score-based stats (incomplete / abort) instead of pass-fail-abort by play_result alone. */
export const GAME_43_ID = 43;

const DEFAULT_STATS = {
  total_plays: 0,
  total_pass: 0,
  total_fail: 0,
  total_incomplete: 0,
  total_abort: 0,
  best_score: 0,
  last_play_no: 0
};

export async function getPlayStatsForLicense(pool, licenseId, gameId) {
  const isGame43 = Number(gameId) === GAME_43_ID;

  if (isGame43) {
    const [statsRows] = await pool.query(
      `SELECT
         COUNT(*) AS total_plays,
         COALESCE(SUM(CASE WHEN score IS NOT NULL AND play_result = 'Pass' THEN 1 ELSE 0 END), 0) AS total_pass,
         COALESCE(SUM(
           CASE WHEN score IS NULL
             AND CAST(pt.play_no AS UNSIGNED) = m.max_play_no
           THEN 1 ELSE 0 END
         ), 0) AS total_incomplete,
         COALESCE(SUM(
           CASE WHEN score IS NULL
             AND CAST(pt.play_no AS UNSIGNED) < m.max_play_no
           THEN 1 ELSE 0 END
         ), 0) AS total_abort,
         COALESCE(MAX(pt.score), 0) AS best_score,
         COALESCE(m.max_play_no, 0) AS last_play_no
       FROM play_tracker pt
       CROSS JOIN (
         SELECT COALESCE(MAX(CAST(play_no AS UNSIGNED)), 0) AS max_play_no
         FROM play_tracker
         WHERE license_id = ?
       ) m
       WHERE pt.license_id = ?`,
      [licenseId, licenseId]
    );

    const row = statsRows[0] || DEFAULT_STATS;
    return {
      total_plays: row.total_plays,
      total_pass: row.total_pass,
      total_incomplete: row.total_incomplete,
      total_abort: row.total_abort,
      best_score: row.best_score,
      last_play_no: row.last_play_no,
      game_id: GAME_43_ID,
      score_display_percent: false
    };
  }

  const [statsRows] = await pool.query(
    `SELECT
       COUNT(*) AS total_plays,
       COALESCE(SUM(CASE WHEN play_result = 'Pass' THEN 1 ELSE 0 END), 0) AS total_pass,
       COALESCE(SUM(CASE WHEN play_result = 'Fail' THEN 1 ELSE 0 END), 0) AS total_fail,
       COALESCE(SUM(CASE WHEN play_result IS NULL THEN 1 ELSE 0 END), 0) AS total_abort,
       COALESCE(MAX(score), 0) AS best_score,
       COALESCE(MAX(CAST(play_no AS UNSIGNED)), 0) AS last_play_no
     FROM play_tracker
     WHERE license_id = ?`,
    [licenseId]
  );

  const row = statsRows[0] || DEFAULT_STATS;
  return {
    ...row,
    score_display_percent: true
  };
}
