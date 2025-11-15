"""
Probar diferentes formatos de URL de Neon
"""
from sqlalchemy import create_engine, text

# Diferentes formatos a probar
urls = [
    # Formato 1: Con sslmode
    "postgresql://neondb_owner:npg_tApuG2hEok1y@ep-long-mountain-a4s09xsm-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require",
    
    # Formato 2: Sin channel_binding
    "postgresql://neondb_owner:npg_tApuG2hEok1y@ep-long-mountain-a4s09xsm-pooler.us-east-1.aws.neon.tech:5432/neondb?sslmode=require",
    
    # Formato 3: Puerto 6543 (pooler transaction mode)
    "postgresql://neondb_owner:npg_tApuG2hEok1y@ep-long-mountain-a4s09xsm-pooler.us-east-1.aws.neon.tech:6543/neondb?sslmode=require",
]

for i, url in enumerate(urls, 1):
    print(f"\n{'='*60}")
    print(f"PRUEBA {i}: {url[:80]}...")
    print('='*60)
    
    try:
        engine = create_engine(url)
        with engine.connect() as conn:
            result = conn.execute(text("SELECT COUNT(*) FROM users"))
            count = result.fetchone()[0]
            print(f"✅ ÉXITO: {count} usuarios encontrados")
            print(f"✅ URL CORRECTA: {url}")
            break
    except Exception as e:
        print(f"❌ ERROR: {str(e)[:100]}")

print("\n" + "="*60)
