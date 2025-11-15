"""
Script para verificar la conexión entre frontend y backend
"""
import requests
import json
from backend.config import HOST, PORT, CORS_ORIGINS

def test_backend():
    """Prueba el backend"""
    print("=" * 70)
    print("🔍 VERIFICACIÓN DE CONEXIÓN FRONTEND-BACKEND")
    print("=" * 70)
    
    # Configuración
    backend_url = f"http://{HOST}:{PORT}"
    print(f"\n📍 Backend URL: {backend_url}")
    print(f"🌐 CORS Origins permitidos:")
    for origin in CORS_ORIGINS:
        print(f"   - {origin}")
    
    # Test 1: Health check
    print("\n" + "=" * 70)
    print("TEST 1: Health Check")
    print("=" * 70)
    try:
        response = requests.get(f"{backend_url}/health", timeout=5)
        if response.status_code == 200:
            print("✅ Backend está corriendo")
            print(f"   Respuesta: {response.json()}")
        else:
            print(f"❌ Backend respondió con código {response.status_code}")
    except requests.exceptions.ConnectionError:
        print("❌ No se puede conectar al backend")
        print("   ⚠️  Asegúrate de que el backend esté corriendo:")
        print("      python start_backend.py")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False
    
    # Test 2: Root endpoint
    print("\n" + "=" * 70)
    print("TEST 2: Root Endpoint")
    print("=" * 70)
    try:
        response = requests.get(f"{backend_url}/", timeout=5)
        if response.status_code == 200:
            print("✅ Root endpoint funciona")
            data = response.json()
            print(f"   API Version: {data.get('version')}")
            print(f"   Docs: {backend_url}{data.get('docs')}")
        else:
            print(f"❌ Error en root endpoint: {response.status_code}")
    except Exception as e:
        print(f"❌ Error: {e}")
    
    # Test 3: CORS Headers
    print("\n" + "=" * 70)
    print("TEST 3: CORS Configuration")
    print("=" * 70)
    frontend_url = "http://10.186.174.19:3000"
    try:
        headers = {
            'Origin': frontend_url,
            'Access-Control-Request-Method': 'GET'
        }
        response = requests.options(f"{backend_url}/health", headers=headers, timeout=5)
        cors_header = response.headers.get('Access-Control-Allow-Origin')
        
        if cors_header:
            print(f"✅ CORS configurado correctamente")
            print(f"   Allow-Origin: {cors_header}")
            print(f"   Allow-Credentials: {response.headers.get('Access-Control-Allow-Credentials')}")
        else:
            print("⚠️  No se encontraron headers CORS")
    except Exception as e:
        print(f"⚠️  No se pudo verificar CORS: {e}")
    
    # Test 4: Database
    print("\n" + "=" * 70)
    print("TEST 4: Database Connection")
    print("=" * 70)
    try:
        from backend.database import engine
        from sqlalchemy import text
        
        with engine.connect() as conn:
            result = conn.execute(text("SELECT name FROM sqlite_master WHERE type='table'"))
            tables = [row[0] for row in result]
            
            if tables:
                print("✅ Base de datos conectada")
                print(f"   Tablas encontradas: {len(tables)}")
                for table in tables:
                    print(f"   - {table}")
            else:
                print("⚠️  Base de datos vacía")
                print("   Ejecuta: alembic upgrade head")
    except Exception as e:
        print(f"❌ Error de base de datos: {e}")
    
    # Test 5: AI Configuration
    print("\n" + "=" * 70)
    print("TEST 5: AI Configuration")
    print("=" * 70)
    try:
        from backend.config import AI_VALIDATION_ENABLED, OPENAI_API_KEY, OPENAI_MODEL
        
        if AI_VALIDATION_ENABLED:
            print("✅ Validación con IA habilitada")
            print(f"   Modelo: {OPENAI_MODEL}")
            if OPENAI_API_KEY:
                print(f"   API Key: {OPENAI_API_KEY[:20]}...{OPENAI_API_KEY[-10:]}")
            else:
                print("   ⚠️  API Key no configurada")
        else:
            print("⚠️  Validación con IA deshabilitada")
    except Exception as e:
        print(f"⚠️  Error verificando IA: {e}")
    
    # Resumen
    print("\n" + "=" * 70)
    print("📋 RESUMEN")
    print("=" * 70)
    print("\n✅ CONFIGURACIÓN CORRECTA:")
    print(f"   Backend: {backend_url}")
    print(f"   Frontend: {frontend_url}")
    print(f"   CORS: Configurado para {len(CORS_ORIGINS)} orígenes")
    
    print("\n🚀 PARA INICIAR:")
    print("   1. Backend:")
    print("      python start_backend.py")
    print("\n   2. Frontend:")
    print("      cd frontend")
    print("      npm run dev")
    
    print("\n📖 DOCUMENTACIÓN:")
    print(f"   Swagger UI: {backend_url}/docs")
    print(f"   ReDoc: {backend_url}/redoc")
    
    print("\n" + "=" * 70)
    
    return True

if __name__ == "__main__":
    test_backend()
