// Configuration
const API_URL = 'http://localhost:5000/api'; // À changer en production

let currentId = null;
let autoSaveTimer = null;
let isSaving = false;

// ============ CHARGEMENT INITIAL ============
document.addEventListener('DOMContentLoaded', () => {
    // Vérifier s'il y a un ID dans l'URL
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (id) {
        loadResponse(id);
    }
    
    // Auto-save toutes les 30 secondes
    autoSaveTimer = setInterval(autoSave, 30000);
    
    // Sauvegarde avant de quitter
    window.addEventListener('beforeunload', () => {
        saveForm();
    });
});

// ============ FONCTIONS ============

// Ajouter une catégorie
function addCategory() {
    const container = document.getElementById('categories_container');
    const count = container.children.length + 1;
    const div = document.createElement('div');
    div.className = 'dynamic-input';
    div.innerHTML = `<input type="text" class="category-input" placeholder="Catégorie ${count}">`;
    container.appendChild(div);
}

// Ajouter une catégorie de produits
function addProductCategory() {
    const container = document.getElementById('products_container');
    const div = document.createElement('div');
    div.className = 'product-category-group';
    div.innerHTML = `
        <input type="text" class="product-category" placeholder="Catégorie">
        <textarea class="product-list" rows="3" placeholder="Listez les produits (un par ligne)"></textarea>
    `;
    container.appendChild(div);
}

// ============ SAUVEGARDE ============
function collectFormData() {
    // Section 1
    const employeeCount = document.querySelector('input[name="employee_count"]:checked');
    
    // Section 2
    const productTypes = Array.from(document.querySelectorAll('#product_types input:checked'))
        .map(el => el.value);
    const otherProducts = document.getElementById('other_products').value;
    if (otherProducts) productTypes.push(otherProducts);
    
    // Section 3
    const categories = Array.from(document.querySelectorAll('.category-input'))
        .map(el => el.value.trim())
        .filter(val => val);
    
    // Section 4
    const productGroups = document.querySelectorAll('.product-category-group');
    const products = {};
    productGroups.forEach(group => {
        const cat = group.querySelector('.product-category').value.trim();
        const items = group.querySelector('.product-list').value
            .split('\n')
            .map(s => s.trim())
            .filter(s => s);
        if (cat && items.length > 0) {
            products[cat] = items;
        }
    });
    
    // Section 5
    const productInfo = Array.from(document.querySelectorAll('#product_info input:checked'))
        .map(el => el.value);
    const otherInfo = document.getElementById('other_product_info').value;
    if (otherInfo) productInfo.push(otherInfo);
    
    // Section 6
    const saleUnits = Array.from(document.querySelectorAll('#sale_units input:checked'))
        .map(el => el.value);
    const otherUnits = document.getElementById('other_units').value;
    if (otherUnits) saleUnits.push(otherUnits);
    
    // Section 14
    const specialCases = {
        credit: document.getElementById('credit_sales').value === 'true',
        variable_pricing: document.getElementById('variable_pricing').value === 'true',
        wholesale_retail: document.getElementById('wholesale_retail').value === 'true',
        returns: document.getElementById('returns').value === 'true'
    };
    
    // Section 16
    const openQuestions = {
        q1: document.getElementById('oq1').value,
        q2: document.getElementById('oq2').value,
        q3: document.getElementById('oq3').value,
        q4: document.getElementById('oq4').value,
        q5: document.getElementById('oq5').value,
        q6: document.getElementById('oq6').value,
        q7: document.getElementById('oq7').value,
        q8: document.getElementById('oq8').value,
        q9: document.getElementById('oq9').value
    };
    
    return {
        id: currentId,
        company_name: document.getElementById('company_name').value,
        responsible_name: document.getElementById('responsible_name').value,
        address: document.getElementById('address').value,
        phone: document.getElementById('phone').value,
        email: document.getElementById('email').value,
        creation_date: document.getElementById('creation_date').value,
        employee_count: employeeCount ? employeeCount.value : '',
        employee_roles: document.getElementById('employee_roles').value,
        product_types: productTypes,
        categories: categories,
        products: products,
        product_info: productInfo,
        sale_units: saleUnits,
        stock_management: document.getElementById('stock_management').value,
        purchase_process: document.getElementById('purchase_process').value,
        sales_process: document.getElementById('sales_process').value,
        stock_update: document.getElementById('stock_update').value,
        suppliers_info: document.getElementById('suppliers_info').value,
        employees_info: document.getElementById('employees_info').value,
        difficulties: document.getElementById('difficulties').value,
        special_cases: specialCases,
        daily_operations: document.getElementById('daily_operations').value,
        open_questions: openQuestions,
        status: 'draft'
    };
}

