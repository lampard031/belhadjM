-- Mise à jour Base de Données FTC Automóveis avec gestion des statuts

-- Ajouter colonne status aux tables existantes
ALTER TABLE cars ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'available';
ALTER TABLE jetskis ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'available';

-- Ajouter colonne source pour traçabilité
ALTER TABLE cars ADD COLUMN IF NOT EXISTS source VARCHAR(50) DEFAULT 'manual';
ALTER TABLE jetskis ADD COLUMN IF NOT EXISTS source VARCHAR(50) DEFAULT 'manual';

-- Ajouter index sur status pour performance
CREATE INDEX IF NOT EXISTS idx_cars_status ON cars(status);
CREATE INDEX IF NOT EXISTS idx_jetskis_status ON jetskis(status);

-- Mettre à jour les enregistrements existants
UPDATE cars SET status = 'available' WHERE status IS NULL OR status = '';
UPDATE jetskis SET status = 'available' WHERE status IS NULL OR status = '';

-- Table pour configuration Google Sheets (optionnelle)
CREATE TABLE IF NOT EXISTS google_sheets_config (
    id INT PRIMARY KEY AUTO_INCREMENT,
    sheet_id VARCHAR(255) NOT NULL,
    api_key_encrypted TEXT,
    sheet_range VARCHAR(50) DEFAULT 'Sheet1!A:Z',
    last_sync TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table pour logs de synchronisation
CREATE TABLE IF NOT EXISTS sync_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    sync_type VARCHAR(50) NOT NULL, -- 'google_sheets', 'manual', etc.
    status VARCHAR(20) NOT NULL,    -- 'success', 'error', 'partial'
    vehicles_processed INT DEFAULT 0,
    vehicles_added INT DEFAULT 0,
    error_message TEXT,
    sync_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table pour véhicules en attente (pending)
CREATE TABLE IF NOT EXISTS pending_vehicles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    temp_id VARCHAR(100) UNIQUE,    -- ID temporaire pour frontend
    vehicle_type ENUM('car', 'jetski') NOT NULL,
    brand VARCHAR(100) NOT NULL,
    year INT NOT NULL,
    model VARCHAR(100) NOT NULL,
    mileage INT,                    -- Pour cars
    hours INT,                      -- Pour jetskis
    price DECIMAL(10,2) NOT NULL,
    fuel VARCHAR(50),
    transmission VARCHAR(50),       -- Pour cars
    engine VARCHAR(100),           -- Pour jetskis
    passengers INT,                -- Pour jetskis
    color VARCHAR(50),
    description TEXT,
    source VARCHAR(50) DEFAULT 'google_sheets',
    has_images BOOLEAN DEFAULT FALSE,
    image_count INT DEFAULT 0,
    pending_since TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_by VARCHAR(100),     -- Admin qui a traité
    processed_at TIMESTAMP NULL
);

-- Exemples de données avec différents statuts
INSERT INTO cars (brand, year, model, mileage, price, images, fuel, transmission, color, description, featured, status, source) VALUES
('BMW', 2020, '320i', 45000, 28500.00, '[\"https://images.unsplash.com/photo-1555215695-3004980ad54e?w=500&h=300&fit=crop\"]', 'Gasolina', 'Automática', 'Preto', 'BMW 320i em excelente estado.', TRUE, 'available', 'manual'),
('Mercedes-Benz', 2019, 'C200', 52000, 32000.00, '[\"https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=500&h=300&fit=crop\"]', 'Gasolina', 'Automática', 'Prata', 'Mercedes-Benz C200 com GPS.', TRUE, 'reserved', 'manual'),
('Audi', 2021, 'A4', 25000, 35000.00, '[\"https://images.unsplash.com/photo-1614200187524-dc4b892acf16?w=500&h=300&fit=crop\"]', 'Diesel', 'Automática', 'Branco', 'Audi A4 quase novo.', TRUE, 'available', 'manual'),
('Volkswagen', 2018, 'Golf', 65000, 18500.00, '[\"https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=500&h=300&fit=crop\"]', 'Gasolina', 'Manual', 'Azul', 'Volkswagen Golf em bom estado.', FALSE, 'sold', 'manual');

