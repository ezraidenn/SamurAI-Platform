# 🚀 Guía de Deployment - UCU Reporta

Esta guía te ayudará a desplegar **UCU Reporta** en producción.

## 📋 Pre-requisitos

- Servidor con Python 3.10+ y Node.js 18+
- Base de datos PostgreSQL o SQLite
- Dominio y certificado SSL (recomendado)
- Acceso SSH al servidor

---

## 🔧 Opción 1: Deployment en VPS (Linux)

### 1. Preparar el Servidor

```bash
# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar dependencias
sudo apt install python3-pip python3-venv nginx nodejs npm git -y

# Instalar PM2 (gestor de procesos)
sudo npm install -g pm2
```

### 2. Clonar el Repositorio

```bash
cd /var/www
sudo git clone <tu-repositorio> ucureporta
cd ucureporta
```

### 3. Configurar Backend

```bash
cd backend

# Crear entorno virtual
python3 -m venv venv
source venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt

# Crear variable de entorno
cat > .env << EOF
DATABASE_URL=sqlite:///./database/ucudigital.db
SECRET_KEY=$(openssl rand -hex 32)
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080
UPLOAD_DIR=./static/uploads
EOF

# Crear directorios necesarios
mkdir -p database static/uploads

# Iniciar con PM2
pm2 start "uvicorn backend.main:app --host 0.0.0.0 --port 8000" --name ucureporta-api
pm2 save
pm2 startup
```

### 4. Configurar Frontend

```bash
cd ../frontend

# Crear archivo de entorno
cat > .env << EOF
VITE_API_URL=https://api.tudominio.com
EOF

# Instalar dependencias
npm install

# Build para producción
npm run build

# Los archivos estáticos están en: dist/
```

### 5. Configurar Nginx

```bash
sudo nano /etc/nginx/sites-available/ucureporta
```

Contenido del archivo:

```nginx
# Backend API
server {
    listen 80;
    server_name api.tudominio.com;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /static {
        alias /var/www/ucureporta/backend/static;
    }
}

# Frontend
server {
    listen 80;
    server_name tudominio.com www.tudominio.com;

    root /var/www/ucureporta/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /assets {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

Activar configuración:

```bash
sudo ln -s /etc/nginx/sites-available/ucureporta /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 6. Configurar SSL con Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx -y

# Obtener certificados
sudo certbot --nginx -d tudominio.com -d www.tudominio.com -d api.tudominio.com

# Auto-renovación
sudo certbot renew --dry-run
```

### 7. Configurar Firewall

```bash
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
sudo ufw enable
```

---

## ☁️ Opción 2: Deployment en Heroku

### Backend en Heroku

1. **Crear Procfile**:
```bash
cd backend
cat > Procfile << EOF
web: uvicorn backend.main:app --host 0.0.0.0 --port \$PORT
EOF
```

2. **Crear runtime.txt**:
```bash
echo "python-3.10.12" > runtime.txt
```

3. **Deploy**:
```bash
heroku login
heroku create ucureporta-api

# Variables de entorno
heroku config:set SECRET_KEY=$(openssl rand -hex 32)
heroku config:set ALGORITHM=HS256
heroku config:set ACCESS_TOKEN_EXPIRE_MINUTES=10080

# Deploy
git subtree push --prefix backend heroku main

# Ver logs
heroku logs --tail
```

### Frontend en Vercel

1. **Instalar Vercel CLI**:
```bash
npm install -g vercel
```

2. **Deploy**:
```bash
cd frontend
vercel

# Configurar variables de entorno en el dashboard
# VITE_API_URL=https://ucureporta-api.herokuapp.com
```

3. **Configuración `vercel.json`**:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

---

## 🐳 Opción 3: Docker

### 1. Dockerfile Backend

```dockerfile
# backend/Dockerfile
FROM python:3.10-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN mkdir -p database static/uploads

EXPOSE 8000

CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### 2. Dockerfile Frontend

```dockerfile
# frontend/Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### 3. Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=sqlite:///./database/ucudigital.db
      - SECRET_KEY=${SECRET_KEY}
    volumes:
      - ./backend/database:/app/database
      - ./backend/static:/app/static

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend
    environment:
      - VITE_API_URL=http://backend:8000
```

### 4. Ejecutar con Docker

```bash
# Build y ejecutar
docker-compose up -d

# Ver logs
docker-compose logs -f

# Detener
docker-compose down
```

---

## 🔒 Seguridad en Producción

### 1. Variables de Entorno

