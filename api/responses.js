const { Pool } = require("pg");

const pool = new Pool({
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  ssl: { rejectUnauthorized: false },
});

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Méthode non autorisée" });

  const client = await pool.connect();

  try {
    if (req.query.id) {
      const id = req.query.id;

      const { rows: general } = await client.query(`SELECT * FROM general_info WHERE response_id = $1`, [id]);
      const { rows: activities } = await client.query(`SELECT * FROM activities WHERE response_id = $1`, [id]);
      const { rows: categories } = await client.query(`SELECT * FROM product_categories WHERE response_id = $1`, [id]);
      const { rows: productList } = await client.query(`SELECT * FROM product_list WHERE response_id = $1`, [id]);
      const { rows: productDetails } = await client.query(`SELECT * FROM product_details WHERE response_id = $1`, [id]);
      const { rows: operations } = await client.query(`SELECT * FROM operations WHERE response_id = $1`, [id]);
      const { rows: contextInfo } = await client.query(`SELECT * FROM context_info WHERE response_id = $1`, [id]);
      const { rows: openQuestions } = await client.query(`SELECT * FROM open_questions WHERE response_id = $1`, [id]);

      return res.status(200).json({
        success: true,
        data: {
          general: general[0],
          activities: activities[0],
          categories,
          productList,
          productDetails: productDetails[0],
          operations: operations[0],
          contextInfo: contextInfo[0],
          openQuestions: openQuestions[0],
        }
      });
    }

    const { rows } = await client.query(
      `SELECT r.id, r.submitted_at, g.nom_entreprise, g.nom_responsable, g.telephone, g.email
       FROM responses r
       LEFT JOIN general_info g ON g.response_id = r.id
       ORDER BY r.submitted_at DESC`
    );
    res.status(200).json({ success: true, data: rows });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Erreur serveur.", error: err.message });
  } finally {
    client.release();
  }
}