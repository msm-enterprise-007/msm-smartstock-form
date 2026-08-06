require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: ['http://localhost:3000', 'https://ton-frontend.vercel.app']
}));
app.use(express.json({ limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
});
app.use('/api/', limiter);

// Configuration MySQL
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// ============ API ENDPOINTS ============

// 1. Sauvegarder ou créer une réponse
app.post('/api/responses', async (req, res) => {
    try {
        const data = req.body;
        const connection = await pool.getConnection();

        // Si ID existe, on met à jour
        if (data.id) {
            const [result] = await connection.execute(
                `UPDATE responses SET
                    company_name = ?, responsible_name = ?, address = ?, 
                    phone = ?, email = ?, creation_date = ?, 
                    employee_count = ?, employee_roles = ?,
                    product_types = ?, categories = ?, products = ?,
                    product_info = ?, sale_units = ?,
                    stock_management = ?, purchase_process = ?,
                    sales_process = ?, stock_update = ?,
                    suppliers_info = ?, employees_info = ?,
                    difficulties = ?, special_cases = ?,
                    daily_operations = ?, open_questions = ?,
                    status = ?
                WHERE id = ?`,
                [
                    data.company_name, data.responsible_name, data.address,
                    data.phone, data.email, data.creation_date,
                    data.employee_count, data.employee_roles,
                    JSON.stringify(data.product_types || []),
                    JSON.stringify(data.categories || []),
                    JSON.stringify(data.products || {}),
                    JSON.stringify(data.product_info || []),
                    JSON.stringify(data.sale_units || []),
                    data.stock_management, data.purchase_process,
                    data.sales_process, data.stock_update,
                    data.suppliers_info, data.employees_info,
                    data.difficulties, JSON.stringify(data.special_cases || {}),
                    data.daily_operations, JSON.stringify(data.open_questions || {}),
                    data.status || 'draft',
                    data.id
                ]
            );
            connection.release();
            res.json({ success: true, id: data.id, message: 'Mise à jour réussie' });
        } else {
            // Création
            const [result] = await connection.execute(
                `INSERT INTO responses (
                    company_name, responsible_name, address, phone, email,
                    creation_date, employee_count, employee_roles,
                    product_types, categories, products, product_info,
                    sale_units, stock_management, purchase_process,
                    sales_process, stock_update, suppliers_info,
                    employees_info, difficulties, special_cases,
                    daily_operations, open_questions, status
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    data.company_name, data.responsible_name, data.address,
                    data.phone, data.email, data.creation_date,
                    data.employee_count, data.employee_roles,
                    JSON.stringify(data.product_types || []),
                    JSON.stringify(data.categories || []),
                    JSON.stringify(data.products || {}),
                    JSON.stringify(data.product_info || []),
                    JSON.stringify(data.sale_units || []),
                    data.stock_management, data.purchase_process,
                    data.sales_process, data.stock_update,
                    data.suppliers_info, data.employees_info,
                    data.difficulties, JSON.stringify(data.special_cases || {}),
                    data.daily_operations, JSON.stringify(data.open_questions || {}),
                    data.status || 'draft'
                ]
            );
            connection.release();
            res.json({ success: true, id: result.insertId, message: 'Création réussie' });
        }
    } catch (error) {
        console.error('Erreur:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// 2. Récupérer toutes les réponses (Admin)
app.get('/api/responses', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        const [rows] = await connection.execute(
            `SELECT id, company_name, responsible_name, email, 
                    status, created_at, updated_at 
             FROM responses ORDER BY created_at DESC`
        );
        connection.release();
        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// 3. Récupérer une réponse spécifique
app.get('/api/responses/:id', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        const [rows] = await connection.execute(
            'SELECT * FROM responses WHERE id = ?',
            [req.params.id]
        );
        connection.release();

        if (rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Réponse non trouvée' });
        }

        // Parse JSON fields
        const response = rows[0];
        response.product_types = JSON.parse(response.product_types || '[]');
        response.categories = JSON.parse(response.categories || '[]');
        response.products = JSON.parse(response.products || '{}');
        response.product_info = JSON.parse(response.product_info || '[]');
        response.sale_units = JSON.parse(response.sale_units || '[]');
        response.special_cases = JSON.parse(response.special_cases || '{}');
        response.open_questions = JSON.parse(response.open_questions || '{}');

        res.json({ success: true, data: response });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// 4. Supprimer une réponse (Admin)
app.delete('/api/responses/:id', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        await connection.execute('DELETE FROM responses WHERE id = ?', [req.params.id]);
        connection.release();
        res.json({ success: true, message: 'Supprimé avec succès' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Démarrer le serveur
app.listen(PORT, () => {
    console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
});