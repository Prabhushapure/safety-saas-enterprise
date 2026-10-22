export async function getCatalogForCompany(pool, companyId, { activeOnly = false } = {}) {
  const [rows] = await pool.execute(
    `
      SELECT
        ANY_VALUE(c.company_name) AS company_name,
        g.id,
        g.game_title,
        g.short_desc,
        g.long_desc,
        g.image_url,
        g.game_url,
        g.game_list_price,
        g.is_active,
        GROUP_CONCAT(gc.category_id) AS category_ids
      FROM company c
      JOIN company_game_lists cgl
        ON c.id = cgl.company_id
      JOIN game_list_games glg
        ON cgl.game_list_id = glg.game_list_id
      JOIN game g
        ON glg.game_id = g.id
      LEFT JOIN game_x_category gc
        ON g.id = gc.game_id
      WHERE c.id = ?
        ${activeOnly ? 'AND g.is_active = 1' : ''}
      GROUP BY g.id
      ORDER BY g.is_active DESC, g.game_title ASC
    `,
    [companyId]
  );

  const companyName = rows.length > 0 ? rows[0].company_name : null;
  const games = rows.map((g) => ({
    id: g.id,
    title: g.game_title,
    short_desc: g.short_desc,
    long_desc: g.long_desc,
    image_url: g.image_url,
    game_url: g.game_url,
    list_price: g.game_list_price,
    is_active: g.is_active,
    categories: g.category_ids ? g.category_ids.split(',').map(Number) : []
  }));

  return { companyName, games };
}
