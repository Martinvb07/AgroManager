# AgroManager Backend

Backend en Node.js + Express con estructura modular y lista para extender.

## Requisitos

- Node.js >= 18
- npm o pnpm o yarn

## Configuración

1. Copiar variables de entorno:

```bash
cp .env.example .env
```

En Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

2. Completar `.env` con los datos de tu VPS MySQL:

- `DB_HOST`: IP o dominio del VPS
- `DB_PORT`: 3306 (por defecto)
- `DB_USER`: usuario con permisos sobre `agromanager`
- `DB_PASSWORD`: contraseña del usuario
- `DB_NAME`: nombre de la base (`agromanager` si usaste `db/schema.sql`)
- `CORS_ORIGIN`: URL del Frontend (p.ej. `http://localhost:5173`)

3. Probar conexión a la base de datos:

```powershell
npm run db:test
```

Deberías ver `DB connection: OK`.

## Instalación

```powershell
cd Backend
npm install
```

## Desarrollo

```powershell
npm run dev
```

- Endpoint base: `http://localhost:3001`
- Health checks:
  - `GET /health` (estado del servicio)
  - `GET /health/db` (estado de conexión MySQL)

## Estructura

```
src/
  app.js            # Configuración del Express app
  server.js         # Arranque del servidor HTTP
  config/
    env.js          # Carga de variables de entorno
    db.js           # Placeholder conexión DB
  routes/
    index.js        # Enrutador raíz /api/v1
    health.routes.js
    parcelas.routes.js
  controllers/
    health.controller.js
    parcelas.controller.js
  services/
    parcelas.service.js  # Implementación en memoria por ahora
  middleware/
    asyncHandler.js
    errorHandler.js
    notFound.js
  models/           # Para entidades y esquemas (vacío por ahora)
  utils/            # Utilidades / helpers
```

## Próximos pasos sugeridos

- Elegir base de datos (MongoDB, PostgreSQL, etc.) y completar `config/db.js`.
- Añadir autenticación (JWT) y autorización por roles.
- Validación de datos (p.ej. con Zod o Joi).
- Pruebas con Jest + Supertest.
- CI/CD y despliegue.
