"""
Mostrar TODOS los datos actuales en Neon
"""
from sqlalchemy import create_engine, text
from datetime import datetime

NEON_URL = "postgresql://neondb_owner:npg_tApuG2hEok1y@ep-long-mountain-a4s09xsm-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require"

print("=" * 80)
print("DATOS ACTUALES EN NEON - " + datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
print("=" * 80)

engine = create_engine(NEON_URL)

with engine.connect() as conn:
    # Usuarios
    print("\n" + "=" * 80)
    print("TABLA: USERS")
    print("=" * 80)
    result = conn.execute(text("""
        SELECT id, name, email, curp, role, strike_count, is_banned, 
               created_at, updated_at
        FROM users 
        ORDER BY id
    """))
    
    users = result.fetchall()
    for user in users:
        print(f"\nID: {user[0]}")
        print(f"  Nombre: {user[1]}")
        print(f"  Email: {user[2]}")
        print(f"  CURP: {user[3]}")
        print(f"  ROL: {user[4]} ⭐")
        print(f"  Strikes: {user[5]}")
        print(f"  Baneado: {'Sí' if user[6] else 'No'}")
        print(f"  Creado: {user[7]}")
        print(f"  Actualizado: {user[8]}")
    
    print(f"\n✅ Total: {len(users)} usuarios")
    
    # Reportes
    print("\n" + "=" * 80)
    print("TABLA: REPORTS")
    print("=" * 80)
    result = conn.execute(text("""
        SELECT id, user_id, category, description, status, priority, created_at
        FROM reports 
        ORDER BY id
        LIMIT 5
    """))
    
    reports = result.fetchall()
    for report in reports:
        print(f"\nID: {report[0]}")
        print(f"  Usuario ID: {report[1]}")
        print(f"  Categoría: {report[2]}")
        print(f"  Descripción: {report[3][:50]}...")
        print(f"  Estado: {report[4]}")
        print(f"  Prioridad: {report[5]}")
        print(f"  Creado: {report[6]}")
    
    result = conn.execute(text("SELECT COUNT(*) FROM reports"))
    total_reports = result.fetchone()[0]
    print(f"\n✅ Total: {total_reports} reportes (mostrando primeros 5)")
    
    # Strikes
    print("\n" + "=" * 80)
    print("TABLA: STRIKES")
    print("=" * 80)
    result = conn.execute(text("""
        SELECT id, user_id, reason, severity, created_at
        FROM strikes 
        ORDER BY id
    """))
    
    strikes = result.fetchall()
    for strike in strikes:
        print(f"\nID: {strike[0]}")
        print(f"  Usuario ID: {strike[1]}")
        print(f"  Razón: {strike[2]}")
        print(f"  Severidad: {strike[3]}")
        print(f"  Creado: {strike[4]}")
    
    print(f"\n✅ Total: {len(strikes)} strikes")

print("\n" + "=" * 80)
print("FIN DEL REPORTE")
print("=" * 80)
print("\n💡 Si estos datos no coinciden con lo que ves en el dashboard de Neon:")
print("   1. Refresca la página del dashboard (F5)")
print("   2. Verifica que estás viendo la tabla correcta")
print("   3. Verifica que no hay filtros aplicados")
print("   4. Verifica que estás en el proyecto correcto")
