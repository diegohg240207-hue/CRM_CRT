# CRM Casa Ruiz — Plataforma Financiera

Sistema CRM empresarial para Casa Ruiz Telmex. Gestión de prospectos, créditos, cobranza y reportes ejecutivos.

## Estructura del repositorio

```
CRM_CRT/                          ← Raíz del repositorio (= backend NestJS)
├── frontend/                     ← Frontend estático (React CDN + Babel)
│   ├── index.html                ←   Entry point
│   ├── api.js                    ←   API client (httpOnly cookies)
│   ├── *.jsx                     ←   Módulos React
│   ├── styles.css
│   ├── assets/
│   └── vercel.json               ←   Config Vercel (static site + security headers)
├── src/                          ← Backend NestJS (TypeScript)
├── prisma/                       ← Schema + migraciones + seed
├── docs/                         ← Documentación y reportes de fases
├── Dockerfile                    ← Build producción Railway
├── start.sh                      ← Entrypoint: migrate → seed → node dist/main
├── .env.example                  ← Variables de entorno requeridas
├── vercel.json                   ← [Legacy] Config Vercel backend (crm-crt-api)
└── docker-compose.yml            ← DB local para desarrollo
```

> **Fuente oficial**: Este repositorio es la única fuente de verdad. No editar en carpetas locales externas.

---

## Stack

| Capa | Tech |
|------|------|
| Frontend | React 18 (CDN) + Babel standalone + CSS custom |
| Backend | NestJS 10 + TypeScript |
| ORM | Prisma 5 + PostgreSQL |
| Auth | JWT httpOnly cookies + Refresh tokens + RBAC |
| Deploy Frontend | Vercel (static, rootDirectory=`frontend`) |
| Deploy Backend | Railway (Docker, raíz del repo) |
| DB Producción | Supabase PostgreSQL |

---

## Cuentas demo

| Email | Password | Rol |
|-------|----------|-----|
| admin@casaruiz.mx | Admin123! | ADMINISTRADOR |
| supervisor@casaruiz.mx | Admin123! | SUPERVISOR |
| crm1@casaruiz.mx | CRM123! | EJECUTIVO_CRM |
| credito1@casaruiz.mx | Cred123! | CREDITO |
| cobranza1@casaruiz.mx | Cred123! | COBRANZA |

---

## URLs de producción

| Servicio | URL |
|----------|-----|
| **Frontend** | https://crm-crt.vercel.app |
| **Backend API** | https://crmcrt-production.up.railway.app/api/v1 |
| **API Docs** | https://crmcrt-production.up.railway.app/api/docs |

---

## Desarrollo local — Frontend

```bash
# 1. Clonar repo
git clone https://github.com/diegohg240207-hue/CRM_CRT.git
cd CRM_CRT

# 2. Servir frontend (no requiere build)
node -e "
const http=require('http'),fs=require('fs'),path=require('path');
const ROOT=path.join(__dirname,'frontend');
http.createServer((req,res)=>{
  let url=req.url.split('?')[0];if(url==='/')url='/index.html';
  const fp=path.join(ROOT,url);
  fs.readFile(fp,(err,d)=>{
    if(err){res.writeHead(404);res.end('Not found');return;}
    res.writeHead(200,{'Content-Type':url.endsWith('.css')?'text/css':'application/javascript','Cache-Control':'no-cache'});
    res.end(d);
  });
}).listen(5500,()=>console.log('http://localhost:5500'));
"

# O usar el server.js de la carpeta local de desarrollo (si existe)
```

Acceder a: `http://localhost:5500`

> El frontend apunta a `https://crmcrt-production.up.railway.app/api/v1` tanto en dev como prod.

---

## Desarrollo local — Backend

```bash
# 1. Variables de entorno
cp .env.example .env
# Editar .env con DATABASE_URL local, JWT_SECRET, etc.

# 2. Base de datos local (Docker)
docker-compose up -d postgres

# 3. Migraciones + seed
npx prisma migrate dev --name init
npx ts-node prisma/seed.ts

# 4. Levantar en modo desarrollo
npm run start:dev
# → http://localhost:3000/api/v1
# → http://localhost:3000/api/docs (Swagger)
```

---

## Flujo de deploy — Frontend (GitHub → Vercel)

```
1. Editar archivos en   frontend/
2. git add frontend/
3. git commit -m "feat: ..."
4. git push origin master
           ↓
5. Vercel detecta push automáticamente
6. Vercel usa rootDirectory = "frontend"
7. Build: ~35ms (static, sin bundler)
8. Deploy: https://crm-crt.vercel.app ✅
```

> Vercel Proyecto: `crm-crt` | Org: `diegohg240207-3689s-projects`
> rootDirectory: `frontend` | Rama: `master`

---

## Flujo de deploy — Backend (GitHub → Railway)

```
1. Editar archivos en   src/  o  prisma/
2. git add src/ prisma/
3. git commit -m "feat: ..."
4. git push origin master
           ↓
5. Railway detecta push automáticamente
6. Railway ejecuta Dockerfile (build NestJS)
7. start.sh: prisma migrate deploy → seed → node dist/main
8. Deploy: https://crmcrt-production.up.railway.app ✅
```

> Railway Proyecto: `a8f85d51-fc37-4bfb-9617-2845ea92477d`
> Rama: `master` | Dockerfile en raíz del repo

---

## Variables de entorno (producción)

```env
# .env (NO commitear — ver .env.example)
DATABASE_URL=postgresql://...supabase.co:5432/postgres
JWT_SECRET=<min 32 chars>
JWT_REFRESH_SECRET=<min 32 chars>
FRONTEND_URL=https://crm-crt.vercel.app
NODE_ENV=production
```

---

## Módulos backend

| Módulo | Endpoints |
|--------|-----------|
| Auth | POST /auth/login, /auth/logout, /auth/refresh, GET /auth/profile |
| Usuarios | CRUD /usuarios + PATCH /toggle-active |
| Sucursales | CRUD /sucursales |
| Prospectos | CRUD /prospectos + Kanban + interacciones |
| Clientes | CRUD /clientes + PATCH /linea |
| Créditos | CRUD /creditos + GET /kpis + GET /export |
| Scoring | POST /scoring/evaluar + GET /reglas + historial |
| Cobranza | GET /cobranza + KPIs + timeline + POST /accion |
| Reportes | Dashboard + originación + riesgo + ejecutivos |

---

## Docs

Ver carpeta `docs/` para:
- `AUDIT_REPORT.md` — Auditoría completa del sistema
- Reportes de fases de desarrollo

---

## Build marker actual

`CRM_CRT_DEPLOY_CHECK_20260526_1200` — verificable en consola del navegador (`window.CRM_BUILD`)