async function saveForm() {
    if (isSaving) return;
    isSaving = true;
    
    const statusEl = document.getElementById('saveStatus');
    statusEl.textContent = '⏳ Sauvegarde...';
    statusEl.className = 'auto-save-status saving';
    
    try {
        const data = collectFormData();
        const response = await fetch(`${API_URL}/responses`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        if (result.success) {
            currentId = result.id;
            document.getElementById('responseId').value = result.id;
            statusEl.textContent = '✅ Sauvegardé à ' + new Date().toLocaleTimeString();
            statusEl.className = 'auto-save-status';
            updateProgress();
        } else {
            throw new Error(result.error);
        }
    } catch (error) {
        console.error('Erreur de sauvegarde:', error);
        statusEl.textContent = '❌ Erreur de sauvegarde';
        statusEl.className = 'auto-save-status';
        statusEl.style.color = '#dc3545';
    }
    
    isSaving = false;
}

function autoSave() {
    // Vérifier si des champs sont remplis
    const form = document.getElementById('formulaire');
    const inputs = form.querySelectorAll('input, textarea, select');
    let hasData = false;
    inputs.forEach(input => {
        if (input.value && input.type !== 'hidden' && input.type !== 'radio' && input.type !== 'checkbox') {
            hasData = true;
        }
    });
    
    if (hasData) {
        saveForm();
    }
}

async function submitForm() {
    // Validation basique
    const required = ['company_name', 'responsible_name', 'phone'];
    let valid = true;
    
    required.forEach(id => {
        const el = document.getElementById(id);
        if (!el.value.trim()) {
            el.style.borderColor = '#dc3545';
            valid = false;
        } else {
            el.style.borderColor = '#4CAF50';
        }
    });
    
    if (!valid) {
        alert('Veuillez remplir les champs obligatoires (marqués *)');
        return;
    }
    
    if (!confirm('Soumettre le formulaire ? Vous ne pourrez plus modifier les données.')) {
        return;
    }
    
    try {
        const data = collectFormData();
        data.status = 'completed';
        
        const response = await fetch(`${API_URL}/responses`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        if (result.success) {
            alert('✅ Formulaire soumis avec succès ! Merci.');
            window.location.href = 'confirmation.html';
        } else {
            throw new Error(result.error);
        }
    } catch (error) {
        console.error('Erreur:', error);
        alert('❌ Erreur lors de la soumission. Veuillez réessayer.');
    }
}

// ============ CHARGER UNE RÉPONSE EXISTANTE ============
async function loadResponse(id) {
    try {
        const response = await fetch(`${API_URL}/responses/${id}`);
        const result = await response.json();
        
        if (result.success) {
            const data = result.data;
            currentId = data.id;
            
            // Remplir les champs
            document.getElementById('responseId').value = data.id;
            document.getElementById('company_name').value = data.company_name || '';
            document.getElementById('responsible_name').value = data.responsible_name || '';
            document.getElementById('address').value = data.address || '';
            document.getElementById('phone').value = data.phone || '';
            document.getElementById('email').value = data.email || '';
            document.getElementById('creation_date').value = data.creation_date || '';
            document.getElementById('employee_roles').value = data.employee_roles || '';
            
            // Employee count
            if (data.employee_count) {
                document.querySelector(`input[name="employee_count"][value="${data.employee_count}"]`).checked = true;
            }
            
            // Product types
            if (data.product_types) {
                data.product_types.forEach(val => {
                    const checkbox = document.querySelector(`#product_types input[value="${val}"]`);
                    if (checkbox) checkbox.checked = true;
                });
            }
            
            // Categories
            if (data.categories) {
                const container = document.getElementById('categories_container');
                container.innerHTML = '';
                data.categories.forEach((cat, i) => {
                    const div = document.createElement('div');
                    div.className = 'dynamic-input';
                    div.innerHTML = `<input type="text" class="category-input" value="${cat}" placeholder="Catégorie ${i+1}">`;
                    container.appendChild(div);
                });
            }
            
            // Products
            if (data.products) {
                const container = document.getElementById('products_container');
                container.innerHTML = '';
                Object.keys(data.products).forEach(cat => {
                    const div = document.createElement('div');
                    div.className = 'product-category-group';
                    div.innerHTML = `
                        <input type="text" class="product-category" value="${cat}" placeholder="Catégorie">
                        <textarea class="product-list" rows="3" placeholder="Listez les produits (un par ligne)">${data.products[cat].join('\n')}</textarea>
                    `;
                    container.appendChild(div);
                });
            }
            
            // Product info
            if (data.product_info) {
                data.product_info.forEach(val => {
                    const checkbox = document.querySelector(`#product_info input[value="${val}"]`);
                    if (checkbox) checkbox.checked = true;
                });
            }
            
            // Sale units
            if (data.sale_units) {
                data.sale_units.forEach(val => {
                    const checkbox = document.querySelector(`#sale_units input[value="${val}"]`);
                    if (checkbox) checkbox.checked = true;
                });
            }
            
            // Text fields
            document.getElementById('stock_management').value = data.stock_management || '';
            document.getElementById('purchase_process').value = data.purchase_process || '';
            document.getElementById('sales_process').value = data.sales_process || '';
            document.getElementById('stock_update').value = data.stock_update || '';
            document.getElementById('suppliers_info').value = data.suppliers_info || '';
            document.getElementById('employees_info').value = data.employees_info || '';
            document.getElementById('difficulties').value = data.difficulties || '';
            document.getElementById('daily_operations').value = data.daily_operations || '';
            
            // Special cases
            if (data.special_cases) {
                document.getElementById('credit_sales').value = data.special_cases.credit ? 'true' : 'false';
                document.getElementById('variable_pricing').value = data.special_cases.variable_pricing ? 'true' : 'false';
                document.getElementById('wholesale_retail').value = data.special_cases.wholesale_retail ? 'true' : 'false';
                document.getElementById('returns').value = data.special_cases.returns ? 'true' : 'false';
            }
            
            // Open questions
            if (data.open_questions) {
                document.getElementById('oq1').value = data.open_questions.q1 || '';
                document.getElementById('oq2').value = data.open_questions.q2 || '';
                document.getElementById('oq3').value = data.open_questions.q3 || '';
                document.getElementById('oq4').value = data.open_questions.q4 || '';
                document.getElementById('oq5').value = data.open_questions.q5 || '';
                document.getElementById('oq6').value = data.open_questions.q6 || '';
                document.getElementById('oq7').value = data.open_questions.q7 || '';
                document.getElementById('oq8').value = data.open_questions.q8 || '';
                document.getElementById('oq9').value = data.open_questions.q9 || '';
            }
            
            updateProgress();
        }
    } catch (error) {
        console.error('Erreur de chargement:', error);
    }
}

// ============ PROGRESS BAR ============
function updateProgress() {
    const form = document.getElementById('formulaire');
    const inputs = form.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"], textarea, select');
    let filled = 0;
    let total = 0;
    
    inputs.forEach(input => {
        if (input.id && input.id !== 'responseId') {
            total++;
            if (input.value && input.value.trim()) {
                filled++;
            }
        }
    });
    
    // Checkboxes et radios
    const checkboxes = form.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(cb => {
        total++;
        if (cb.checked) filled++;
    });
    
    const radios = form.querySelectorAll('input[type="radio"]');
    const radioGroups = {};
    radios.forEach(r => {
        const name = r.name;
        if (name) {
            if (!radioGroups[name]) radioGroups[name] = { total: 0, checked: 0 };
            radioGroups[name].total++;
            if (r.checked) radioGroups[name].checked++;
        }
    });
    Object.keys(radioGroups).forEach(name => {
        total += radioGroups[name].total;
        if (radioGroups[name].checked > 0) filled += radioGroups[name].total;
    });
    
    const percent = Math.min(100, Math.round((filled / total) * 100));
    document.getElementById('progress').style.width = percent + '%';
}