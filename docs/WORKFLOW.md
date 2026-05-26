# CRM_CRT — Flujo de trabajo oficial

> Última actualización: 2026-05-26

## Fuente oficial

**El repositorio GitHub es la única fuente de verdad.**

```
https://github.com/diegohg240207-hue/CRM_CRT
```

No editar en carpetas locales externas (como `CRM_CRT_PRODUCTION_AUDIT/`).
Todos los cambios van directo al repo, rama `master`.

---

## Estructura de carpetas en el repo

```
CRM_CRT/
├── frontend/      ← Editar aquí para cambios de UI/lógica frontend
├── src/           ← Editar aquí para cambios de API/backend
├── prisma/        ← Editar aquí para cambios de DB/schema
├── docs/          ← Documentación y reportes
└── ...            ← Config raíz (Dockerfile, tsconfig, etc.)
```

---

## Workflow: cambio en frontend

```bash
# 1. Abrir archivo en frontend/
code frontend/app.jsx

# 2. Probar local
node server.js 5500   # si existe server.js en la raíz local de dev

# 3. Commit y push
git add frontend/
git commit -m "feat: descripción del cambio"
git push origin master
# → Vercel auto-deploya en ~30 segundos
```

---

## Workflow: cambio en backend

```bash
# 1. Editar en src/
code src/creditos/creditos.service.ts

# 2. Probar local
npm run start:dev

# 3. Commit y push
git add src/ prisma/
git commit -m "feat: descripción del cambio"
git push origin master
# → Railway auto-deploya (build + migrate + seed)
```

---

## Workflow: cambio en schema de DB

```bash
# 1. Editar prisma/schema.prisma
# 2. Crear migración
npx prisma migrate dev --name nombre_migracion
# 3. Commit (incluyendo migration files)
git add prisma/
git commit -m "db: nueva migración — descripción"
git push origin master
# → Railway ejecuta: prisma migrate deploy automáticamente en start.sh
```

---

## Deploy manual (si auto-deploy falla)

### Frontend
```bash
cd CRM_CRT/
vercel --prod --yes
```

### Backend
```bash
# Railway CLI (si está instalado)
railway up
# O forzar via Railway dashboard → Redeploy
```

---

## Checklist antes de hacer push

- [ ] `git status` — sin archivos sensibles (.env)
- [ ] `git diff` — cambios revisados
- [ ] Cambios en `frontend/` solo afectan Vercel
- [ ] Cambios en `src/` o `prisma/` afectan Railway
- [ ] No commitear `node_modules/`, `dist/`, `.env`

---

## URLs clave

| | URL |
|---|---|
| Repo | https://github.com/diegohg240207-hue/CRM_CRT |
| Frontend prod | https://crm-crt.vercel.app |
| Backend prod | https://crmcrt-production.up.railway.app/api/v1 |
| Vercel Dashboard | https://vercel.com/diegohg240207-3689s-projects/crm-crt |
| Railway Dashboard | https://railway.app/project/a8f85d51-fc37-4bfb-9617-2845ea92477d |
