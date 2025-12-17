#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime

class EspacioDatosAPITester:
    def __init__(self, base_url="https://auth-foundation-1.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.admin_token = None
        self.asesor_token = None
        self.cliente_token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name}")
        else:
            print(f"❌ {name} - {details}")
        
        self.test_results.append({
            "test": name,
            "success": success,
            "details": details
        })

    def run_test(self, name, method, endpoint, expected_status, data=None, token=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        if token:
            headers['Authorization'] = f'Bearer {token}'

        print(f"\n🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=10)

            success = response.status_code == expected_status
            details = f"Status: {response.status_code}"
            
            if not success:
                details += f" (Expected {expected_status})"
                try:
                    error_data = response.json()
                    details += f" - {error_data.get('detail', 'Unknown error')}"
                except:
                    details += f" - {response.text[:100]}"

            self.log_test(name, success, details)
            
            return success, response.json() if success and response.content else {}

        except Exception as e:
            self.log_test(name, False, f"Error: {str(e)}")
            return False, {}

    def test_health_check(self):
        """Test API health check"""
        return self.run_test("API Health Check", "GET", "", 200)

    def test_seed_demo_users(self):
        """Seed demo users"""
        return self.run_test("Seed Demo Users", "POST", "seed-demo-users", 200)

    def test_login_admin(self):
        """Test admin login"""
        success, response = self.run_test(
            "Admin Login",
            "POST",
            "auth/login",
            200,
            data={"email": "admin@espaciodatos.com", "password": "admin123"}
        )
        if success and 'token' in response:
            self.admin_token = response['token']
            # Verify user data
            user = response.get('user', {})
            if user.get('role') == 'admin':
                self.log_test("Admin Login - Role Verification", True)
            else:
                self.log_test("Admin Login - Role Verification", False, f"Expected admin role, got {user.get('role')}")
        return success

    def test_login_asesor(self):
        """Test asesor login"""
        success, response = self.run_test(
            "Asesor Login",
            "POST",
            "auth/login",
            200,
            data={"email": "asesor@espaciodatos.com", "password": "asesor123"}
        )
        if success and 'token' in response:
            self.asesor_token = response['token']
            user = response.get('user', {})
            if user.get('role') == 'asesor':
                self.log_test("Asesor Login - Role Verification", True)
            else:
                self.log_test("Asesor Login - Role Verification", False, f"Expected asesor role, got {user.get('role')}")
        return success

    def test_login_cliente(self):
        """Test cliente login"""
        success, response = self.run_test(
            "Cliente Login",
            "POST",
            "auth/login",
            200,
            data={"email": "cliente@espaciodatos.com", "password": "cliente123"}
        )
        if success and 'token' in response:
            self.cliente_token = response['token']
            user = response.get('user', {})
            if user.get('role') == 'cliente':
                self.log_test("Cliente Login - Role Verification", True)
            else:
                self.log_test("Cliente Login - Role Verification", False, f"Expected cliente role, got {user.get('role')}")
        return success

    def test_invalid_login(self):
        """Test login with invalid credentials"""
        return self.run_test(
            "Invalid Login",
            "POST",
            "auth/login",
            401,
            data={"email": "invalid@test.com", "password": "wrongpass"}
        )

    def test_get_me_admin(self):
        """Test /auth/me endpoint with admin token"""
        if not self.admin_token:
            self.log_test("Get Me (Admin)", False, "No admin token available")
            return False
        return self.run_test("Get Me (Admin)", "GET", "auth/me", 200, token=self.admin_token)

    def test_get_me_no_token(self):
        """Test /auth/me endpoint without token"""
        return self.run_test("Get Me (No Token)", "GET", "auth/me", 401)

    def test_list_users_admin(self):
        """Test listing users as admin"""
        if not self.admin_token:
            self.log_test("List Users (Admin)", False, "No admin token available")
            return False
        return self.run_test("List Users (Admin)", "GET", "users", 200, token=self.admin_token)

    def test_list_users_asesor(self):
        """Test listing users as asesor (should fail)"""
        if not self.asesor_token:
            self.log_test("List Users (Asesor - Should Fail)", False, "No asesor token available")
            return False
        return self.run_test("List Users (Asesor - Should Fail)", "GET", "users", 403, token=self.asesor_token)

    def test_create_user_admin(self):
        """Test creating user as admin"""
        if not self.admin_token:
            self.log_test("Create User (Admin)", False, "No admin token available")
            return False
        
        test_user_data = {
            "email": f"test_user_{datetime.now().strftime('%H%M%S')}@test.com",
            "name": "Test User",
            "password": "testpass123",
            "role": "cliente"
        }
        
        success, response = self.run_test(
            "Create User (Admin)",
            "POST",
            "users",
            200,
            data=test_user_data,
            token=self.admin_token
        )
        
        if success:
            # Store the created user ID for deletion test
            self.test_user_id = response.get('id')
        
        return success

    def test_create_user_asesor(self):
        """Test creating user as asesor (should fail)"""
        if not self.asesor_token:
            self.log_test("Create User (Asesor - Should Fail)", False, "No asesor token available")
            return False
        
        test_user_data = {
            "email": f"test_fail_{datetime.now().strftime('%H%M%S')}@test.com",
            "name": "Test Fail User",
            "password": "testpass123",
            "role": "cliente"
        }
        
        return self.run_test(
            "Create User (Asesor - Should Fail)",
            "POST",
            "users",
            403,
            data=test_user_data,
            token=self.asesor_token
        )

    def test_update_user_admin(self):
        """Test updating user as admin"""
        if not self.admin_token or not hasattr(self, 'test_user_id'):
            self.log_test("Update User (Admin)", False, "No admin token or test user available")
            return False
        
        update_data = {
            "name": "Updated Test User",
            "role": "asesor"
        }
        
        return self.run_test(
            "Update User (Admin)",
            "PUT",
            f"users/{self.test_user_id}",
            200,
            data=update_data,
            token=self.admin_token
        )

    def test_delete_user_admin(self):
        """Test deleting user as admin"""
        if not self.admin_token or not hasattr(self, 'test_user_id'):
            self.log_test("Delete User (Admin)", False, "No admin token or test user available")
            return False
        
        return self.run_test(
            "Delete User (Admin)",
            "DELETE",
            f"users/{self.test_user_id}",
            200,
            token=self.admin_token
        )

    def test_delete_self_admin(self):
        """Test admin trying to delete themselves (should fail)"""
        if not self.admin_token:
            self.log_test("Delete Self (Admin - Should Fail)", False, "No admin token available")
            return False
        
        # First get admin user ID
        success, response = self.run_test("Get Admin ID", "GET", "auth/me", 200, token=self.admin_token)
        if not success:
            return False
        
        admin_id = response.get('id')
        if not admin_id:
            self.log_test("Delete Self (Admin - Should Fail)", False, "Could not get admin ID")
            return False
        
        return self.run_test(
            "Delete Self (Admin - Should Fail)",
            "DELETE",
            f"users/{admin_id}",
            400,
            token=self.admin_token
        )

def main():
    print("🚀 Starting Espacio de Datos API Tests")
    print("=" * 50)
    
    tester = EspacioDatosAPITester()
    
    # Test sequence
    test_sequence = [
        tester.test_health_check,
        tester.test_seed_demo_users,
        tester.test_invalid_login,
        tester.test_login_admin,
        tester.test_login_asesor,
        tester.test_login_cliente,
        tester.test_get_me_admin,
        tester.test_get_me_no_token,
        tester.test_list_users_admin,
        tester.test_list_users_asesor,
        tester.test_create_user_admin,
        tester.test_create_user_asesor,
        tester.test_update_user_admin,
        tester.test_delete_user_admin,
        tester.test_delete_self_admin,
    ]
    
    # Run all tests
    for test_func in test_sequence:
        try:
            test_func()
        except Exception as e:
            print(f"❌ {test_func.__name__} - Exception: {str(e)}")
            tester.tests_run += 1
    
    # Print summary
    print("\n" + "=" * 50)
    print("📊 TEST SUMMARY")
    print("=" * 50)
    print(f"Total Tests: {tester.tests_run}")
    print(f"Passed: {tester.tests_passed}")
    print(f"Failed: {tester.tests_run - tester.tests_passed}")
    print(f"Success Rate: {(tester.tests_passed / tester.tests_run * 100):.1f}%")
    
    # Save detailed results
    results = {
        "timestamp": datetime.now().isoformat(),
        "summary": {
            "total": tester.tests_run,
            "passed": tester.tests_passed,
            "failed": tester.tests_run - tester.tests_passed,
            "success_rate": round(tester.tests_passed / tester.tests_run * 100, 1)
        },
        "tests": tester.test_results
    }
    
    with open('/app/backend_test_results.json', 'w') as f:
        json.dump(results, f, indent=2)
    
    print(f"\n📄 Detailed results saved to: /app/backend_test_results.json")
    
    return 0 if tester.tests_passed == tester.tests_run else 1

if __name__ == "__main__":
    sys.exit(main())