**Backend `.env`**:
```bash
SECRET_KEY=<genera-uno-fuerte>
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080
DATABASE_URL=postgresql://user:pass@host:5432/dbname  # Si usas PostgreSQL
UPLOAD_DIR=./static/uploads
ALLOWED_ORIGINS=https://tudominio.com,https://www.tudominio.com
```

**Frontend `.env`**:
```bash
VITE_API_URL=https://api.tudominio.com
```

### 2. Configurar CORS

En `backend/main.py`:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://tudominio.com",
        "https://www.tudominio.com"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### 3. Rate Limiting

Instalar:
```bash
pip install slowapi
```

Agregar en `backend/main.py`:
```python
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# En los endpoints
@router.post("/register")
@limiter.limit("5/minute")
async def register(...):
    ...
```

### 4. Headers de Seguridad

En Nginx:
```nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "no-referrer-when-downgrade" always;
add_header Content-Security-Policy "default-src 'self' https:; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';" always;
```

---

## 📊 Monitoreo

### 1. Logs del Backend

```bash
# Ver logs de PM2
pm2 logs ucureporta-api

# Ver logs en tiempo real
pm2 logs ucureporta-api --lines 100

# Reiniciar si hay problemas
pm2 restart ucureporta-api
```

### 2. Monitoreo de Rendimiento

```bash
# Instalar PM2 Plus para monitoreo
pm2 install pm2-logrotate

# Ver status
pm2 status
pm2 monit
```

### 3. Backups de Base de Datos

```bash
#!/bin/bash
# backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/ucureporta"
mkdir -p $BACKUP_DIR

# Backup SQLite
cp /var/www/ucureporta/backend/database/ucudigital.db \
   $BACKUP_DIR/ucudigital_$DATE.db

# Mantener solo últimos 7 días
find $BACKUP_DIR -name "*.db" -mtime +7 -delete

echo "Backup completado: $DATE"
```

Automatizar con cron:
```bash
crontab -e
# Agregar:
0 2 * * * /path/to/backup.sh
```

---

## 🧪 Testing en Producción

### 1. Health Checks

Crear endpoint de salud en backend:

```python
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat()
    }
```

### 2. Smoke Tests

```bash
# Test backend
curl https://api.tudominio.com/health

# Test frontend
curl -I https://tudominio.com

# Test login
curl -X POST https://api.tudominio.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}'
```

---

## 🔄 CI/CD con GitHub Actions

Crear `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Deploy to server
      uses: appleboy/ssh-action@master
      with:
        host: ${{ secrets.SERVER_HOST }}
        username: ${{ secrets.SERVER_USER }}
        key: ${{ secrets.SSH_KEY }}
        script: |
          cd /var/www/ucureporta
          git pull origin main
          
          # Backend
          source backend/venv/bin/activate
          pip install -r backend/requirements.txt
          pm2 restart ucureporta-api
          
          # Frontend
          cd frontend
          npm install
          npm run build
          
          # Restart Nginx
          sudo systemctl reload nginx
```

---

## 📝 Checklist de Deployment

- [ ] Backend configurado con variables de entorno seguras
- [ ] Frontend build con API URL correcta
- [ ] SSL configurado (HTTPS)
- [ ] CORS configurado correctamente
- [ ] Base de datos con backups automáticos
- [ ] PM2/Docker configurado para auto-restart
- [ ] Firewall configurado
- [ ] Nginx configurado con headers de seguridad
- [ ] Logs rotando automáticamente
- [ ] Monitoreo configurado
- [ ] Health checks funcionando
- [ ] CI/CD configurado (opcional)

---

## 🆘 Troubleshooting

### Backend no inicia

```bash
# Ver logs
pm2 logs ucureporta-api --err

# Verificar puerto
sudo netstat -tulpn | grep 8000

# Reiniciar
pm2 restart ucureporta-api
```

### Frontend muestra página en blanco

```bash
# Verificar build
cd frontend
npm run build

# Verificar nginx
sudo nginx -t
sudo tail -f /var/log/nginx/error.log
```

### Problemas de CORS

- Verificar que `VITE_API_URL` esté correcto
- Verificar `allow_origins` en backend
- Verificar que el dominio tenga SSL (HTTPS)

### Base de datos corrupta

```bash
# Restaurar desde backup
cp /var/backups/ucureporta/ucudigital_<fecha>.db \
   /var/www/ucureporta/backend/database/ucudigital.db
```

---

## 📞 Soporte

Para problemas de deployment, contactar a:
- Email: soporte@ucureporta.gob.mx
- Documentación: https://docs.ucureporta.gob.mx

---

¡Tu plataforma está lista para producción! 🎉
