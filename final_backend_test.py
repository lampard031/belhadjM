#!/usr/bin/env python3
"""
Final Comprehensive PHP Backend Test for FTC Automóveis
Simplified but thorough testing approach
"""

import requests
import json
import subprocess
import os
import time
import sqlite3

def setup_test_environment():
    """Setup test environment"""
    print("🔧 Setting up test environment...")
    
    # Create SQLite database
    db_path = '/app/test_ftc.db'
    if os.path.exists(db_path):
        os.remove(db_path)
        
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Create tables and insert data
    cursor.execute('''
        CREATE TABLE cars (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            brand TEXT, year INTEGER, model TEXT, mileage INTEGER,
            price REAL, images TEXT, fuel TEXT, transmission TEXT,
            color TEXT, description TEXT, featured INTEGER DEFAULT 0,
            type TEXT DEFAULT 'car', created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE jetskis (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            brand TEXT, year INTEGER, model TEXT, hours INTEGER,
            price REAL, images TEXT, engine TEXT, passengers INTEGER,
            fuel TEXT, color TEXT, description TEXT, featured INTEGER DEFAULT 0,
            type TEXT DEFAULT 'jetski', created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Insert test data
    cursor.execute('''
        INSERT INTO cars (brand, year, model, mileage, price, images, fuel, transmission, color, description, featured)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', ('BMW', 2020, '320i', 45000, 28500.00, '["test.jpg"]', 'Gasolina', 'Automática', 'Preto', 'BMW 320i', 1))
    
    cursor.execute('''
        INSERT INTO cars (brand, year, model, mileage, price, images, fuel, transmission, color, description, featured)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', ('Mercedes', 2019, 'C200', 52000, 32000.00, '["test.jpg"]', 'Gasolina', 'Automática', 'Prata', 'Mercedes C200', 1))
    
    cursor.execute('''
        INSERT INTO jetskis (brand, year, model, hours, price, images, engine, passengers, fuel, color, description, featured)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', ('Yamaha', 2023, 'VX Cruiser', 45, 18500.00, '["test.jpg"]', '1812cc', 3, 'Gasolina', 'Azul', 'Yamaha VX', 1))
    
    conn.commit()
    conn.close()
    
    # Create test config
    config_content = '''<?php
$host = 'localhost';
$dbname = '/app/test_ftc.db';

try {
    $pdo = new PDO("sqlite:$dbname");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    die("Database error: " . $e->getMessage());
}

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=utf-8');

if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}
?>'''
    
    with open('/app/hostinger-deploy/api/test_config.php', 'w') as f:
        f.write(config_content)
    
    print("✅ Test environment setup complete")

def modify_php_files():
    """Modify PHP files to use test config"""
    files = [
        '/app/hostinger-deploy/api/admin.php',
        '/app/hostinger-deploy/api/cars.php',
        '/app/hostinger-deploy/api/jetskis.php'
    ]
    
    for file_path in files:
        with open(file_path, 'r') as f:
            content = f.read()
        
        # Backup
        with open(f"{file_path}.backup", 'w') as f:
            f.write(content)
        
        # Modify
        content = content.replace("require_once 'config.php';", "require_once 'test_config.php';")
        
        with open(file_path, 'w') as f:
            f.write(content)
    
    print("✅ PHP files modified")

def restore_php_files():
    """Restore PHP files"""
    files = [
        '/app/hostinger-deploy/api/admin.php',
        '/app/hostinger-deploy/api/cars.php',
        '/app/hostinger-deploy/api/jetskis.php'
    ]
    
    for file_path in files:
        backup_path = f"{file_path}.backup"
        if os.path.exists(backup_path):
            with open(backup_path, 'r') as f:
                content = f.read()
            
            with open(file_path, 'w') as f:
                f.write(content)
            
            os.remove(backup_path)
    
    print("✅ PHP files restored")

def start_php_server():
    """Start PHP server"""
    print("🚀 Starting PHP server...")
    
    # Kill existing servers
    subprocess.run(['pkill', '-f', 'php.*8083'], capture_output=True)
    time.sleep(1)
    
    # Change to directory
    os.chdir('/app/hostinger-deploy')
    
    # Start server in background
    process = subprocess.Popen([
        'php', '-S', 'localhost:8083', 'index.php'
    ], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    
    time.sleep(3)
    
    # Test connection
    try:
        response = requests.get("http://localhost:8083/", timeout=5)
        if response.status_code == 200:
            print("✅ PHP server started successfully")
            return process
        else:
            print(f"⚠️ Server responded with {response.status_code}")
            return process
    except Exception as e:
        print(f"❌ Server connection failed: {e}")
        return process

def run_tests():
    """Run all tests"""
    base_url = "http://localhost:8083"
    session = requests.Session()
    results = []
    
    def log_test(name, success, details=""):
        status = "✅ PASS" if success else "❌ FAIL"
        results.append({'name': name, 'success': success, 'details': details})
        print(f"{status} {name}: {details}")
    
    print("\n🧪 Running PHP Backend Tests...")
    print("=" * 50)
    
    # Test 1: Main entry point
    try:
        response = requests.get(f"{base_url}/")
        if response.status_code == 200:
            data = response.json()
            if 'status' in data and 'endpoints' in data:
                log_test("Main Entry Point", True, "API status endpoint working")
            else:
                log_test("Main Entry Point", False, "Invalid response format")
        else:
            log_test("Main Entry Point", False, f"HTTP {response.status_code}")
    except Exception as e:
        log_test("Main Entry Point", False, f"Exception: {str(e)}")
    
    # Test 2: Admin login
    print("\n🔐 Testing Admin Authentication...")
    login_data = {"username": "admin", "password": "admin123"}
    
    try:
        response = session.post(f"{base_url}/api/admin/login", 
                              json=login_data,
                              headers={'Content-Type': 'application/json'})
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                log_test("Admin Login", True, "Login successful")
            else:
                log_test("Admin Login", False, f"Login failed: {data.get('message', 'Unknown error')}")
        else:
            log_test("Admin Login", False, f"HTTP {response.status_code}: {response.text}")
    except Exception as e:
        log_test("Admin Login", False, f"Exception: {str(e)}")
    
    # Test 3: Invalid login
    try:
        response = requests.post(f"{base_url}/api/admin/login", 
                               json={"username": "admin", "password": "wrong"},
                               headers={'Content-Type': 'application/json'})
        
        if response.status_code == 401:
            log_test("Invalid Login Rejection", True, "Correctly rejected invalid credentials")
        else:
            log_test("Invalid Login Rejection", False, f"Expected 401, got {response.status_code}")
    except Exception as e:
        log_test("Invalid Login Rejection", False, f"Exception: {str(e)}")
    
    # Test 4: Admin status
    try:
        response = session.get(f"{base_url}/api/admin/status")
        
        if response.status_code == 200:
            data = response.json()
            if data.get('logged_in'):
                log_test("Admin Status Check", True, "Admin logged in status confirmed")
            else:
                log_test("Admin Status Check", False, "Admin not logged in after successful login")
        else:
            log_test("Admin Status Check", False, f"HTTP {response.status_code}")
    except Exception as e:
        log_test("Admin Status Check", False, f"Exception: {str(e)}")
    
    # Test 5: Admin stats
    try:
        response = session.get(f"{base_url}/api/admin/stats")
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success') and 'stats' in data:
                stats = data['stats']
                log_test("Admin Stats", True, 
                        f"Cars: {stats.get('cars_count')}, Jetskis: {stats.get('jetskis_count')}")
            else:
                log_test("Admin Stats", False, "Invalid stats response format")
        else:
            log_test("Admin Stats", False, f"HTTP {response.status_code}: {response.text}")
    except Exception as e:
        log_test("Admin Stats", False, f"Exception: {str(e)}")
    
    # Test 6: Cars API
    print("\n🚗 Testing Cars API...")
    
    try:
        response = requests.get(f"{base_url}/api/cars")
        
        if response.status_code == 200:
            data = response.json()
            if isinstance(data, list) and len(data) > 0:
                log_test("GET All Cars", True, f"Retrieved {len(data)} cars")
            else:
                log_test("GET All Cars", False, "No cars returned or invalid format")
        else:
            log_test("GET All Cars", False, f"HTTP {response.status_code}: {response.text}")
    except Exception as e:
        log_test("GET All Cars", False, f"Exception: {str(e)}")
    
    # Test 7: Featured cars
    try:
        response = requests.get(f"{base_url}/api/cars/featured")
        
        if response.status_code == 200:
            data = response.json()
            if isinstance(data, list):
                log_test("GET Featured Cars", True, f"Retrieved {len(data)} featured cars")
            else:
                log_test("GET Featured Cars", False, "Invalid response format")
        else:
            log_test("GET Featured Cars", False, f"HTTP {response.status_code}")
    except Exception as e:
        log_test("GET Featured Cars", False, f"Exception: {str(e)}")
    
    # Test 8: Specific car by ID
    try:
        response = requests.get(f"{base_url}/api/cars/1")
        
        if response.status_code == 200:
            data = response.json()
            if 'id' in data and 'brand' in data:
                log_test("GET Car by ID", True, f"Retrieved: {data.get('brand')} {data.get('model')}")
            else:
                log_test("GET Car by ID", False, "Invalid car data format")
        else:
            log_test("GET Car by ID", False, f"HTTP {response.status_code}")
    except Exception as e:
        log_test("GET Car by ID", False, f"Exception: {str(e)}")
    
    # Test 9: Add new car (authenticated)
    new_car = {
        "brand": "Audi", "year": 2021, "model": "A4", "mileage": 25000,
        "price": 35000.00, "images": ["test.jpg"], "fuel": "Diesel",
        "transmission": "Automática", "color": "Branco", 
        "description": "Audi A4", "featured": True
    }
    
    try:
        response = session.post(f"{base_url}/api/cars", 
                              json=new_car,
                              headers={'Content-Type': 'application/json'})
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                log_test("POST New Car (Auth)", True, f"Car added with ID: {data.get('id')}")
            else:
                log_test("POST New Car (Auth)", False, "Failed to add car")
        else:
            log_test("POST New Car (Auth)", False, f"HTTP {response.status_code}: {response.text}")
    except Exception as e:
        log_test("POST New Car (Auth)", False, f"Exception: {str(e)}")
    
    # Test 10: Add car without auth
    try:
        response = requests.post(f"{base_url}/api/cars", 
                               json=new_car,
                               headers={'Content-Type': 'application/json'})
        
        if response.status_code == 401:
            log_test("POST Car (No Auth)", True, "Correctly rejected unauthenticated request")
        else:
            log_test("POST Car (No Auth)", False, f"Expected 401, got {response.status_code}")
    except Exception as e:
        log_test("POST Car (No Auth)", False, f"Exception: {str(e)}")
    
    # Test 11: Jetskis API
    print("\n🏄 Testing Jetskis API...")
    
    try:
        response = requests.get(f"{base_url}/api/jetskis")
        
        if response.status_code == 200:
            data = response.json()
            if isinstance(data, list) and len(data) > 0:
                log_test("GET All Jetskis", True, f"Retrieved {len(data)} jetskis")
            else:
                log_test("GET All Jetskis", False, "No jetskis returned or invalid format")
        else:
            log_test("GET All Jetskis", False, f"HTTP {response.status_code}")
    except Exception as e:
        log_test("GET All Jetskis", False, f"Exception: {str(e)}")
    
    # Test 12: Add new jetski (authenticated)
    new_jetski = {
        "brand": "Sea-Doo", "year": 2022, "model": "GTX 230", "hours": 78,
        "price": 22000.00, "images": ["test.jpg"], "engine": "1630cc Rotax",
        "passengers": 3, "fuel": "Gasolina", "color": "Preto/Amarelo",
        "description": "Sea-Doo GTX 230", "featured": True
    }
    
    try:
        response = session.post(f"{base_url}/api/jetskis", 
                              json=new_jetski,
                              headers={'Content-Type': 'application/json'})
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                log_test("POST New Jetski (Auth)", True, f"Jetski added with ID: {data.get('id')}")
            else:
                log_test("POST New Jetski (Auth)", False, "Failed to add jetski")
        else:
            log_test("POST New Jetski (Auth)", False, f"HTTP {response.status_code}: {response.text}")
    except Exception as e:
        log_test("POST New Jetski (Auth)", False, f"Exception: {str(e)}")
    
    # Test 13: Logout
    print("\n🚪 Testing Logout...")
    
    try:
        response = session.post(f"{base_url}/api/admin/logout")
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                log_test("Admin Logout", True, "Logout successful")
                
                # Verify logout
                status_response = session.get(f"{base_url}/api/admin/status")
                if status_response.status_code == 200:
                    status_data = status_response.json()
                    if not status_data.get('logged_in'):
                        log_test("Logout Verification", True, "Session properly cleared")
                    else:
                        log_test("Logout Verification", False, "Session not cleared")
                else:
                    log_test("Logout Verification", False, "Could not verify logout")
            else:
                log_test("Admin Logout", False, "Logout failed")
        else:
            log_test("Admin Logout", False, f"HTTP {response.status_code}")
    except Exception as e:
        log_test("Admin Logout", False, f"Exception: {str(e)}")
    
    # Print summary
    print("\n" + "=" * 50)
    print("📋 TEST SUMMARY")
    print("=" * 50)
    
    total = len(results)
    passed = sum(1 for r in results if r['success'])
    failed = total - passed
    
    print(f"Total Tests: {total}")
    print(f"✅ Passed: {passed}")
    print(f"❌ Failed: {failed}")
    print(f"Success Rate: {(passed/total*100):.1f}%")
    
    if failed > 0:
        print(f"\n❌ FAILED TESTS:")
        for result in results:
            if not result['success']:
                print(f"  • {result['name']}: {result['details']}")
    
    print("\n" + "=" * 50)
    
    return results

def main():
    """Main test function"""
    php_process = None
    
    try:
        # Setup
        setup_test_environment()
        modify_php_files()
        php_process = start_php_server()
        
        # Run tests
        results = run_tests()
        
        # Test original config issue
        print("\n🔍 Testing Original Configuration...")
        restore_php_files()
        
        try:
            response = requests.get("http://localhost:8083/api/cars", timeout=5)
            if "Erreur de connexion" in response.text or "Database connection error" in response.text:
                print("✅ Original MySQL config correctly fails (expected behavior)")
            else:
                print("⚠️ Original config unexpectedly succeeded")
        except Exception as e:
            print(f"✅ Original config fails as expected: {str(e)}")
        
    except Exception as e:
        print(f"❌ Test execution error: {str(e)}")
        
    finally:
        # Cleanup
        print("\n🧹 Cleaning up...")
        
        if php_process:
            php_process.terminate()
            php_process.wait()
        
        # Remove test files
        cleanup_files = [
            '/app/test_ftc.db',
            '/app/hostinger-deploy/api/test_config.php'
        ]
        
        for file in cleanup_files:
            if os.path.exists(file):
                os.remove(file)
        
        # Ensure PHP files are restored
        restore_php_files()
        
        print("✅ Cleanup completed")

if __name__ == "__main__":
    main()