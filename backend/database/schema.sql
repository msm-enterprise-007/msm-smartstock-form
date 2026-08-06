-- Créer la base de données
CREATE DATABASE IF NOT EXISTS msm_smartstock;
USE msm_smartstock;

-- Table unique pour toutes les réponses
CREATE TABLE IF NOT EXISTS responses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    
    -- Section 1: Informations générales
    company_name VARCHAR(255),
    responsible_name VARCHAR(255),
    address TEXT,
    phone VARCHAR(50),
    email VARCHAR(255),
    creation_date DATE,
    employee_count VARCHAR(20),
    employee_roles TEXT,
    
    -- Sections 2-6: Données structurées (stockées en JSON)
    product_types JSON,          -- ["Quincaillerie", "Plomberie"]
    categories JSON,              -- ["Vis", "Clous", "Serrures"]
    products JSON,                -- {"Ciment": ["CIMBENIN", "Dangote"]}
    product_info JSON,           -- ["Nom", "Marque", "Prix"]
    sale_units JSON,             -- ["Pièce", "Sac", "Carton"]
    
    -- Sections 7-16: Réponses textuelles
    stock_management TEXT,
    purchase_process TEXT,
    sales_process TEXT,
    stock_update TEXT,
    suppliers_info TEXT,
    employees_info TEXT,
    difficulties TEXT,
    special_cases JSON,          -- {"credit": true, "returns": false}
    daily_operations TEXT,
    open_questions JSON,         -- {"q1": "réponse", "q2": "réponse"}
    
    -- Métadonnées
    status ENUM('draft', 'completed') DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_status (status),
    INDEX idx_email (email)
);