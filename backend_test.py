import requests
import sys
from datetime import datetime

class SimpleAPITester:
    def __init__(self, base_url="https://incorproadmap.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0

    def run_test(self, name, method, endpoint, expected_status, data=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        if self.token:
            headers['Authorization'] = f'Bearer {self.token}'

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                return True, response.json() if response.content else {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                if response.content:
                    print(f"Response: {response.text}")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_login(self, email, password):
        """Test login and get token"""
        success, response = self.run_test(
            "Login",
            "POST",
            "auth/login",
            200,
            data={"email": email, "password": password}
        )
        if success and 'token' in response:
            self.token = response['token']
            return True, response
        return False, {}

    def test_change_password(self, user_id, current_password, new_password):
        """Test password change"""
        success, response = self.run_test(
            "Change Password",
            "PUT",
            f"users/{user_id}/password",
            200,
            data={"current_password": current_password, "new_password": new_password}
        )
        return success, response

    def test_get_users(self):
        """Get users list"""
        success, response = self.run_test(
            "Get Users",
            "GET",
            "users",
            200
        )
        return success, response

    def test_create_user(self, user_data):
        """Create new user"""
        success, response = self.run_test(
            "Create User",
            "POST",
            "users",
            200,
            data=user_data
        )
        return success, response

    def test_get_companies(self):
        """Get companies list"""
        success, response = self.run_test(
            "Get Companies",
            "GET",
            "companies",
            200
        )
        return success, response

    def test_get_company_project(self, company_id):
        """Get company project"""
        success, response = self.run_test(
            "Get Company Project",
            "GET",
            f"companies/{company_id}/project",
            200
        )
        return success, response

    def test_update_project(self, company_id, data):
        """Update project data"""
        success, response = self.run_test(
            "Update Project",
            "PUT",
            f"companies/{company_id}/project",
            200,
            data=data
        )
        return success, response

    def test_get_intake(self, company_id):
        """Get company intake"""
        success, response = self.run_test(
            "Get Company Intake",
            "GET",
            f"companies/{company_id}/intake",
            200
        )
        return success, response

    def test_create_intake(self, company_id, data):
        """Create/update intake"""
        success, response = self.run_test(
            "Create/Update Intake",
            "POST",
            f"companies/{company_id}/intake",
            200,
            data=data
        )
        return success, response

    def test_submit_intake(self, company_id):
        """Submit intake"""
        success, response = self.run_test(
            "Submit Intake",
            "POST",
            f"companies/{company_id}/intake/submit",
            200
        )
        return success, response

def main():
    # Setup
    tester = SimpleAPITester()
    
    print("=== Testing Bootstrap Admin Functionality ===")
    
    # Test bootstrap admin login (should exist from startup)
    success, login_response = tester.test_login("admin@espaciodatos.com", "admin123")
    if not success:
        print("❌ Bootstrap admin login failed - P0 issue not resolved!")
        return 1

    print(f"✅ Bootstrap admin login successful: {login_response.get('user', {}).get('name', 'Unknown')}")
    print(f"   - Email: {login_response.get('user', {}).get('email', 'Unknown')}")
    print(f"   - Role: {login_response.get('user', {}).get('role', 'Unknown')}")
    
    # Get users list to verify admin exists
    success, users = tester.test_get_users()
    if not success:
        print("❌ Failed to get users list")
        return 1

    admin_users = [u for u in users if u.get('role') == 'admin']
    print(f"✅ Found {len(admin_users)} admin user(s)")
    
    bootstrap_admin = None
    for user in admin_users:
        if user.get('email') == 'admin@espaciodatos.com':
            bootstrap_admin = user
            break
    
    if not bootstrap_admin:
        print("❌ Bootstrap admin not found in users list")
        return 1
    
    print(f"✅ Bootstrap admin found: {bootstrap_admin['name']} ({bootstrap_admin['email']})")
    
    # Test password change functionality
    print("\n=== Testing Password Change Functionality ===")
    
    # Create a test user first
    test_user_data = {
        "email": f"testuser_{datetime.now().strftime('%H%M%S')}@test.com",
        "name": "Test User",
        "password": "testpass123",
        "role": "asesor"
    }
    
    success, created_user = tester.test_create_user(test_user_data)
    if not success:
        print("❌ Failed to create test user for password change test")
        return 1
    
    print(f"✅ Test user created: {created_user['name']} ({created_user['email']})")
    
    # Test admin changing another user's password
    success, _ = tester.test_change_password(
        created_user['id'], 
        "admin123",  # Admin's current password
        "newpassword123"  # New password for test user
    )
    
    if success:
        print("✅ Admin successfully changed test user's password")
        
        # Test login with new password
        test_tester = SimpleAPITester()
        success, _ = test_tester.test_login(created_user['email'], "newpassword123")
        if success:
            print("✅ Test user can login with new password")
        else:
            print("❌ Test user cannot login with new password")
            
        # Test that old password doesn't work
        old_tester = SimpleAPITester()
        success, _ = old_tester.test_login(created_user['email'], "testpass123")
        if not success:
            print("✅ Test user correctly cannot login with old password")
        else:
            print("❌ Test user can still login with old password (should be blocked)")
            
    else:
        print("❌ Admin failed to change test user's password")
    
    # Test admin changing their own password
    print("\n=== Testing Admin Self Password Change ===")
    
    success, _ = tester.test_change_password(
        bootstrap_admin['id'],
        "admin123",  # Current admin password
        "newadmin123"  # New admin password
    )
    
    if success:
        print("✅ Admin successfully changed own password")
        
        # Test login with new admin password
        new_admin_tester = SimpleAPITester()
        success, _ = new_admin_tester.test_login("admin@espaciodatos.com", "newadmin123")
        if success:
            print("✅ Admin can login with new password")
            
            # Change password back for consistency
            success, _ = new_admin_tester.test_change_password(
                bootstrap_admin['id'],
                "newadmin123",
                "admin123"
            )
            if success:
                print("✅ Admin password restored to original")
            else:
                print("⚠️ Could not restore admin password to original")
        else:
            print("❌ Admin cannot login with new password")
    else:
        print("❌ Admin failed to change own password")
    
    # Test invalid password change scenarios
    print("\n=== Testing Password Change Error Handling ===")
    
    # Test with wrong current password
    success, _ = tester.test_change_password(
        bootstrap_admin['id'],
        "wrongpassword",
        "newpass123"
    )
    
    if not success:
        print("✅ Password change correctly rejected with wrong current password")
    else:
        print("❌ Password change accepted with wrong current password (security issue)")
    
    # Test with too short new password
    success, _ = tester.test_change_password(
        bootstrap_admin['id'],
        "admin123",
        "123"  # Too short
    )
    
    if not success:
        print("✅ Password change correctly rejected with too short password")
    else:
        print("❌ Password change accepted with too short password (validation issue)")

    # Test user creation with different roles
    print("\n=== Testing User Creation with Different Roles ===")
    
    roles_to_test = ["admin", "asesor", "cliente"]
    
    for role in roles_to_test:
        user_data = {
            "email": f"test_{role}_{datetime.now().strftime('%H%M%S')}@test.com",
            "name": f"Test {role.title()}",
            "password": "testpass123",
            "role": role
        }
        
        success, created = tester.test_create_user(user_data)
        if success:
            print(f"✅ Successfully created {role} user: {created['name']}")
        else:
            print(f"❌ Failed to create {role} user")

    # Print results
    print(f"\n📊 Tests passed: {tester.tests_passed}/{tester.tests_run}")
    return 0 if tester.tests_passed == tester.tests_run else 1

if __name__ == "__main__":
    sys.exit(main())