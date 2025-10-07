#!/usr/bin/env python3
"""
Debug PHP Backend Issues
"""

import requests
import json
import subprocess
import os
import time
import sqlite3

def create_test_database():
    """Create SQLite database with test data"""
    db_path = '/app/test_ftc.db'
    
    # Remove existing database
    if os.path.exists(db_path):
        os.remove(db_path)
        
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Create cars table
    cursor.execute('''
        CREATE TABLE cars (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            brand TEXT NOT NULL,
            year INTEGER NOT NULL,
            model TEXT NOT NULL,
            mileage INTEGER NOT NULL,
            price REAL NOT NULL,
            images TEXT,
            fuel TEXT NOT NULL,
            transmission TEXT NOT NULL,
            color TEXT NOT NULL,
            description TEXT,
            featured INTEGER DEFAULT 0,
            type TEXT DEFAULT 'car',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Create jetskis table
    cursor.execute('''
        CREATE TABLE jetskis (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            brand TEXT NOT NULL,
            year INTEGER NOT NULL,
            model TEXT NOT NULL,
            hours INTEGER NOT NULL,
            price REAL NOT NULL,
            images TEXT,
            engine TEXT NOT NULL,
            passengers INTEGER NOT NULL,
            fuel TEXT NOT NULL,
            color TEXT NOT NULL,
            description TEXT,
            featured INTEGER DEFAULT 0,
            type TEXT DEFAULT 'jetski',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Insert test data
    cursor.execute('''
        INSERT INTO cars (brand, year, model, mileage, price, images, fuel, transmission, color, description, featured)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', ('BMW', 2020, '320i', 45000, 28500.00, '["test.jpg"]', 'Gasolina', 'Automática', 'Preto', 'BMW 320i', 1))
    
    cursor.execute('''
        INSERT INTO jetskis (brand, year, model, hours, price, images, engine, passengers, fuel, color, description, featured)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', ('Yamaha', 2023, 'VX Cruiser HO', 45, 18500.00, '["test.jpg"]', '1812cc', 3, 'Gasolina', 'Azul', 'Yamaha VX', 1))
    
    conn.commit()
    conn.close()
    print("✅ Test database created")

def create_test_config():
    """Create test config that works"""
    config_content = '''<?php
// Test configuration using SQLite
$host = 'localhost';
$dbname = '/app/test_ftc.db';

try {
    $pdo = new PDO("sqlite:$dbname");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    die("Database connection error: " . $e->getMessage());
}

// CORS headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}
?>'''
    
    with open('/app/hostinger-deploy/api/test_config.php', 'w') as f:
        f.write(config_content)
    print("✅ Test config created")

def test_database_connection():
    """Test database connection directly"""
    print("\n🔍 Testing database connection...")
    
    # Test with PHP script
    test_script = '''<?php
require_once 'test_config.php';

try {
    $result = $pdo->query("SELECT COUNT(*) as count FROM cars");
    $count = $result->fetch(PDO::FETCH_ASSOC)['count'];
    echo "Cars count: " . $count . "\n";
    
    $result = $pdo->query("SELECT COUNT(*) as count FROM jetskis");
    $count = $result->fetch(PDO::FETCH_ASSOC)['count'];
    echo "Jetskis count: " . $count . "\n";
    
    echo "Database connection successful!\n";
} catch (Exception $e) {
    echo "Database error: " . $e->getMessage() . "\n";
}
?>'''
    
    with open('/app/hostinger-deploy/api/test_db.php', 'w') as f:
        f.write(test_script)
    
    # Run the test
    os.chdir('/app/hostinger-deploy/api')
    result = subprocess.run(['php', 'test_db.php'], capture_output=True, text=True)
    print("Database test output:", result.stdout)
    if result.stderr:
        print("Database test errors:", result.stderr)

def test_admin_stats_directly():
    """Test admin stats endpoint directly"""
    print("\n📊 Testing admin stats directly...")
    
    # Create a simple test script for admin stats
    test_script = '''<?php
session_start();
$_SESSION['admin_logged'] = true;
$_SESSION['admin_username'] = 'admin';

require_once 'test_config.php';

try {
    $cars_count = $pdo->query("SELECT COUNT(*) as count FROM cars")->fetch(PDO::FETCH_ASSOC)['count'];
    $jetskis_count = $pdo->query("SELECT COUNT(*) as count FROM jetskis")->fetch(PDO::FETCH_ASSOC)['count'];
    $avg_car_price = $pdo->query("SELECT AVG(price) as avg_price FROM cars")->fetch(PDO::FETCH_ASSOC)['avg_price'];
    $avg_jetski_price = $pdo->query("SELECT AVG(price) as avg_price FROM jetskis")->fetch(PDO::FETCH_ASSOC)['avg_price'];
    
    $stats = [
        'success' => true,
        'stats' => [
            'cars_count' => intval($cars_count),
            'jetskis_count' => intval($jetskis_count),
            'total_vehicles' => intval($cars_count) + intval($jetskis_count),
            'avg_car_price' => floatval($avg_car_price ?? 0),
            'avg_jetski_price' => floatval($avg_jetski_price ?? 0)
        ]
    ];
    
    echo json_encode($stats, JSON_PRETTY_PRINT);
} catch (Exception $e) {
    echo json_encode(['error' => 'Stats error: ' . $e->getMessage()]);
}
?>'''
    
    with open('/app/hostinger-deploy/api/test_stats.php', 'w') as f:
        f.write(test_script)
    
    # Run the test
    result = subprocess.run(['php', 'test_stats.php'], capture_output=True, text=True)
    print("Stats test output:", result.stdout)
    if result.stderr:
        print("Stats test errors:", result.stderr)

def main():
    print("🔍 Debugging PHP Backend Issues")
    print("=" * 50)
    
    # Setup
    create_test_database()
    create_test_config()
    
    # Run tests
    test_database_connection()
    test_admin_stats_directly()
    
    # Cleanup
    cleanup_files = [
        '/app/hostinger-deploy/api/test_config.php',
        '/app/hostinger-deploy/api/test_db.php', 
        '/app/hostinger-deploy/api/test_stats.php',
        '/app/test_ftc.db'
    ]
    
    for file in cleanup_files:
        if os.path.exists(file):
            os.remove(file)
    
    print("\n🧹 Cleanup completed")

if __name__ == "__main__":
    main()