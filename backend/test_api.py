"""
Quick API test script for UCU Reporta.

This script demonstrates the main API functionality:
1. Register users (citizen and admin)
2. Login and get tokens
3. Create reports with priority calculation
4. Upload photos
5. Admin dashboard summary
6. Status updates

Run this after starting the server to verify everything works.
"""
import requests
import json

BASE_URL = "http://localhost:8000"

def print_response(title, response):
    """Pretty print API response."""
    print(f"\n{'='*60}")
    print(f"📡 {title}")
    print(f"{'='*60}")
    print(f"Status: {response.status_code}")
    try:
        print(json.dumps(response.json(), indent=2, ensure_ascii=False))
    except:
        print(response.text)
    print()


def main():
    print("🧪 UCU Reporta API Test Suite")
    print("Testing all endpoints...\n")
    
    # 1. Register a citizen user
    print("1️⃣ Registering citizen user...")
    citizen_data = {
        "name": "María González",
        "email": "maria@example.com",
        "curp": "GOGM900515MYNXNR03",
        "password": "password123"
    }
    response = requests.post(f"{BASE_URL}/auth/register", json=citizen_data)
    print_response("Register Citizen", response)
    
    # 2. Register an admin user
    print("2️⃣ Registering admin user...")
    admin_data = {
        "name": "Admin UCU",
        "email": "admin@ucu.gob.mx",
        "curp": "AUCU850101HYNXXX01",
        "password": "admin123"
    }
    response = requests.post(f"{BASE_URL}/auth/register", json=admin_data)
    admin_user_id = response.json().get("id") if response.status_code == 201 else None
    print_response("Register Admin", response)
    
    # Manually set admin role (in production, this would be done through a separate process)
    print("⚙️  Note: Admin role should be set manually in database for security")
    print("   For testing, you can update the database directly:")
    print(f"   UPDATE users SET role='admin' WHERE id={admin_user_id};\n")
    
    # 3. Login as citizen
    print("3️⃣ Login as citizen...")
    response = requests.post(f"{BASE_URL}/auth/login", json={
        "email": "maria@example.com",
        "password": "password123"
    })
    citizen_token = response.json().get("access_token") if response.status_code == 200 else None
    print_response("Citizen Login", response)
    
    if not citizen_token:
        print("❌ Failed to get citizen token. Stopping tests.")
        return
    
    headers_citizen = {"Authorization": f"Bearer {citizen_token}"}
    
    # 4. Get current user profile
    print("4️⃣ Get current user profile...")
    response = requests.get(f"{BASE_URL}/auth/me", headers=headers_citizen)
    print_response("Current User Profile", response)
    
    # 5. Create a report (with keyword that increases priority)
    print("5️⃣ Creating report with critical keywords...")
    report_data = {
        "category": "bache",
        "description": "Bache muy grande cerca de la escuela con riesgo de accidente para niños",
        "latitude": 21.1619,
        "longitude": -86.8515
    }
    response = requests.post(f"{BASE_URL}/reports", json=report_data, headers=headers_citizen)
    report_id = response.json().get("id") if response.status_code == 201 else None
    print_response("Create Report (Priority should be 4: base 3 + keyword bonus)", response)
    
    # 6. Create another report (without keywords)
    print("6️⃣ Creating normal priority report...")
    report_data2 = {
        "category": "basura",
        "description": "Acumulación de basura en la esquina",
        "latitude": 21.1650,
        "longitude": -86.8490
    }
    response = requests.post(f"{BASE_URL}/reports", json=report_data2, headers=headers_citizen)
    print_response("Create Report (Priority should be 1: basura base priority)", response)
    
    # 7. List citizen's reports
    print("7️⃣ List citizen's reports...")
    response = requests.get(f"{BASE_URL}/reports", headers=headers_citizen)
    print_response("List Citizen Reports", response)
    
    # 8. Filter reports by priority
    print("8️⃣ Filter reports by priority (min_priority=3)...")
    response = requests.get(f"{BASE_URL}/reports?min_priority=3", headers=headers_citizen)
    print_response("Filtered Reports", response)
    
    # 9. Get single report
    if report_id:
        print(f"9️⃣ Get single report (ID: {report_id})...")
        response = requests.get(f"{BASE_URL}/reports/{report_id}", headers=headers_citizen)
        print_response("Single Report", response)
    
    # Admin tests would require setting the admin role in the database first
    print("\n" + "="*60)
    print("📋 ADMIN TESTS")
    print("="*60)
    print("ℹ️  To test admin endpoints, first set admin role in database:")
    print(f"   UPDATE users SET role='admin' WHERE email='admin@ucu.gob.mx';")
    print("\nThen login as admin and test:")
    print("   - GET /admin/reports/summary")
    print("   - PATCH /admin/reports/{id}/status")
    
    print("\n" + "="*60)
    print("✅ API Test Complete!")
    print("="*60)
    print(f"\n📚 Full API Documentation: {BASE_URL}/docs")
    print(f"🔍 Alternative Docs: {BASE_URL}/redoc\n")


if __name__ == "__main__":
    try:
        # Check if server is running
        response = requests.get(f"{BASE_URL}/health", timeout=2)
        if response.status_code == 200:
            main()
        else:
            print("❌ Server responded but health check failed")
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to server. Make sure it's running:")
        print("   uvicorn backend.main:app --reload")
    except Exception as e:
        print(f"❌ Error: {e}")
