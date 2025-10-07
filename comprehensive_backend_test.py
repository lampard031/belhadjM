#!/usr/bin/env python3
"""
Comprehensive PHP Backend Test for FTC Automóveis
Tests all endpoints with proper error handling and detailed reporting
"""

import requests
import json
import subprocess
import os
import time
import sqlite3
from pathlib import Path

class ComprehensivePHPTester:
    def __init__(self):
        self.base_url = "http://localhost:8082"
        self.session = requests.Session()
        self.test_results = []
        self.php_server_process = None
        self.critical_issues = []
        self.minor_issues = []
        
    def log_result(self, test_name, success, details="", is_critical=True):
        """Log test result and categorize issues"""
        status = "✅ PASS" if success else "❌ FAIL"
        result = {
            'test': test_name,
            'success': success,
            'details': details,
            'critical': is_critical
        }
        self.test_results.append(result)
        
        if not success:
            if is_critical:
                self.critical_issues.append(f"{test_name}: {details}")
            else:
                self.minor_issues.append(f"{test_name}: {details}")
        
        print(f"{status} {test_name}: {details}")
        
    def setup_test_environment(self):
        """Setup complete test environment"""
        print("🔧 Setting up comprehensive test environment...")
        
        # Create SQLite test database
        self.create_test_database()
        
        # Create test configuration
        self.create_test_config()
        
        # Start PHP server
        self.start_php_server()
        
        # Modify PHP files for testing
        self.modify_php_files()
        
    def create_test_database(self):
        """Create SQLite database with comprehensive test data"""
        db_path = '/app/test_ftc.db'
        
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
        
        # Insert comprehensive test data
        cars_data = [
            ('BMW', 2020, '320i', 45000, 28500.00, '["https://example.com/bmw.jpg"]', 'Gasolina', 'Automática', 'Preto', 'BMW 320i em excelente estado', 1),
            ('Mercedes-Benz', 2019, 'C200', 52000, 32000.00, '["https://example.com/mercedes.jpg"]', 'Gasolina', 'Automática', 'Prata', 'Mercedes-Benz C200 com interior em pele', 1),
            ('Audi', 2021, 'A4', 25000, 35000.00, '["https://example.com/audi.jpg"]', 'Diesel', 'Automática', 'Branco', 'Audi A4 quase novo', 0)
        ]
        
        for car in cars_data:
            cursor.execute('''
                INSERT INTO cars (brand, year, model, mileage, price, images, fuel, transmission, color, description, featured)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', car)
        
        jetskis_data = [
            ('Yamaha', 2023, 'VX Cruiser HO', 45, 18500.00, '["https://example.com/yamaha.jpg"]', '1812cc', 3, 'Gasolina', 'Azul/Branco', 'Yamaha VX Cruiser HO em excelente estado', 1),
            ('Sea-Doo', 2022, 'GTX 230', 78, 22000.00, '["https://example.com/seadoo.jpg"]', '1630cc Rotax', 3, 'Gasolina', 'Preto/Amarelo', 'Sea-Doo GTX 230 com sistema de som', 0)
        ]
        
        for jetski in jetskis_data:
            cursor.execute('''
                INSERT INTO jetskis (brand, year, model, hours, price, images, engine, passengers, fuel, color, description, featured)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', jetski)
        
        conn.commit()
        conn.close()
        print("✅ Comprehensive test database created")
        
    def create_test_config(self):
        """Create test configuration"""
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

// Handle OPTIONS requests
if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}
?>'''
        
        with open('/app/hostinger-deploy/api/test_config.php', 'w') as f:
            f.write(config_content)
        print("✅ Test configuration created")
        
    def start_php_server(self):
        """Start PHP built-in server"""
        print("🚀 Starting PHP server...")
        
        os.chdir('/app/hostinger-deploy')
        
        # Kill any existing PHP servers
        subprocess.run(['pkill', '-f', 'php.*8082'], capture_output=True)
        time.sleep(1)
        
        # Start new server
        self.php_server_process = subprocess.Popen([
            'php', '-S', 'localhost:8082', 'index.php'
        ], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        
        time.sleep(3)
        
        # Test server
        try:
            response = requests.get(f"{self.base_url}/", timeout=5)
            if response.status_code == 200:
                print("✅ PHP server started successfully")
                return True
            else:
                print(f"⚠️ PHP server responded with status {response.status_code}")
                return False
        except requests.exceptions.RequestException as e:
            print(f"❌ Failed to connect to PHP server: {e}")
            return False
            
    def modify_php_files(self):
        """Modify PHP files to use test configuration"""
        files_to_modify = [
            '/app/hostinger-deploy/api/admin.php',
            '/app/hostinger-deploy/api/cars.php',
            '/app/hostinger-deploy/api/jetskis.php'
        ]
        
        for file_path in files_to_modify:
            with open(file_path, 'r') as f:
                content = f.read()
            
            # Backup original
            with open(f"{file_path}.backup", 'w') as f:
                f.write(content)
            
            # Replace config
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
            backup_path = f"{file_path}.backup"
            if os.path.exists(backup_path):
                with open(backup_path, 'r') as f:
                    content = f.read()
                
                with open(file_path, 'w') as f:
                    f.write(content)
                
                os.remove(backup_path)
                
        print("✅ PHP files restored")
        
    def test_database_configuration(self):
        """Test database configuration issues"""
        print("\n🗄️ Testing Database Configuration...")
        
        # Test original config (should fail)
        try:
            response = requests.get("http://localhost:8082/api/cars")
            if "Erreur de connexion" in response.text or "Database connection error" in response.text:
                self.log_result("Original MySQL Config", False, 
                              "Database connection fails with placeholder credentials (Expected)", 
                              is_critical=False)
            else:
                self.log_result("Original MySQL Config", True, "Unexpected success with placeholder credentials")
        except Exception as e:
            self.log_result("Original MySQL Config", False, f"Connection error: {str(e)}", is_critical=False)
            
    def test_main_entry_point(self):
        """Test main PHP entry point (index.php)"""
        print("\n🏠 Testing Main Entry Point...")
        
        try:
            response = requests.get(f"{self.base_url}/")
            
            if response.status_code == 200:
                data = response.json()
                if 'status' in data and 'endpoints' in data:
                    self.log_result("Main Entry Point", True, "API status endpoint working correctly")
                else:
                    self.log_result("Main Entry Point", False, "Invalid response format from main endpoint")
            else:
                self.log_result("Main Entry Point", False, f"HTTP {response.status_code}")
                
        except Exception as e:
            self.log_result("Main Entry Point", False, f"Exception: {str(e)}")
            
    def test_cors_headers(self):
        """Test CORS headers"""
        print("\n🌐 Testing CORS Headers...")
        
        try:
            # Test OPTIONS request
            response = requests.options(f"{self.base_url}/api/cars")
            
            cors_headers = [
                'Access-Control-Allow-Origin',
                'Access-Control-Allow-Methods',
                'Access-Control-Allow-Headers'
            ]
            
            missing_headers = []
            for header in cors_headers:
                if header not in response.headers:
                    missing_headers.append(header)
            
            if not missing_headers:
                self.log_result("CORS Headers", True, "All required CORS headers present")
            else:
                self.log_result("CORS Headers", False, f"Missing headers: {', '.join(missing_headers)}")
                
        except Exception as e:
            self.log_result("CORS Headers", False, f"Exception: {str(e)}")
            
    def test_admin_authentication_comprehensive(self):
        """Comprehensive admin authentication tests"""
        print("\n🔐 Testing Admin Authentication (Comprehensive)...")
        
        # Test 1: Valid login
        login_data = {"username": "admin", "password": "admin123"}
        
        try:
            response = self.session.post(f"{self.base_url}/api/admin/login", 
                                       json=login_data,
                                       headers={'Content-Type': 'application/json'})
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success') and 'user' in data:
                    self.log_result("Admin Login (Valid)", True, "Login successful with user data")
                else:
                    self.log_result("Admin Login (Valid)", False, "Login response missing required fields")
            else:
                self.log_result("Admin Login (Valid)", False, f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result("Admin Login (Valid)", False, f"Exception: {str(e)}")
            
        # Test 2: Invalid credentials
        invalid_data = {"username": "admin", "password": "wrong"}
        
        try:
            response = requests.post(f"{self.base_url}/api/admin/login", 
                                   json=invalid_data,
                                   headers={'Content-Type': 'application/json'})
            
            if response.status_code == 401:
                self.log_result("Admin Login (Invalid)", True, "Correctly rejected invalid credentials")
            else:
                self.log_result("Admin Login (Invalid)", False, f"Expected 401, got {response.status_code}")
                
        except Exception as e:
            self.log_result("Admin Login (Invalid)", False, f"Exception: {str(e)}")
            
        # Test 3: Status check
        try:
            response = self.session.get(f"{self.base_url}/api/admin/status")
            
            if response.status_code == 200:
                data = response.json()
                if data.get('logged_in') and 'user' in data:
                    self.log_result("Admin Status Check", True, "Status check working correctly")
                else:
                    self.log_result("Admin Status Check", False, "Status response format incorrect")
            else:
                self.log_result("Admin Status Check", False, f"HTTP {response.status_code}")
                
        except Exception as e:
            self.log_result("Admin Status Check", False, f"Exception: {str(e)}")
            
        # Test 4: Admin stats
        try:
            response = self.session.get(f"{self.base_url}/api/admin/stats")
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success') and 'stats' in data:
                    stats = data['stats']
                    required_fields = ['cars_count', 'jetskis_count', 'total_vehicles']
                    missing_fields = [field for field in required_fields if field not in stats]
                    
                    if not missing_fields:
                        self.log_result("Admin Stats", True, 
                                      f"Stats: {stats['cars_count']} cars, {stats['jetskis_count']} jetskis")
                    else:
                        self.log_result("Admin Stats", False, f"Missing stats fields: {missing_fields}")
                else:
                    self.log_result("Admin Stats", False, "Stats response format incorrect")
            else:
                self.log_result("Admin Stats", False, f"HTTP {response.status_code}")
                
        except Exception as e:
            self.log_result("Admin Stats", False, f"Exception: {str(e)}")
            
    def test_cars_api_comprehensive(self):
        """Comprehensive cars API tests"""
        print("\n🚗 Testing Cars API (Comprehensive)...")
        
        # Test 1: GET all cars
        try:
            response = requests.get(f"{self.base_url}/api/cars")
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list) and len(data) >= 3:
                    # Check data structure
                    car = data[0]
                    required_fields = ['id', 'brand', 'model', 'year', 'price', 'images']
                    missing_fields = [field for field in required_fields if field not in car]
                    
                    if not missing_fields:
                        self.log_result("GET All Cars", True, f"Retrieved {len(data)} cars with correct structure")
                    else:
                        self.log_result("GET All Cars", False, f"Missing car fields: {missing_fields}")
                else:
                    self.log_result("GET All Cars", False, f"Expected at least 3 cars, got {len(data) if isinstance(data, list) else 'invalid format'}")
            else:
                self.log_result("GET All Cars", False, f"HTTP {response.status_code}")
                
        except Exception as e:
            self.log_result("GET All Cars", False, f"Exception: {str(e)}")
            
        # Test 2: GET featured cars
        try:
            response = requests.get(f"{self.base_url}/api/cars/featured")
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    featured_count = len(data)
                    self.log_result("GET Featured Cars", True, f"Retrieved {featured_count} featured cars")
                else:
                    self.log_result("GET Featured Cars", False, "Invalid response format")
            else:
                self.log_result("GET Featured Cars", False, f"HTTP {response.status_code}")
                
        except Exception as e:
            self.log_result("GET Featured Cars", False, f"Exception: {str(e)}")
            
        # Test 3: GET specific car by ID
        try:
            response = requests.get(f"{self.base_url}/api/cars/1")
            
            if response.status_code == 200:
                data = response.json()
                if 'id' in data and data['id'] == 1:
                    self.log_result("GET Car by ID", True, f"Retrieved car: {data.get('brand')} {data.get('model')}")
                else:
                    self.log_result("GET Car by ID", False, "Car ID mismatch or invalid format")
            else:
                self.log_result("GET Car by ID", False, f"HTTP {response.status_code}")
                
        except Exception as e:
            self.log_result("GET Car by ID", False, f"Exception: {str(e)}")
            
        # Test 4: GET non-existent car
        try:
            response = requests.get(f"{self.base_url}/api/cars/999")
            
            if response.status_code == 404:
                self.log_result("GET Non-existent Car", True, "Correctly returned 404 for non-existent car")
            else:
                self.log_result("GET Non-existent Car", False, f"Expected 404, got {response.status_code}")
                
        except Exception as e:
            self.log_result("GET Non-existent Car", False, f"Exception: {str(e)}")
            
        # Test 5: POST new car (authenticated)
        new_car = {
            "brand": "Tesla",
            "year": 2023,
            "model": "Model 3",
            "mileage": 5000,
            "price": 45000.00,
            "images": ["https://example.com/tesla.jpg"],
            "fuel": "Elétrico",
            "transmission": "Automática",
            "color": "Branco",
            "description": "Tesla Model 3 quase novo",
            "featured": False
        }
        
        try:
            response = self.session.post(f"{self.base_url}/api/cars", 
                                       json=new_car,
                                       headers={'Content-Type': 'application/json'})
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success') and 'id' in data:
                    self.log_result("POST New Car (Auth)", True, f"Car added with ID: {data['id']}")
                else:
                    self.log_result("POST New Car (Auth)", False, "Invalid response format")
            else:
                self.log_result("POST New Car (Auth)", False, f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result("POST New Car (Auth)", False, f"Exception: {str(e)}")
            
        # Test 6: POST without authentication
        try:
            response = requests.post(f"{self.base_url}/api/cars", 
                                   json=new_car,
                                   headers={'Content-Type': 'application/json'})
            
            if response.status_code == 401:
                self.log_result("POST Car (No Auth)", True, "Correctly rejected unauthenticated request")
            else:
                self.log_result("POST Car (No Auth)", False, f"Expected 401, got {response.status_code}")
                
        except Exception as e:
            self.log_result("POST Car (No Auth)", False, f"Exception: {str(e)}")
            
    def test_jetskis_api_comprehensive(self):
        """Comprehensive jet-skis API tests"""
        print("\n🏄 Testing Jet-skis API (Comprehensive)...")
        
        # Similar comprehensive tests for jet-skis
        # Test 1: GET all jetskis
        try:
            response = requests.get(f"{self.base_url}/api/jetskis")
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list) and len(data) >= 2:
                    jetski = data[0]
                    required_fields = ['id', 'brand', 'model', 'year', 'price', 'engine', 'passengers']
                    missing_fields = [field for field in required_fields if field not in jetski]
                    
                    if not missing_fields:
                        self.log_result("GET All Jetskis", True, f"Retrieved {len(data)} jetskis with correct structure")
                    else:
                        self.log_result("GET All Jetskis", False, f"Missing jetski fields: {missing_fields}")
                else:
                    self.log_result("GET All Jetskis", False, f"Expected at least 2 jetskis, got {len(data) if isinstance(data, list) else 'invalid format'}")
            else:
                self.log_result("GET All Jetskis", False, f"HTTP {response.status_code}")
                
        except Exception as e:
            self.log_result("GET All Jetskis", False, f"Exception: {str(e)}")
            
        # Test 2: POST new jetski (authenticated)
        new_jetski = {
            "brand": "Kawasaki",
            "year": 2023,
            "model": "Ultra 310X",
            "hours": 20,
            "price": 25000.00,
            "images": ["https://example.com/kawasaki.jpg"],
            "engine": "1498cc",
            "passengers": 3,
            "fuel": "Gasolina",
            "color": "Verde",
            "description": "Kawasaki Ultra 310X novo",
            "featured": True
        }
        
        try:
            response = self.session.post(f"{self.base_url}/api/jetskis", 
                                       json=new_jetski,
                                       headers={'Content-Type': 'application/json'})
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success') and 'id' in data:
                    self.log_result("POST New Jetski (Auth)", True, f"Jetski added with ID: {data['id']}")
                else:
                    self.log_result("POST New Jetski (Auth)", False, "Invalid response format")
            else:
                self.log_result("POST New Jetski (Auth)", False, f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result("POST New Jetski (Auth)", False, f"Exception: {str(e)}")
            
    def test_session_management(self):
        """Test PHP session management"""
        print("\n🍪 Testing Session Management...")
        
        # Test logout
        try:
            response = self.session.post(f"{self.base_url}/api/admin/logout")
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    self.log_result("Admin Logout", True, "Logout successful")
                    
                    # Verify logout by checking status
                    status_response = self.session.get(f"{self.base_url}/api/admin/status")
                    if status_response.status_code == 200:
                        status_data = status_response.json()
                        if not status_data.get('logged_in'):
                            self.log_result("Session Cleanup", True, "Session properly cleared after logout")
                        else:
                            self.log_result("Session Cleanup", False, "Session not cleared after logout")
                    else:
                        self.log_result("Session Cleanup", False, "Could not verify session status")
                else:
                    self.log_result("Admin Logout", False, "Logout failed")
            else:
                self.log_result("Admin Logout", False, f"HTTP {response.status_code}")
                
        except Exception as e:
            self.log_result("Admin Logout", False, f"Exception: {str(e)}")
            
    def run_all_tests(self):
        """Run all comprehensive tests"""
        print("🧪 Starting Comprehensive PHP Backend Tests for FTC Automóveis")
        print("=" * 70)
        
        if not self.setup_test_environment():
            print("❌ Failed to setup test environment")
            return
            
        try:
            # Run all test suites
            self.test_main_entry_point()
            self.test_cors_headers()
            self.test_admin_authentication_comprehensive()
            self.test_cars_api_comprehensive()
            self.test_jetskis_api_comprehensive()
            self.test_session_management()
            
        finally:
            self.cleanup()
            
        # Print comprehensive summary
        self.print_comprehensive_summary()
        
    def print_comprehensive_summary(self):
        """Print comprehensive test summary"""
        print("\n" + "=" * 70)
        print("📋 COMPREHENSIVE TEST SUMMARY")
        print("=" * 70)
        
        total_tests = len(self.test_results)
        passed = sum(1 for result in self.test_results if result['success'])
        failed = total_tests - passed
        critical_failed = len(self.critical_issues)
        minor_failed = len(self.minor_issues)
        
        print(f"Total Tests: {total_tests}")
        print(f"✅ Passed: {passed}")
        print(f"❌ Failed: {failed}")
        print(f"  • Critical Issues: {critical_failed}")
        print(f"  • Minor Issues: {minor_failed}")
        print(f"Success Rate: {(passed/total_tests*100):.1f}%")
        
        if self.critical_issues:
            print(f"\n🚨 CRITICAL ISSUES ({len(self.critical_issues)}):")
            for issue in self.critical_issues:
                print(f"  • {issue}")
                
        if self.minor_issues:
            print(f"\n⚠️ MINOR ISSUES ({len(self.minor_issues)}):")
            for issue in self.minor_issues:
                print(f"  • {issue}")
                
        # Overall assessment
        print(f"\n🎯 OVERALL ASSESSMENT:")
        if critical_failed == 0:
            print("✅ All critical functionality is working correctly")
            print("✅ PHP backend is ready for deployment")
        else:
            print("❌ Critical issues found that need to be addressed")
            
        print("\n" + "=" * 70)
        
    def cleanup(self):
        """Cleanup test environment"""
        print("\n🧹 Cleaning up test environment...")
        
        # Restore PHP files
        self.restore_php_files()
        
        # Stop PHP server
        if self.php_server_process:
            self.php_server_process.terminate()
            self.php_server_process.wait()
            
        # Remove test files
        cleanup_files = [
            '/app/test_ftc.db',
            '/app/hostinger-deploy/api/test_config.php'
        ]
        
        for file in cleanup_files:
            if os.path.exists(file):
                os.remove(file)
                
        print("✅ Cleanup completed")

def main():
    tester = ComprehensivePHPTester()
    
    try:
        tester.run_all_tests()
    except KeyboardInterrupt:
        print("\n⚠️ Tests interrupted by user")
    except Exception as e:
        print(f"\n❌ Unexpected error: {str(e)}")
        import traceback
        traceback.print_exc()
    finally:
        tester.cleanup()

if __name__ == "__main__":
    main()