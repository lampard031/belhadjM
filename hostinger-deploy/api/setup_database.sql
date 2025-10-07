-- Base de données pour FTC Automóveis
-- À exécuter dans phpMyAdmin Hostinger

-- Table des voitures
CREATE TABLE IF NOT EXISTS cars (
    id INT AUTO_INCREMENT PRIMARY KEY,
    brand VARCHAR(100) NOT NULL,
    year INT NOT NULL,
    model VARCHAR(100) NOT NULL,
    mileage INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    images JSON,
    fuel VARCHAR(50) NOT NULL,
    transmission VARCHAR(50) NOT NULL,
    color VARCHAR(50) NOT NULL,
    description TEXT,
    featured BOOLEAN DEFAULT FALSE,
    type VARCHAR(20) DEFAULT 'car',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table des jet-skis
CREATE TABLE IF NOT EXISTS jetskis (
    id INT AUTO_INCREMENT PRIMARY KEY,
    brand VARCHAR(100) NOT NULL,
    year INT NOT NULL,
    model VARCHAR(100) NOT NULL,
    hours INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    images JSON,
    engine VARCHAR(100) NOT NULL,
    passengers INT NOT NULL,
    fuel VARCHAR(50) NOT NULL,
    color VARCHAR(50) NOT NULL,
    description TEXT,
    featured BOOLEAN DEFAULT FALSE,
    type VARCHAR(20) DEFAULT 'jetski',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Données d'exemple pour les voitures
INSERT INTO cars (brand, year, model, mileage, price, images, fuel, transmission, color, description, featured) VALUES
('BMW', 2020, '320i', 45000, 28500.00, '["https://images.unsplash.com/photo-1555215695-3004980ad54e?w=500&h=300&fit=crop"]', 'Gasolina', 'Automática', 'Preto', 'BMW 320i em excelente estado, com todos os extras de série.', TRUE),
('Mercedes-Benz', 2019, 'C200', 52000, 32000.00, '["https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=500&h=300&fit=crop"]', 'Gasolina', 'Automática', 'Prata', 'Mercedes-Benz C200 com interior em pele e navegação GPS.', TRUE),
('Audi', 2021, 'A4', 25000, 35000.00, '["https://images.unsplash.com/photo-1614200187524-dc4b892acf16?w=500&h=300&fit=crop"]', 'Diesel', 'Automática', 'Branco', 'Audi A4 quase novo com garantia de fábrica ainda válida.', TRUE);

-- Données d'exemple pour les jet-skis
INSERT INTO jetskis (brand, year, model, hours, price, images, engine, passengers, fuel, color, description, featured) VALUES
('Yamaha', 2023, 'VX Cruiser HO', 45, 18500.00, '["https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=500&h=300&fit=crop"]', '1812cc', 3, 'Gasolina', 'Azul/Branco', 'Yamaha VX Cruiser HO em excelente estado, ideal para passeios familiares.', TRUE),
('Sea-Doo', 2022, 'GTX 230', 78, 22000.00, '["https://images.unsplash.com/photo-1607473129281-bc8e9a88540e?w=500&h=300&fit=crop"]', '1630cc Rotax', 3, 'Gasolina', 'Preto/Amarelo', 'Sea-Doo GTX 230 com sistema de som e GPS integrado.', TRUE);