INSERT INTO jetskis (brand, year, model, hours, price, images, engine, passengers, fuel, color, description, featured, status, source) VALUES
('Yamaha', 2023, 'VX Cruiser HO', 45, 18500.00, '[\"https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=500&h=300&fit=crop\"]', '1812cc', 3, 'Gasolina', 'Azul/Branco', 'Yamaha VX Cruiser HO.', TRUE, 'available', 'manual'),
('Sea-Doo', 2022, 'GTX 230', 78, 22000.00, '[\"https://images.unsplash.com/photo-1607473129281-bc8e9a88540e?w=500&h=300&fit=crop\"]', '1630cc Rotax', 3, 'Gasolina', 'Preto/Amarelo', 'Sea-Doo GTX 230 com GPS.', TRUE, 'reserved', 'manual');

-- Exemples de véhicules en attente
INSERT INTO pending_vehicles (temp_id, vehicle_type, brand, year, model, mileage, price, fuel, transmission, color, description, source) VALUES
('sheet_pending_1', 'car', 'Toyota', 2020, 'Corolla', 35000, 22000.00, 'Híbrido', 'Automática', 'Branco', 'Toyota Corolla Híbrido económico.', 'google_sheets'),
('sheet_pending_2', 'car', 'Ford', 2021, 'Focus', 28000, 19500.00, 'Gasolina', 'Manual', 'Cinzento', 'Ford Focus desportivo.', 'google_sheets');

INSERT INTO pending_vehicles (temp_id, vehicle_type, brand, year, model, hours, price, engine, passengers, fuel, color, description, source) VALUES
('sheet_pending_3', 'jetski', 'Kawasaki', 2023, 'Ultra 310X', 25, 24000.00, '1498cc', 3, 'Gasolina', 'Verde/Preto', 'Kawasaki Ultra 310X potente.', 'google_sheets');

-- Vues utiles pour l'admin
CREATE OR REPLACE VIEW admin_dashboard_stats AS
SELECT 
    (SELECT COUNT(*) FROM cars WHERE status = 'available') as cars_available,
    (SELECT COUNT(*) FROM cars WHERE status = 'sold') as cars_sold,
    (SELECT COUNT(*) FROM cars WHERE status = 'reserved') as cars_reserved,
    (SELECT COUNT(*) FROM jetskis WHERE status = 'available') as jetskis_available,
    (SELECT COUNT(*) FROM jetskis WHERE status = 'sold') as jetskis_sold,
    (SELECT COUNT(*) FROM jetskis WHERE status = 'reserved') as jetskis_reserved,
    (SELECT COUNT(*) FROM pending_vehicles) as vehicles_pending,
    (SELECT AVG(price) FROM cars WHERE status = 'available') as avg_car_price,
    (SELECT AVG(price) FROM jetskis WHERE status = 'available') as avg_jetski_price;

-- Procédure pour nettoyer les véhicules en attente anciens (optionnel)
DELIMITER ;;
CREATE PROCEDURE IF NOT EXISTS CleanOldPendingVehicles()
BEGIN
    DELETE FROM pending_vehicles 
    WHERE pending_since < DATE_SUB(NOW(), INTERVAL 30 DAY) 
    AND processed_at IS NULL;
END;;
DELIMITER ;

-- Triggers pour logs automatiques
DELIMITER ;;
CREATE TRIGGER IF NOT EXISTS cars_status_update_log
AFTER UPDATE ON cars
FOR EACH ROW
BEGIN
    IF OLD.status != NEW.status THEN
        INSERT INTO sync_logs (sync_type, status, vehicles_processed, vehicles_added, error_message)
        VALUES ('status_change', 'success', 1, 0, 
                CONCAT('Car ', NEW.id, ' status changed from ', OLD.status, ' to ', NEW.status));
    END IF;
END;;

CREATE TRIGGER IF NOT EXISTS jetskis_status_update_log
AFTER UPDATE ON jetskis
FOR EACH ROW
BEGIN
    IF OLD.status != NEW.status THEN
        INSERT INTO sync_logs (sync_type, status, vehicles_processed, vehicles_added, error_message)
        VALUES ('status_change', 'success', 1, 0, 
                CONCAT('Jetski ', NEW.id, ' status changed from ', OLD.status, ' to ', NEW.status));
    END IF;
END;;
DELIMITER ;