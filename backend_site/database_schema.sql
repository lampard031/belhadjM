-- Script SQL pour créer la table des gagnants
-- À exécuter dans phpMyAdmin sur Hostinger

-- Table: winners (gagnants)
CREATE TABLE IF NOT EXISTS winners (
    id VARCHAR(36) PRIMARY KEY,
    amount DECIMAL(10, 2) NOT NULL COMMENT 'Montant gagné en dollars',
    game VARCHAR(255) NOT NULL COMMENT 'Nom du jeu',
    date DATE NOT NULL COMMENT 'Date du gain',
    photo TEXT NOT NULL COMMENT 'URL de la photo du gagnant',
    isActive BOOLEAN DEFAULT TRUE COMMENT 'Gagnant actif ou non',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Date de création'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Index pour améliorer les performances
CREATE INDEX idx_date ON winners(date DESC);
CREATE INDEX idx_active ON winners(isActive);

-- Exemple d'insertion (optionnel - pour tester)
-- INSERT INTO winners (id, amount, game, date, photo, isActive) 
-- VALUES (
--     UUID(),
--     1500.00,
--     'Lightning Link',
--     '2025-01-14',
--     'https://votre-domaine.com/uploads/exemple.jpg',
--     TRUE
-- );
