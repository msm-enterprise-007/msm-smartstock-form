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
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Méthode non autorisée" });

  const data = req.body;
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const { rows } = await client.query("INSERT INTO responses DEFAULT VALUES RETURNING id");
    const responseId = rows[0].id;

    await client.query(
      `INSERT INTO general_info 
        (response_id, nom_entreprise, nom_responsable, adresse, telephone, email, date_creation, nb_employes, roles_employes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [responseId, data.nom_entreprise||null, data.nom_responsable||null, data.adresse||null, data.telephone||null, data.email||null, data.date_creation||null, data.nb_employes||null, data.roles_employes||null]
    );

    await client.query(
      `INSERT INTO activities (response_id, types_produits, autres_produits) VALUES ($1,$2,$3)`,
      [responseId, JSON.stringify(data.types_produits||[]), data.autres_produits||null]
    );

    if (data.categories && data.categories.length > 0) {
      for (const cat of data.categories) {
        await client.query(`INSERT INTO product_categories (response_id, categorie) VALUES ($1,$2)`, [responseId, cat]);
      }
    }

    if (data.product_list && data.product_list.length > 0) {
      for (const item of data.product_list) {
        await client.query(`INSERT INTO product_list (response_id, categorie, produits) VALUES ($1,$2,$3)`, [responseId, item.categorie, item.produits]);
      }
    }

    await client.query(
      `INSERT INTO product_details (response_id, infos_souhaitees, autres_infos, unites_vente, autres_unites) VALUES ($1,$2,$3,$4,$5)`,
      [responseId, JSON.stringify(data.infos_souhaitees||[]), data.autres_infos||null, JSON.stringify(data.unites_vente||[]), data.autres_unites||null]
    );

    await client.query(
      `INSERT INTO operations 
        (response_id, gestion_stock_methode, gestion_stock_explication, achat_qui_commande, achat_aupres_de, achat_enregistrement, achat_facture, achat_seuil_reapprovisionnement, vente_deroulement, vente_qui_sert, vente_qui_encaisse, vente_notation, stock_maj_frequence, stock_maj_autre, stock_connaissance_quantite, fournisseurs_nombre, fournisseurs_infos, fournisseurs_autres, employes_nb_vendeurs, employes_modif_stock, employes_decide_prix)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21)`,
      [responseId, JSON.stringify(data.gestion_stock_methode||[]), data.gestion_stock_explication||null, data.achat_qui_commande||null, data.achat_aupres_de||null, data.achat_enregistrement||null, data.achat_facture||null, data.achat_seuil_reapprovisionnement||null, data.vente_deroulement||null, data.vente_qui_sert||null, data.vente_qui_encaisse||null, data.vente_notation||null, JSON.stringify(data.stock_maj_frequence||[]), data.stock_maj_autre||null, data.stock_connaissance_quantite||null, data.fournisseurs_nombre||null, JSON.stringify(data.fournisseurs_infos||[]), data.fournisseurs_autres||null, data.employes_nb_vendeurs||null, data.employes_modif_stock||null, data.employes_decide_prix||null]
    );

    await client.query(
      `INSERT INTO context_info 
        (response_id, difficultes, difficultes_autres, plus_grande_difficulte, vente_credit, prix_variables, gros_detail, retours_marchandises, employes_modif_prix, produits_sensibles, journee_heure_ouverture, journee_premiere_tache, journee_reception_marchandises, journee_rangement, journee_deroulement_vente, journee_fermeture)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)`,
      [responseId, JSON.stringify(data.difficultes||[]), data.difficultes_autres||null, data.plus_grande_difficulte||null, data.vente_credit||null, data.prix_variables||null, data.gros_detail||null, data.retours_marchandises||null, data.employes_modif_prix||null, data.produits_sensibles||null, data.journee_heure_ouverture||null, data.journee_premiere_tache||null, data.journee_reception_marchandises||null, data.journee_rangement||null, data.journee_deroulement_vente||null, data.journee_fermeture||null]
    );

    await client.query(
      `INSERT INTO open_questions 
        (response_id, q1_rupture, q2_perte_temps, q3_moment_erreurs, q4_tache_fatigante, q5_tache_a_supprimer, q6_perte_argent, q7_infos_recherchees, q8_simplification, q9_autres_infos)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
      [responseId, data.q1_rupture||null, data.q2_perte_temps||null, data.q3_moment_erreurs||null, data.q4_tache_fatigante||null, data.q5_tache_a_supprimer||null, data.q6_perte_argent||null, data.q7_infos_recherchees||null, data.q8_simplification||null, data.q9_autres_infos||null]
    );

    await client.query("COMMIT");
    res.status(200).json({ success: true, message: "Réponse enregistrée avec succès." });

  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ success: false, message: "Erreur serveur.", error: err.message });
  } finally {
    client.release();
  }
}