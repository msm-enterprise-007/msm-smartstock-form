const API_URL = 'http://localhost:5000/api';
const ADMIN_PASSWORD = 'admin123'; // À changer

let isLoggedIn = false;

// Vérifier si déjà connecté
if (sessionStorage.getItem('admin_logged') === 'true') {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('dashboardScreen').style.display = 'block';
    loadResponses();
}

function login() {
    const password = document.getElementById('adminPassword').value;
    if (password === ADMIN_PASSWORD) {
        sessionStorage.setItem('admin_logged', 'true');
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('dashboardScreen').style.display = 'block';
        document.getElementById('loginError').textContent = '';
        loadResponses();
    } else {
        document.getElementById('loginError').textContent = '❌ Mot de passe incorrect';
    }
}

function logout() {
    sessionStorage.removeItem('admin_logged');
    document.getElementById('loginScreen').style.display = 'block';
    document.getElementById('dashboardScreen').style.display = 'none';
    document.getElementById('adminPassword').value = '';
}

async function loadResponses() {
    try {
        const response = await fetch(`${API_URL}/responses`);
        const result = await response.json();
        
        const tbody = document.getElementById('responsesTable');
        
        if (result.success && result.data.length > 0) {
            tbody.innerHTML = result.data.map(row => `
                <tr>
                    <td>#${row.id}</td>
                    <td><strong>${row.company_name || 'N/A'}</strong></td>
                    <td>${row.responsible_name || 'N/A'}</td>
                    <td>${row.email || 'N/A'}</td>
                    <td>
                        <span class="status-badge status-${row.status}">
                            ${row.status === 'completed' ? '✅ Soumis' : '📝 Brouillon'}
                        </span>
                    </td>
                    <td>${new Date(row.created_at).toLocaleDateString('fr-FR')}</td>
                    <td>
                        <button onclick="viewResponse(${row.id})" class="btn-view">👁 Voir</button>
                        <button onclick="deleteResponse(${row.id})" class="btn-delete">🗑</button>
                    </td>
                </tr>
            `).join('');
        } else {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">Aucune réponse pour le moment</td></tr>';
        }
    } catch (error) {
        console.error('Erreur:', error);
        document.getElementById('responsesTable').innerHTML = 
            '<tr><td colspan="7" style="text-align:center;color:red;">❌ Erreur de chargement</td></tr>';
    }
}

function viewResponse(id) {
    window.open(`index.html?id=${id}`, '_blank');
}

async function deleteResponse(id) {
    if (!confirm('Supprimer cette réponse ?')) return;
    
    try {
        const response = await fetch(`${API_URL}/responses/${id}`, {
            method: 'DELETE'
        });
        const result = await response.json();
        if (result.success) {
            alert('✅ Supprimé avec succès');
            loadResponses();
        }
    } catch (error) {
        alert('❌ Erreur lors de la suppression');
    }
}

// Rafraîchir automatiquement toutes les 30 secondes
setInterval(() => {
    if (isLoggedIn) loadResponses();
}, 30000);