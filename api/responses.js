const mysql = require("mysql2/promise");

const dbConfig = {
  host: process.env.MYSQL_HOST,
  port: process.env.MYSQL_PORT,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
};

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Méthode non autorisée" });

  const conn = await mysql.createConnection(dbConfig);

  try {
    // Détail d'une réponse spécifique
    if (req.query.id) {
      const id = req.query.id;

      const [[general]] = await conn.execute(`SELECT * FROM general_info WHERE response_id = ?`, [id]);
      const [[activities]] = await conn.execute(`SELECT * FROM activities WHERE response_id = ?`, [id]);
      const [categories] = await conn.execute(`SELECT * FROM product_categories WHERE response_id = ?`, [id]);
      const [productList] = await conn.execute(`SELECT * FROM product_list WHERE response_id = ?`, [id]);
      const [[productDetails]] = await conn.execute(`SELECT * FROM product_details WHERE response_id = ?`, [id]);
      const [[operations]] = await conn.execute(`SELECT * FROM operations WHERE response_id = ?`, [id]);
      const [[contextInfo]] = await conn.execute(`SELECT * FROM context_info WHERE response_id = ?`, [id]);
      const [[openQuestions]] = await conn.execute(`SELECT * FROM open_questions WHERE response_id = ?`, [id]);

      return res.status(200).json({
        success: true,
        data: { general, activities, categories, productList, productDetails, operations, contextInfo, openQuestions }
      });
    }

    // Liste de toutes les réponses
    const [rows] = await conn.execute(
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
    await conn.end();
  }
}