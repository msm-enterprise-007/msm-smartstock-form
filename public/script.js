// --- Champs dynamiques : Catégories (Section 3) ---
let categorieCount = 1;

function addCategorie() {
  categorieCount++;
  const container = document.getElementById("categories-container");
  const row = document.createElement("div");
  row.className = "dynamic-row";
  row.innerHTML = `
    <input type="text" class="categorie-input" placeholder="Catégorie ${categorieCount}" />
    <button type="button" class="btn-remove" onclick="removeRow(this)">✕</button>
  `;
  container.appendChild(row);
}

function removeRow(btn) {
  const row = btn.parentElement;
  row.remove();
}

// --- Champs dynamiques : Produits par catégorie (Section 4) ---
function addProduitBlock() {
  const container = document.getElementById("produits-container");
  const block = document.createElement("div");
  block.className = "dynamic-block";
  block.innerHTML = `
    <input type="text" class="produit-categorie-input" placeholder="Catégorie" />
    <textarea class="produit-liste-input" rows="3" placeholder="Produits (un par ligne)"></textarea>
    <button type="button" class="btn-remove" onclick="removeBlock(this)">✕ Supprimer</button>
  `;
  container.appendChild(block);
}

function removeBlock(btn) {
  const block = btn.parentElement;
  block.remove();
}

// --- Collecte des checkboxes ---
function getCheckedValues(name) {
  return Array.from(document.querySelectorAll(`input[name="${name}"]:checked`))
    .map(el => el.value);
}

// --- Collecte des catégories dynamiques ---
function getCategories() {
  return Array.from(document.querySelectorAll(".categorie-input"))
    .map(el => el.value.trim())
    .filter(v => v !== "");
}

// --- Collecte des produits dynamiques ---
function getProductList() {
  const blocks = document.querySelectorAll(".dynamic-block");
  const result = [];
  blocks.forEach(block => {
    const categorie = block.querySelector(".produit-categorie-input").value.trim();
    const produits = block.querySelector(".produit-liste-input").value.trim();
    if (categorie !== "") {
      result.push({ categorie, produits });
    }
  });
  return result;
}

