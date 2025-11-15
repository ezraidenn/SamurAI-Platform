"""
Script para migrar datos de SQLite a PostgreSQL (Supabase)

Este script copia todos los datos de la base de datos local SQLite
a la base de datos compartida en Supabase.
"""

import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from backend.models.user import User
from backend.models.report import Report
from backend.models.strike import Strike
from backend.database import Base

# URLs de las bases de datos
SQLITE_URL = "sqlite:///./database/ucudigital.db"
# Conexión a Neon (PostgreSQL)
POSTGRES_URL = "postgresql://neondb_owner:npg_tApuG2hEok1y@ep-long-mountain-a4s09xsm-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

def migrate_data():
    """Migrar todos los datos de SQLite a PostgreSQL"""
    
    print("🔄 Iniciando migración de SQLite a Supabase...")
    print("=" * 60)
    
    # Conectar a SQLite (origen)
    print("\n📂 Conectando a SQLite...")
    sqlite_engine = create_engine(SQLITE_URL)
    SQLiteSession = sessionmaker(bind=sqlite_engine)
    sqlite_session = SQLiteSession()
    
    # Conectar a PostgreSQL (destino)
    print("🌐 Conectando a Supabase (PostgreSQL)...")
    try:
        postgres_engine = create_engine(POSTGRES_URL)
        PostgresSession = sessionmaker(bind=postgres_engine)
        postgres_session = PostgresSession()
        
        # Crear todas las tablas en PostgreSQL
        print("📋 Creando estructura de tablas en Supabase...")
        Base.metadata.create_all(postgres_engine)
        print("✅ Tablas creadas exitosamente")
        
    except Exception as e:
        print(f"❌ Error conectando a Supabase: {e}")
        print("\n💡 Verifica que:")
        print("  1. La URL de Supabase sea correcta")
        print("  2. El proyecto de Supabase esté activo")
        print("  3. Tengas conexión a internet")
        return
    
    try:
        # Migrar usuarios
        print("\n👥 Migrando usuarios...")
        users = sqlite_session.query(User).all()
        for user in users:
            # Verificar si el usuario ya existe
            existing = postgres_session.query(User).filter(User.email == user.email).first()
            if not existing:
                # Crear nuevo usuario sin el ID (PostgreSQL lo generará)
                new_user = User(
                    name=user.name,
                    email=user.email,
                    curp=user.curp,
                    hashed_password=user.hashed_password,
                    role=user.role,
                    strike_count=user.strike_count,
                    is_banned=user.is_banned,
                    ban_until=user.ban_until if hasattr(user, 'ban_until') else None,
                    ban_reason=user.ban_reason,
                    last_strike_at=user.last_strike_at if hasattr(user, 'last_strike_at') else None,
                    created_at=user.created_at,
                    updated_at=user.updated_at
                )
                postgres_session.add(new_user)
        
        postgres_session.commit()
        user_count = postgres_session.query(User).count()
        print(f"✅ {user_count} usuarios migrados")
        
        # Migrar reportes
        print("\n📝 Migrando reportes...")
        reports = sqlite_session.query(Report).all()
        for report in reports:
            # Verificar si el reporte ya existe
            existing = postgres_session.query(Report).filter(Report.id == report.id).first()
            if not existing:
                new_report = Report(
                    user_id=report.user_id,
                    assigned_to=report.assigned_to if hasattr(report, 'assigned_to') else None,
                    category=report.category,
                    description=report.description,
                    latitude=report.latitude,
                    longitude=report.longitude,
                    photo_url=report.photo_url,
                    priority=report.priority,
                    status=report.status,
                    # AI Analysis fields
                    ai_validated=report.ai_validated if hasattr(report, 'ai_validated') else 0,
                    ai_confidence=report.ai_confidence if hasattr(report, 'ai_confidence') else None,
                    ai_suggested_category=report.ai_suggested_category if hasattr(report, 'ai_suggested_category') else None,
                    ai_urgency_level=report.ai_urgency_level if hasattr(report, 'ai_urgency_level') else None,
                    ai_keywords=report.ai_keywords if hasattr(report, 'ai_keywords') else None,
                    ai_reasoning=report.ai_reasoning if hasattr(report, 'ai_reasoning') else None,
                    # AI Image Analysis fields
                    ai_image_valid=report.ai_image_valid if hasattr(report, 'ai_image_valid') else 1,
                    ai_severity_score=report.ai_severity_score if hasattr(report, 'ai_severity_score') else None,
                    ai_observed_details=report.ai_observed_details if hasattr(report, 'ai_observed_details') else None,
                    ai_quantity_assessment=report.ai_quantity_assessment if hasattr(report, 'ai_quantity_assessment') else None,
                    ai_rejection_reason=report.ai_rejection_reason if hasattr(report, 'ai_rejection_reason') else None,
                    created_at=report.created_at,
                    updated_at=report.updated_at
                )
                postgres_session.add(new_report)
        
        postgres_session.commit()
        report_count = postgres_session.query(Report).count()
        print(f"✅ {report_count} reportes migrados")
        
        # Migrar strikes
        print("\n⚠️  Migrando strikes...")
        strikes = sqlite_session.query(Strike).all()
        for strike in strikes:
            existing = postgres_session.query(Strike).filter(Strike.id == strike.id).first()
            if not existing:
                new_strike = Strike(
                    user_id=strike.user_id,
                    reason=strike.reason,
                    severity=strike.severity,
                    content_type=strike.content_type,
                    ai_detection=strike.ai_detection,
                    is_offensive=strike.is_offensive,
                    is_joke=strike.is_joke,
                    is_inappropriate=strike.is_inappropriate,
                    created_at=strike.created_at
                )
                postgres_session.add(new_strike)
        
        postgres_session.commit()
        strike_count = postgres_session.query(Strike).count()
        print(f"✅ {strike_count} strikes migrados")
        
        print("\n" + "=" * 60)
        print("✅ MIGRACIÓN COMPLETADA EXITOSAMENTE")
        print("=" * 60)
        print(f"\n📊 Resumen:")
        print(f"  • Usuarios: {user_count}")
        print(f"  • Reportes: {report_count}")
        print(f"  • Strikes: {strike_count}")
        print(f"\n🌐 Base de datos en Supabase lista para usar")
        print(f"🔗 URL: https://supabase.com/dashboard/project/azwngskuqeafecbqzbco")
        
    except Exception as e:
        print(f"\n❌ Error durante la migración: {e}")
        postgres_session.rollback()
        import traceback
        traceback.print_exc()
    finally:
        sqlite_session.close()
        postgres_session.close()

if __name__ == "__main__":
    print("\n" + "=" * 60)
    print("MIGRACIÓN DE DATOS A SUPABASE")
    print("=" * 60)
    print("\nEste script migrará todos los datos de SQLite a PostgreSQL")
    print("Base de datos destino: Supabase")
    print("\n" + "=" * 60)
    
    response = input("\n¿Deseas continuar? (s/n): ")
    if response.lower() == 's':
        migrate_data()
    else:
        print("\n❌ Migración cancelada")
