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
    
    print("=== Testing Asesor API Access ===")
    
    # Test asesor login
    success, login_response = tester.test_login("asesor@espaciodatos.com", "asesor123")
    if not success:
        print("❌ Asesor login failed, stopping tests")
        return 1

    print(f"✅ Asesor logged in: {login_response.get('user', {}).get('name', 'Unknown')}")

    # Get companies list
    success, companies = tester.test_get_companies()
    if not success:
        print("❌ Failed to get companies")
        return 1

    print(f"✅ Found {len(companies)} companies")
    
    # Find Demo Cuestionario company (lead status)
    demo_company = None
    for company in companies:
        if 'Demo Cuestionario' in company.get('name', ''):
            demo_company = company
            break
    
    if not demo_company:
        print("❌ Demo Cuestionario company not found")
        return 1
    
    print(f"✅ Found Demo Cuestionario: {demo_company['name']} - Status: {demo_company['status']}")
    
    # Test intake functionality with asesor credentials
    print("\n=== Testing Intake API (Asesor) ===")
    
    # Get intake (should be empty initially)
    success, intake = tester.test_get_intake(demo_company['id'])
    if success:
        print(f"✅ Intake API accessible - Submitted: {intake.get('submitted', False) if intake else 'No intake'}")
    else:
        print("❌ Failed to access intake API")

    # Test cliente cuestionario login
    print("\n=== Testing Cliente Cuestionario API Access ===")
    
    cliente_tester = SimpleAPITester()
    success, cliente_response = cliente_tester.test_login("cliente.cuestionario@espaciodatos.com", "cliente123")
    if success:
        print(f"✅ Cliente cuestionario logged in: {cliente_response.get('user', {}).get('name', 'Unknown')}")
        
        # Test dashboard access
        success, dashboard = cliente_tester.run_test(
            "Cliente Dashboard",
            "GET",
            "client/dashboard",
            200
        )
        if success:
            print(f"✅ Cliente dashboard accessible - Status: {dashboard.get('status', 'Unknown')}")
            print(f"   - Company Status: {dashboard.get('company', {}).get('status', 'Unknown')}")
            print(f"   - Intake Status: {dashboard.get('company', {}).get('intake_status', 'Unknown')}")
        else:
            print("❌ Cliente dashboard not accessible")
            
        # Test intake creation
        print("\n=== Testing Intake Creation ===")
        
        intake_data = {
            "data_types": ["operativos", "comerciales"],
            "data_usage": "reporting",
            "main_interests": ["mejorar_procesos", "acceder_datos_externos"],
            "data_sensitivity": "media",
            "notes": "Empresa interesada en compartir datos operativos"
        }
        
        success, created_intake = cliente_tester.test_create_intake(demo_company['id'], intake_data)
        if success:
            print("✅ Intake created successfully")
            print(f"   - Data Types: {created_intake.get('data_types', [])}")
            print(f"   - Data Usage: {created_intake.get('data_usage', 'Unknown')}")
            print(f"   - Submitted: {created_intake.get('submitted', False)}")
        else:
            print("❌ Failed to create intake")
            
        # Test intake submission
        print("\n=== Testing Intake Submission ===")
        
        success, submitted_intake = cliente_tester.test_submit_intake(demo_company['id'])
        if success:
            print("✅ Intake submitted successfully")
            print(f"   - Submitted: {submitted_intake.get('submitted', False)}")
            print(f"   - Submitted At: {submitted_intake.get('submitted_at', 'Unknown')}")
        else:
            print("❌ Failed to submit intake")
            
        # Test that client cannot edit after submission
        print("\n=== Testing Post-Submission Restrictions ===")
        
        success, _ = cliente_tester.test_create_intake(demo_company['id'], {"notes": "Should not work"})
        if not success:
            print("✅ Client correctly prevented from editing after submission")
        else:
            print("❌ Client was able to edit after submission (should be blocked)")
            
    else:
        print("❌ Cliente cuestionario login failed")

    # Test cliente apta (should NOT see questionnaire)
    print("\n=== Testing Cliente Apta (Should NOT see questionnaire) ===")
    
    cliente_apta_tester = SimpleAPITester()
    success, apta_response = cliente_apta_tester.test_login("cliente.apta@espaciodatos.com", "cliente123")
    if success:
        print(f"✅ Cliente apta logged in: {apta_response.get('user', {}).get('name', 'Unknown')}")
        
        # Test dashboard access
        success, dashboard = cliente_apta_tester.run_test(
            "Cliente Apta Dashboard",
            "GET",
            "client/dashboard",
            200
        )
        if success:
            print(f"✅ Cliente apta dashboard accessible - Status: {dashboard.get('status', 'Unknown')}")
            print(f"   - Company Status: {dashboard.get('company', {}).get('status', 'Unknown')}")
            has_intake = 'intake' in dashboard
            print(f"   - Has Intake in Dashboard: {has_intake} (should be False for apta)")
        else:
            print("❌ Cliente apta dashboard not accessible")
    else:
        print("❌ Cliente apta login failed")

    # Test asesor can see submitted intake
    print("\n=== Testing Asesor Can View Submitted Intake ===")
    
    success, final_intake = tester.test_get_intake(demo_company['id'])
    if success and final_intake:
        print("✅ Asesor can view submitted intake")
        print(f"   - Data Types: {final_intake.get('data_types', [])}")
        print(f"   - Main Interests: {final_intake.get('main_interests', [])}")
        print(f"   - Submitted: {final_intake.get('submitted', False)}")
    else:
        print("❌ Asesor cannot view intake or intake not found")

    # Print results
    total_passed = tester.tests_passed + cliente_tester.tests_passed + cliente_apta_tester.tests_passed
    total_run = tester.tests_run + cliente_tester.tests_run + cliente_apta_tester.tests_run
    print(f"\n📊 Tests passed: {total_passed}/{total_run}")
    return 0 if total_passed == total_run else 1

if __name__ == "__main__":
    sys.exit(main())