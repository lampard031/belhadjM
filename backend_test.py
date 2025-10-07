#!/usr/bin/env python3
"""
Comprehensive Backend Testing Script for FTC Automóveis PHP API
Tests all PHP backend endpoints with proper authentication and CRUD operations
"""

import requests
import json
import subprocess
import os
import time
import sqlite3
from pathlib import Path

class PHPBackendTester:
    def __init__(self):
        self.base_url = "http://localhost:8080"
        self.session = requests.Session()
        self.test_results = []
        self.php_server_process = None
        self.setup_test_environment()
        
    def setup_test_environment(self):
        """Setup test environment with SQLite database"""
        print("🔧 Setting up test environment...")
        
        # Create test config for SQLite
        self.create_test_config()
        
        # Create SQLite database with test data
        self.create_test_database()
        
        # Start PHP built-in server
        self.start_php_server()
        
    def create_test_config(self):
        """Create a test configuration file using SQLite"""
        test_config = '''<?php
// Test configuration using SQLite for testing
$host = 'localhost';
$dbname = '/app/test_ftc.db';

try {
    $pdo = new PDO("sqlite:$dbname");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    die("Erreur de connexion : " . $e->getMessage());
}

// Configuration CORS pour React
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=utf-8');

// Gestion des requêtes OPTIONS (CORS preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}
?>'''
        
        with open('/app/hostinger-deploy/api/test_config.php', 'w') as f:
            f.write(test_config)
            
    def create_test_database(self):
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
        
        # Insert test data for cars
        cursor.execute('''
            INSERT INTO cars (brand, year, model, mileage, price, images, fuel, transmission, color, description, featured)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', ('BMW', 2020, '320i', 45000, 28500.00, '["https://images.unsplash.com/photo-1555215695-3004980ad54e?w=500&h=300&fit=crop"]', 'Gasolina', 'Automática', 'Preto', 'BMW 320i em excelente estado', 1))
        
        cursor.execute('''
            INSERT INTO cars (brand, year, model, mileage, price, images, fuel, transmission, color, description, featured)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', ('Mercedes-Benz', 2019, 'C200', 52000, 32000.00, '["https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=500&h=300&fit=crop"]', 'Gasolina', 'Automática', 'Prata', 'Mercedes-Benz C200 com interior em pele', 1))
        
        # Insert test data for jetskis
        cursor.execute('''
            INSERT INTO jetskis (brand, year, model, hours, price, images, engine, passengers, fuel, color, description, featured)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', ('Yamaha', 2023, 'VX Cruiser HO', 45, 18500.00, '["https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=500&h=300&fit=crop"]', '1812cc', 3, 'Gasolina', 'Azul/Branco', 'Yamaha VX Cruiser HO em excelente estado', 1))
        
        conn.commit()
        conn.close()
        print("✅ Test database created successfully")
        
    def start_php_server(self):
        """Start PHP built-in server"""
        print("🚀 Starting PHP server...")
        
        # Change to the hostinger-deploy directory
        os.chdir('/app/hostinger-deploy')
        
        # Start PHP server in background
        self.php_server_process = subprocess.Popen([
            'php', '-S', 'localhost:8080', 'index.php'
        ], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        
        # Wait for server to start
        time.sleep(2)
        
        # Test if server is running
        try:
            response = requests.get(f"{self.base_url}/", timeout=5)
            if response.status_code == 200:
                print("✅ PHP server started successfully")
            else:
                print(f"⚠️ PHP server responded with status {response.status_code}")
        except requests.exceptions.RequestException as e:
            print(f"❌ Failed to connect to PHP server: {e}")
            
    def modify_php_files_for_testing(self):
        """Modify PHP files to use test configuration"""
        files_to_modify = [
            '/app/hostinger-deploy/api/admin.php',
            '/app/hostinger-deploy/api/cars.php', 
            '/app/hostinger-deploy/api/jetskis.php'
        ]
        
        for file_path in files_to_modify:
            with open(file_path, 'r') as f:
                content = f.read()
            
            # Replace config.php with test_config.php
            content = content.replace("require_once 'config.php';", "require_once 'test_config.php';")
            
            with open(file_path, 'w') as f:
                f.write(content)
                
        print("✅ PHP files modified for testing")
        
    def restore_php_files(self):
        """Restore original PHP files"""
        files_to_restore = [
            '/app/hostinger-deploy/api/admin.php',
            '/app/hostinger-deploy/api/cars.php',
            '/app/hostinger-deploy/api/jetskis.php'
        ]
        
        for file_path in files_to_restore:
            with open(file_path, 'r') as f:
                content = f.read()
            
            # Restore original config
            content = content.replace("require_once 'test_config.php';", "require_once 'config.php';")
            
            with open(file_path, 'w') as f:
                f.write(content)
                
    def log_test_result(self, test_name, success, details=""):
        """Log test result"""
        status = "✅ PASS" if success else "❌ FAIL"
        result = {
            'test': test_name,
            'success': success,
            'details': details
        }
        self.test_results.append(result)
        print(f"{status} {test_name}: {details}")
        
    def test_admin_authentication(self):
        """Test admin authentication endpoints"""
        print("\n🔐 Testing Admin Authentication...")
        
        # Test login with correct credentials
        login_data = {
            "username": "admin",
            "password": "admin123"
        }
        
        try:
            response = self.session.post(f"{self.base_url}/api/admin/login", 
                                       json=login_data, 
                                       headers={'Content-Type': 'application/json'})
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    self.log_test_result("Admin Login (Valid Credentials)", True, "Login successful")
                else:
                    self.log_test_result("Admin Login (Valid Credentials)", False, f"Login failed: {data.get('message', 'Unknown error')}")
            else:
                self.log_test_result("Admin Login (Valid Credentials)", False, f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_test_result("Admin Login (Valid Credentials)", False, f"Exception: {str(e)}")
            
        # Test login with invalid credentials
        invalid_login_data = {
            "username": "admin",
            "password": "wrongpassword"
        }
        
        try:
            response = requests.post(f"{self.base_url}/api/admin/login", 
                                   json=invalid_login_data,
                                   headers={'Content-Type': 'application/json'})
            
            if response.status_code == 401:
                self.log_test_result("Admin Login (Invalid Credentials)", True, "Correctly rejected invalid credentials")
            else:
                self.log_test_result("Admin Login (Invalid Credentials)", False, f"Expected 401, got {response.status_code}")
                
        except Exception as e:
            self.log_test_result("Admin Login (Invalid Credentials)", False, f"Exception: {str(e)}")
            
        # Test admin status check
        try:
            response = self.session.get(f"{self.base_url}/api/admin/status")
            
            if response.status_code == 200:
                data = response.json()
                if data.get('logged_in'):
                    self.log_test_result("Admin Status Check", True, "Admin is logged in")
                else:
                    self.log_test_result("Admin Status Check", False, "Admin not logged in after successful login")
            else:
                self.log_test_result("Admin Status Check", False, f"HTTP {response.status_code}")
                
        except Exception as e:
            self.log_test_result("Admin Status Check", False, f"Exception: {str(e)}")
            
    def test_cars_api(self):
        """Test cars API endpoints"""
        print("\n🚗 Testing Cars API...")
        
        # Test GET all cars (should work without auth)
        try:
            response = requests.get(f"{self.base_url}/api/cars")
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list) and len(data) > 0:
                    self.log_test_result("GET All Cars", True, f"Retrieved {len(data)} cars")
                else:
                    self.log_test_result("GET All Cars", False, "No cars returned or invalid format")
            else:
                self.log_test_result("GET All Cars", False, f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_test_result("GET All Cars", False, f"Exception: {str(e)}")
            
        # Test GET featured cars
        try:
            response = requests.get(f"{self.base_url}/api/cars/featured")
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    self.log_test_result("GET Featured Cars", True, f"Retrieved {len(data)} featured cars")
                else:
                    self.log_test_result("GET Featured Cars", False, "Invalid response format")
            else:
                self.log_test_result("GET Featured Cars", False, f"HTTP {response.status_code}")
                
        except Exception as e:
            self.log_test_result("GET Featured Cars", False, f"Exception: {str(e)}")
            
        # Test GET specific car by ID
        try:
            response = requests.get(f"{self.base_url}/api/cars/1")
            
            if response.status_code == 200:
                data = response.json()
                if 'id' in data and 'brand' in data:
                    self.log_test_result("GET Car by ID", True, f"Retrieved car: {data.get('brand')} {data.get('model')}")
                else:
                    self.log_test_result("GET Car by ID", False, "Invalid car data format")
            else:
                self.log_test_result("GET Car by ID", False, f"HTTP {response.status_code}")
                
        except Exception as e:
            self.log_test_result("GET Car by ID", False, f"Exception: {str(e)}")
            
        # Test POST new car (requires admin auth)
        new_car_data = {
            "brand": "Audi",
            "year": 2021,
            "model": "A4",
            "mileage": 25000,
            "price": 35000.00,
            "images": ["https://example.com/audi.jpg"],
            "fuel": "Diesel",
            "transmission": "Automática",
            "color": "Branco",
            "description": "Audi A4 quase novo",
            "featured": True
        }
        
        try:
            response = self.session.post(f"{self.base_url}/api/cars", 
                                       json=new_car_data,
                                       headers={'Content-Type': 'application/json'})
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    self.log_test_result("POST New Car (Authenticated)", True, f"Car added with ID: {data.get('id')}")
                else:
                    self.log_test_result("POST New Car (Authenticated)", False, "Failed to add car")
            else:
                self.log_test_result("POST New Car (Authenticated)", False, f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_test_result("POST New Car (Authenticated)", False, f"Exception: {str(e)}")
            
        # Test POST without authentication
        try:
            response = requests.post(f"{self.base_url}/api/cars", 
                                   json=new_car_data,
                                   headers={'Content-Type': 'application/json'})
            
            if response.status_code == 401:
                self.log_test_result("POST New Car (Unauthenticated)", True, "Correctly rejected unauthenticated request")
            else:
                self.log_test_result("POST New Car (Unauthenticated)", False, f"Expected 401, got {response.status_code}")
                
        except Exception as e:
            self.log_test_result("POST New Car (Unauthenticated)", False, f"Exception: {str(e)}")
            
    def test_jetskis_api(self):
        """Test jet-skis API endpoints"""
        print("\n🏄 Testing Jet-skis API...")
        
        # Test GET all jetskis
        try:
            response = requests.get(f"{self.base_url}/api/jetskis")
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list) and len(data) > 0:
                    self.log_test_result("GET All Jetskis", True, f"Retrieved {len(data)} jetskis")
                else:
                    self.log_test_result("GET All Jetskis", False, "No jetskis returned or invalid format")
            else:
                self.log_test_result("GET All Jetskis", False, f"HTTP {response.status_code}")
                
        except Exception as e:
            self.log_test_result("GET All Jetskis", False, f"Exception: {str(e)}")
            
        # Test GET featured jetskis
        try:
            response = requests.get(f"{self.base_url}/api/jetskis/featured")
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    self.log_test_result("GET Featured Jetskis", True, f"Retrieved {len(data)} featured jetskis")
                else:
                    self.log_test_result("GET Featured Jetskis", False, "Invalid response format")
            else:
                self.log_test_result("GET Featured Jetskis", False, f"HTTP {response.status_code}")
                
        except Exception as e:
            self.log_test_result("GET Featured Jetskis", False, f"Exception: {str(e)}")
            
        # Test GET specific jetski by ID
        try:
            response = requests.get(f"{self.base_url}/api/jetskis/1")
            
            if response.status_code == 200:
                data = response.json()
                if 'id' in data and 'brand' in data:
                    self.log_test_result("GET Jetski by ID", True, f"Retrieved jetski: {data.get('brand')} {data.get('model')}")
                else:
                    self.log_test_result("GET Jetski by ID", False, "Invalid jetski data format")
            else:
                self.log_test_result("GET Jetski by ID", False, f"HTTP {response.status_code}")
                
        except Exception as e:
            self.log_test_result("GET Jetski by ID", False, f"Exception: {str(e)}")
            
        # Test POST new jetski (requires admin auth)
        new_jetski_data = {
            "brand": "Sea-Doo",
            "year": 2022,
            "model": "GTX 230",
            "hours": 78,
            "price": 22000.00,
            "images": ["https://example.com/seadoo.jpg"],
            "engine": "1630cc Rotax",
            "passengers": 3,
            "fuel": "Gasolina",
            "color": "Preto/Amarelo",
            "description": "Sea-Doo GTX 230 com sistema de som",
            "featured": True
        }
        
        try:
            response = self.session.post(f"{self.base_url}/api/jetskis", 
                                       json=new_jetski_data,
                                       headers={'Content-Type': 'application/json'})
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    self.log_test_result("POST New Jetski (Authenticated)", True, f"Jetski added with ID: {data.get('id')}")
                else:
                    self.log_test_result("POST New Jetski (Authenticated)", False, "Failed to add jetski")
            else:
                self.log_test_result("POST New Jetski (Authenticated)", False, f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_test_result("POST New Jetski (Authenticated)", False, f"Exception: {str(e)}")
            
    def test_admin_stats(self):
        """Test admin statistics endpoint"""
        print("\n📊 Testing Admin Statistics...")
        
        try:
            response = self.session.get(f"{self.base_url}/api/admin/stats")
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success') and 'stats' in data:
                    stats = data['stats']
                    self.log_test_result("GET Admin Stats", True, 
                                       f"Cars: {stats.get('cars_count')}, Jetskis: {stats.get('jetskis_count')}")
                else:
                    self.log_test_result("GET Admin Stats", False, "Invalid stats response format")
            else:
                self.log_test_result("GET Admin Stats", False, f"HTTP {response.status_code}")
                
        except Exception as e:
            self.log_test_result("GET Admin Stats", False, f"Exception: {str(e)}")
            
    def test_admin_logout(self):
        """Test admin logout"""
        print("\n🚪 Testing Admin Logout...")
        
        try:
            response = self.session.post(f"{self.base_url}/api/admin/logout")
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    self.log_test_result("Admin Logout", True, "Logout successful")
                else:
                    self.log_test_result("Admin Logout", False, "Logout failed")
            else:
                self.log_test_result("Admin Logout", False, f"HTTP {response.status_code}")
                
        except Exception as e:
            self.log_test_result("Admin Logout", False, f"Exception: {str(e)}")
            
        # Verify logout by checking status
        try:
            response = self.session.get(f"{self.base_url}/api/admin/status")
            
            if response.status_code == 200:
                data = response.json()
                if not data.get('logged_in'):
                    self.log_test_result("Verify Logout Status", True, "Admin successfully logged out")
                else:
                    self.log_test_result("Verify Logout Status", False, "Admin still logged in after logout")
            else:
                self.log_test_result("Verify Logout Status", False, f"HTTP {response.status_code}")
                
        except Exception as e:
            self.log_test_result("Verify Logout Status", False, f"Exception: {str(e)}")
            
    def run_all_tests(self):
        """Run all tests"""
        print("🧪 Starting PHP Backend API Tests for FTC Automóveis")
        print("=" * 60)
        
        # Modify PHP files to use test config
        self.modify_php_files_for_testing()
        
        try:
            # Run all test suites
            self.test_admin_authentication()
            self.test_cars_api()
            self.test_jetskis_api()
            self.test_admin_stats()
            self.test_admin_logout()
            
        finally:
            # Restore original PHP files
            self.restore_php_files()
            
        # Print summary
        self.print_test_summary()
        
    def print_test_summary(self):
        """Print test summary"""
        print("\n" + "=" * 60)
        print("📋 TEST SUMMARY")
        print("=" * 60)
        
        passed = sum(1 for result in self.test_results if result['success'])
        failed = len(self.test_results) - passed
        
        print(f"Total Tests: {len(self.test_results)}")
        print(f"✅ Passed: {passed}")
        print(f"❌ Failed: {failed}")
        print(f"Success Rate: {(passed/len(self.test_results)*100):.1f}%")
        
        if failed > 0:
            print("\n❌ FAILED TESTS:")
            for result in self.test_results:
                if not result['success']:
                    print(f"  • {result['test']}: {result['details']}")
                    
        print("\n" + "=" * 60)
        
    def cleanup(self):
        """Cleanup test environment"""
        if self.php_server_process:
            self.php_server_process.terminate()
            self.php_server_process.wait()
            
        # Remove test database
        if os.path.exists('/app/test_ftc.db'):
            os.remove('/app/test_ftc.db')
            
        # Remove test config
        if os.path.exists('/app/hostinger-deploy/api/test_config.php'):
            os.remove('/app/hostinger-deploy/api/test_config.php')
            
        print("🧹 Test environment cleaned up")

def main():
    tester = PHPBackendTester()
    
    try:
        tester.run_all_tests()
    except KeyboardInterrupt:
        print("\n⚠️ Tests interrupted by user")
    except Exception as e:
        print(f"\n❌ Unexpected error: {str(e)}")
    finally:
        tester.cleanup()

if __name__ == "__main__":
    main()