// --- Soumission du formulaire ---
document.getElementById("mainForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const btn = document.querySelector(".btn-submit");
  const message = document.getElementById("form-message");

  btn.disabled = true;
  btn.textContent = "Envoi en cours...";
  message.textContent = "";
  message.className = "";

  const data = {
    // Section 1
    nom_entreprise: document.querySelector('[name="nom_entreprise"]').value.trim(),
    nom_responsable: document.querySelector('[name="nom_responsable"]').value.trim(),
    adresse: document.querySelector('[name="adresse"]').value.trim(),
    telephone: document.querySelector('[name="telephone"]').value.trim(),
    email: document.querySelector('[name="email"]').value.trim(),
    date_creation: document.querySelector('[name="date_creation"]').value.trim(),
    nb_employes: document.querySelector('[name="nb_employes"]:checked')?.value || null,
    roles_employes: document.querySelector('[name="roles_employes"]').value.trim(),

    // Section 2
    types_produits: getCheckedValues("types_produits"),
    autres_produits: document.querySelector('[name="autres_produits"]').value.trim(),

    // Section 3
    categories: getCategories(),

    // Section 4
    product_list: getProductList(),

    // Section 5
    infos_souhaitees: getCheckedValues("infos_souhaitees"),
    autres_infos: document.querySelector('[name="autres_infos"]').value.trim(),

    // Section 6
    unites_vente: getCheckedValues("unites_vente"),
    autres_unites: document.querySelector('[name="autres_unites"]').value.trim(),

    // Section 7
    gestion_stock_methode: getCheckedValues("gestion_stock_methode"),
    gestion_stock_explication: document.querySelector('[name="gestion_stock_explication"]').value.trim(),

    // Section 8
    achat_qui_commande: document.querySelector('[name="achat_qui_commande"]').value.trim(),
    achat_aupres_de: document.querySelector('[name="achat_aupres_de"]').value.trim(),
    achat_enregistrement: document.querySelector('[name="achat_enregistrement"]').value.trim(),
    achat_facture: document.querySelector('[name="achat_facture"]:checked')?.value || null,
    achat_seuil_reapprovisionnement: document.querySelector('[name="achat_seuil_reapprovisionnement"]').value.trim(),

    // Section 9
    vente_deroulement: document.querySelector('[name="vente_deroulement"]').value.trim(),
    vente_qui_sert: document.querySelector('[name="vente_qui_sert"]').value.trim(),
    vente_qui_encaisse: document.querySelector('[name="vente_qui_encaisse"]').value.trim(),
    vente_notation: document.querySelector('[name="vente_notation"]').value.trim(),

    // Section 10
    stock_maj_frequence: getCheckedValues("stock_maj_frequence"),
    stock_maj_autre: document.querySelector('[name="stock_maj_autre"]').value.trim(),
    stock_connaissance_quantite: document.querySelector('[name="stock_connaissance_quantite"]').value.trim(),

    // Section 11
    fournisseurs_nombre: document.querySelector('[name="fournisseurs_nombre"]').value.trim(),
    fournisseurs_infos: getCheckedValues("fournisseurs_infos"),
    fournisseurs_autres: document.querySelector('[name="fournisseurs_autres"]').value.trim(),

    // Section 12
    employes_nb_vendeurs: document.querySelector('[name="employes_nb_vendeurs"]').value.trim(),
    employes_modif_stock: document.querySelector('[name="employes_modif_stock"]').value.trim(),
    employes_decide_prix: document.querySelector('[name="employes_decide_prix"]').value.trim(),

    // Section 13
    difficultes: getCheckedValues("difficultes"),
    difficultes_autres: document.querySelector('[name="difficultes_autres"]').value.trim(),
    plus_grande_difficulte: document.querySelector('[name="plus_grande_difficulte"]').value.trim(),

    // Section 14
    vente_credit: document.querySelector('[name="vente_credit"]:checked')?.value || null,
    prix_variables: document.querySelector('[name="prix_variables"]:checked')?.value || null,
    gros_detail: document.querySelector('[name="gros_detail"]:checked')?.value || null,
    retours_marchandises: document.querySelector('[name="retours_marchandises"]:checked')?.value || null,
    employes_modif_prix: document.querySelector('[name="employes_modif_prix"]:checked')?.value || null,
    produits_sensibles: document.querySelector('[name="produits_sensibles"]').value.trim(),

    // Section 15
    journee_heure_ouverture: document.querySelector('[name="journee_heure_ouverture"]').value.trim(),
    journee_premiere_tache: document.querySelector('[name="journee_premiere_tache"]').value.trim(),
    journee_reception_marchandises: document.querySelector('[name="journee_reception_marchandises"]').value.trim(),
    journee_rangement: document.querySelector('[name="journee_rangement"]').value.trim(),
    journee_deroulement_vente: document.querySelector('[name="journee_deroulement_vente"]').value.trim(),
    journee_fermeture: document.querySelector('[name="journee_fermeture"]').value.trim(),

    // Section 16
    q1_rupture: document.querySelector('[name="q1_rupture"]').value.trim(),
    q2_perte_temps: document.querySelector('[name="q2_perte_temps"]').value.trim(),
    q3_moment_erreurs: document.querySelector('[name="q3_moment_erreurs"]').value.trim(),
    q4_tache_fatigante: document.querySelector('[name="q4_tache_fatigante"]').value.trim(),
    q5_tache_a_supprimer: document.querySelector('[name="q5_tache_a_supprimer"]').value.trim(),
    q6_perte_argent: document.querySelector('[name="q6_perte_argent"]').value.trim(),
    q7_infos_recherchees: document.querySelector('[name="q7_infos_recherchees"]').value.trim(),
    q8_simplification: document.querySelector('[name="q8_simplification"]').value.trim(),
    q9_autres_infos: document.querySelector('[name="q9_autres_infos"]').value.trim(),
  };

  try {
    const response = await fetch("/api/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (result.success) {
      message.textContent = "✅ Formulaire envoyé avec succès. Merci !";
      message.className = "success";
      document.getElementById("mainForm").reset();
      // Réinitialiser les champs dynamiques
      document.getElementById("categories-container").innerHTML = `
        <div class="dynamic-row">
          <input type="text" class="categorie-input" placeholder="Catégorie 1" />
          <button type="button" class="btn-remove" onclick="removeRow(this)">✕</button>
        </div>`;
      document.getElementById("produits-container").innerHTML = `
        <div class="dynamic-block">
          <input type="text" class="produit-categorie-input" placeholder="Catégorie" />
          <textarea class="produit-liste-input" rows="3" placeholder="Produits (un par ligne)"></textarea>
          <button type="button" class="btn-remove" onclick="removeBlock(this)">✕ Supprimer</button>
        </div>`;
    } else {
      message.textContent = "❌ Une erreur est survenue. Veuillez réessayer.";
      message.className = "error";
    }
  } catch (err) {
    message.textContent = "❌ Impossible de contacter le serveur. Vérifiez votre connexion.";
    message.className = "error";
  } finally {
    btn.disabled = false;
    btn.textContent = "Envoyer le formulaire";
  }
});