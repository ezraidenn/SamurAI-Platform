"""
Prueba de conexión DIRECTA a Neon (sin usar el backend)
"""
from sqlalchemy import create_engine, text

NEON_URL = "postgresql://neondb_owner:npg_tApuG2hEok1y@ep-long-mountain-a4s09xsm-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

print("=" * 60)
print("PRUEBA DIRECTA DE CONEXIÓN A NEON")
print("=" * 60)

try:
    # Crear engine
    print("\n🔌 Conectando a Neon...")
    engine = create_engine(NEON_URL)
    
    # Probar conexión
    with engine.connect() as conn:
        print("✅ Conexión exitosa a Neon!")
        
        # Verificar tablas
        print("\n📋 Tablas disponibles:")
        result = conn.execute(text("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name
        """))
        
        tables = result.fetchall()
        for table in tables:
            print(f"  - {table[0]}")
        
        # Contar usuarios
        print("\n👥 Usuarios en Neon:")
        result = conn.execute(text("SELECT id, name, email, role FROM users ORDER BY id"))
        users = result.fetchall()
        
        for user in users:
            print(f"  ID: {user[0]} | {user[1]} | {user[2]} | Role: {user[3]}")
        
        print(f"\n✅ Total: {len(users)} usuarios")
        
        # Contar reportes
        print("\n📝 Reportes en Neon:")
        result = conn.execute(text("SELECT COUNT(*) FROM reports"))
        report_count = result.fetchone()[0]
        print(f"  Total: {report_count} reportes")
        
        # Contar strikes
        print("\n⚠️  Strikes en Neon:")
        result = conn.execute(text("SELECT COUNT(*) FROM strikes"))
        strike_count = result.fetchone()[0]
        print(f"  Total: {strike_count} strikes")
        
    print("\n" + "=" * 60)
    print("✅ NEON ESTÁ FUNCIONANDO CORRECTAMENTE")
    print("=" * 60)
    
except Exception as e:
    print(f"\n❌ ERROR: {e}")
    print("\n💡 Posibles causas:")
    print("  1. URL de Neon incorrecta")
    print("  2. Proyecto de Neon pausado")
    print("  3. Sin conexión a internet")
    print("  4. Firewall bloqueando conexión")
