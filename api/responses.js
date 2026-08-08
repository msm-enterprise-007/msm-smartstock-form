const express = require("express");
const mysql = require("mysql2/promise");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const dbConfig = {
  host: process.env.MYSQL_HOST,
  port: process.env.MYSQL_PORT,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
};

// Récupérer toutes les réponses (liste)
app.get("/api/responses", async (req, res) => {
  const conn = await mysql.createConnection(dbConfig);
  try {
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
});

// Récupérer le détail complet d'une réponse
app.get("/api/responses/:id", async (req, res) => {
  const id = req.params.id;
  const conn = await mysql.createConnection(dbConfig);
  try {
    const [[general]] = await conn.execute(
      `SELECT * FROM general_info WHERE response_id = ?`, [id]
    );
    const [[activities]] = await conn.execute(
      `SELECT * FROM activities WHERE response_id = ?`, [id]
    );
    const [categories] = await conn.execute(
      `SELECT * FROM product_categories WHERE response_id = ?`, [id]
    );
    const [productList] = await conn.execute(
      `SELECT * FROM product_list WHERE response_id = ?`, [id]
    );
    const [[productDetails]] = await conn.execute(
      `SELECT * FROM product_details WHERE response_id = ?`, [id]
    );
    const [[operations]] = await conn.execute(
      `SELECT * FROM operations WHERE response_id = ?`, [id]
    );
    const [[contextInfo]] = await conn.execute(
      `SELECT * FROM context_info WHERE response_id = ?`, [id]
    );
    const [[openQuestions]] = await conn.execute(
      `SELECT * FROM open_questions WHERE response_id = ?`, [id]
    );

    res.status(200).json({
      success: true,
      data: {
        general,
        activities,
        categories,
        productList,
        productDetails,
        operations,
        contextInfo,
        openQuestions,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Erreur serveur.", error: err.message });
  } finally {
    await conn.end();
  }
});

module.exports = app;