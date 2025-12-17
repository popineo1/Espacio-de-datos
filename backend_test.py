import requests
import sys
from datetime import datetime

class SimpleAPITester:
    def __init__(self, base_url="https://auth-foundation-1.preview.emergentagent.com/api"):
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
    
    # Find TechData company
    techdata_company = None
    for company in companies:
        if 'TechData' in company.get('name', ''):
            techdata_company = company
            break
    
    if not techdata_company:
        print("❌ TechData company not found")
        return 1
    
    print(f"✅ Found TechData: {techdata_company['name']} - Status: {techdata_company['status']}")
    
    # Test project access
    success, project = tester.test_get_company_project(techdata_company['id'])
    if success and project:
        print(f"✅ TechData has project: {project.get('title', 'Unknown')}")
        print(f"   - Phase: {project.get('phase', 'Unknown')}")
        print(f"   - Incorporation Status: {project.get('incorporation_status', 'Unknown')}")
        print(f"   - Space Name: {project.get('space_name', 'Not set')}")
        print(f"   - Target Role: {project.get('target_role', 'Not set')}")
        print(f"   - Use Case: {project.get('use_case', 'Not set')}")
        print(f"   - RGPD Checked: {project.get('rgpd_checked', False)}")
        
        # Test project update
        update_data = {
            "space_name": "Espacio de Datos Industrial",
            "target_role": "participante",
            "use_case": "Compartir datos de tecnología para optimización",
            "rgpd_checked": True
        }
        
        success, updated_project = tester.test_update_project(techdata_company['id'], update_data)
        if success:
            print("✅ Project updated successfully")
            print(f"   - Checklist: {updated_project.get('incorporation_checklist', {})}")
        else:
            print("❌ Failed to update project")
    else:
        print("❌ TechData project not found or accessible")

    # Test cliente login
    print("\n=== Testing Cliente API Access ===")
    
    cliente_tester = SimpleAPITester()
    success, cliente_response = cliente_tester.test_login("cliente.lead@espaciodatos.com", "cliente123")
    if success:
        print(f"✅ TechData cliente logged in: {cliente_response.get('user', {}).get('name', 'Unknown')}")
        
        # Test dashboard access
        success, dashboard = cliente_tester.run_test(
            "Cliente Dashboard",
            "GET",
            "client/dashboard",
            200
        )
        if success:
            print(f"✅ Cliente dashboard accessible - Status: {dashboard.get('status', 'Unknown')}")
        else:
            print("❌ Cliente dashboard not accessible")
    else:
        print("❌ Cliente login failed")

    # Print results
    print(f"\n📊 Tests passed: {tester.tests_passed + cliente_tester.tests_passed}/{tester.tests_run + cliente_tester.tests_run}")
    return 0 if (tester.tests_passed + cliente_tester.tests_passed) == (tester.tests_run + cliente_tester.tests_run) else 1

if __name__ == "__main__":
    sys.exit(main())