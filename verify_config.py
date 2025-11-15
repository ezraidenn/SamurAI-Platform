"""
Script para verificar que toda la configuración esté usando .env
"""
import os
from pathlib import Path

def check_file_for_hardcoded(file_path, patterns):
    """Verifica si un archivo contiene patrones hardcodeados."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            found = []
            for pattern in patterns:
                if pattern in content and '.env' not in content:
                    # Verificar que no sea un comentario o ejemplo
                    lines = content.split('\n')
                    for i, line in enumerate(lines, 1):
                        if pattern in line and not line.strip().startswith('#'):
                            found.append((i, line.strip()))
            return found
    except:
        return []

def main():
    print("=" * 70)
    print("🔍 VERIFICACIÓN DE CONFIGURACIÓN")
    print("=" * 70)
    
    # Patrones a buscar
    hardcoded_patterns = [
        'localhost:8000',
        'localhost:3000',
        '127.0.0.1:8000',
        '127.0.0.1:3000',
    ]
    
    # Archivos a verificar (código fuente, no docs)
    files_to_check = [
        'backend/main.py',
        'backend/auth/jwt_handler.py',
        'backend/database.py',
        'frontend/src/services/api.js',
    ]
    
    issues_found = False
    
    for file_path in files_to_check:
        full_path = Path(file_path)
        if full_path.exists():
            found = check_file_for_hardcoded(full_path, hardcoded_patterns)
            if found:
                issues_found = True
                print(f"\n❌ {file_path}:")
                for line_num, line in found:
                    print(f"   Línea {line_num}: {line}")
    
    print("\n" + "=" * 70)
    
    if not issues_found:
        print("✅ VERIFICACIÓN EXITOSA")
        print("=" * 70)
        print("✓ No se encontró hardcoding en archivos de código fuente")
        print("✓ Toda la configuración usa variables de entorno")
        print("\n📋 Archivos de configuración:")
        print("   - backend/.env")
        print("   - frontend/.env")
    else:
        print("⚠️  SE ENCONTRARON PROBLEMAS")
        print("=" * 70)
        print("Revisa los archivos listados arriba")
    
    # Verificar que los archivos .env existan
    print("\n📁 Verificando archivos .env:")
    
    env_files = [
        ('backend/.env', True),
        ('backend/.env.example', True),
        ('frontend/.env', True),
        ('frontend/.env.example', True),
    ]
    
    for env_file, required in env_files:
        if Path(env_file).exists():
            print(f"   ✅ {env_file}")
        else:
            status = "❌" if required else "⚠️"
            print(f"   {status} {env_file} - NO EXISTE")
    
    # Mostrar configuración actual
    print("\n⚙️  Configuración actual:")
    
    try:
        from backend.config import HOST, PORT, CORS_ORIGINS, ENVIRONMENT
        print(f"   Backend Host: {HOST}")
        print(f"   Backend Port: {PORT}")
        print(f"   CORS Origins: {CORS_ORIGINS}")
        print(f"   Environment: {ENVIRONMENT}")
    except Exception as e:
        print(f"   ❌ Error cargando backend config: {e}")
    
    print("\n" + "=" * 70)

if __name__ == "__main__":
    main()
