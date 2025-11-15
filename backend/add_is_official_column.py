"""
Add is_official column to points_of_interest table
"""
from sqlalchemy import create_engine, text
from config import DATABASE_URL

def add_is_official_column():
    """Agregar columna is_official a la tabla points_of_interest"""
    print("=" * 60)
    print("🔧 ADDING is_official COLUMN")
    print("=" * 60)
    
    engine = create_engine(DATABASE_URL)
    
    try:
        with engine.connect() as conn:
            # Verificar si la columna ya existe
            result = conn.execute(text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name='points_of_interest' 
                AND column_name='is_official'
            """))
            
            if result.fetchone():
                print("\n✅ La columna 'is_official' ya existe")
                return
            
            # Agregar columna
            conn.execute(text("""
                ALTER TABLE points_of_interest 
                ADD COLUMN is_official BOOLEAN DEFAULT FALSE NOT NULL
            """))
            
            # Crear índice
            conn.execute(text("""
                CREATE INDEX IF NOT EXISTS ix_points_of_interest_is_official 
                ON points_of_interest(is_official)
            """))
            
            conn.commit()
            
            print("\n✅ Columna 'is_official' agregada exitosamente")
            print("✅ Índice creado")
            print("=" * 60)
            
    except Exception as e:
        print(f"\n❌ Error: {e}")
        print("\nNota: Si usas SQLite, la columna se agregará automáticamente.")
        print("=" * 60)

if __name__ == "__main__":
    add_is_official_column()
