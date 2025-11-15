"""
Script to start the backend server with configuration from .env
"""
import uvicorn
from backend.config import HOST, PORT

if __name__ == "__main__":
    print(f"\n🚀 Starting UCU Reporta Backend Server...")
    print(f"📍 Server will be available at:")
    print(f"   - http://localhost:{PORT}")
    print(f"   - http://127.0.0.1:{PORT}")
    print(f"   - http://10.186.174.19:{PORT} (network access)\n")
    
    uvicorn.run(
        "backend.main:app",
        host=HOST,
        port=PORT,
        reload=True
    )
