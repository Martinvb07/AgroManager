<div align="center">

# AgroManager Pro — Backend

**API REST para gestión agrícola construida con Node.js + Express + MySQL**

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.19-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MySQL](https://img.shields.io/badge/MySQL-8-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![JWT](https://img.shields.io/badge/JWT-Auth-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)](https://jwt.io/)

</div>

---

## Descripción

API REST modular con arquitectura de capas (Routes → Controllers → Services → DB). Soporta multi-tenancy por `usuario_id`, autenticación JWT con roles, y un servicio de IA configurable (heurístico, OpenAI o Anthropic).

**Base URL:** `http://localhost:3001` (desarrollo) / `https://agromanager.pro` (producción)  
**Prefijos de ruta:** `/api/v1/...` y `/...` (para reverse proxy Nginx)

---

## Stack

| Paquete | Versión | Uso |
|---------|---------|-----|
| `express` | 4.19 | Framework HTTP |
| `mysql2` | 3.9 | Driver MySQL con soporte Promises |
| `jsonwebtoken` | 9.0 | Firma y verificación de tokens JWT |
| `bcryptjs` | 2.4 | Hashing de contraseñas |
| `helmet` | 7.1 | Headers de seguridad HTTP |
| `cors` | 2.8 | Control de CORS |
| `morgan` | 1.10 | Logging de requests HTTP |
| `compression` | 1.7 | Compresión gzip de respuestas |
| `dotenv` | 16.4 | Carga de variables de entorno |
| `nodemon` | 3.0 | Auto-reload en desarrollo |

---

## Estructura de carpetas

```
Backend/
├── db/
│   └── schema.sql              # DDL completo: tablas, índices y datos de ejemplo
│
└── src/
    ├── app.js                  # Configuración Express (middleware, rutas, error handler)
    ├── server.js               # Entry point: HTTP server + graceful shutdown
    │
    ├── config/
    │   ├── env.js              # Exporta objeto `env` tipado desde process.env
    │   └── db.js               # Pool de conexiones MySQL (lazy init, singleton)
    │
    ├── middleware/
    │   ├── asyncHandler.js     # Wrapper para capturar errores async automáticamente
    │   ├── errorHandler.js     # Handler global de errores → respuesta JSON
    │   ├── notFound.js         # 404 catch-all
    │   ├── requireAuth.js      # Valida JWT y adjunta `req.user` (id, rol)
    │   └── requireOwner.js     # Verifica que `req.user.rol === 'owner'`
    │
    ├── routes/
    │   ├── index.js            # Agrega todas las rutas bajo /api/v1
    │   ├── health.routes.js
    │   ├── auth.routes.js
    │   ├── parcelas.routes.js
    │   ├── trabajadores.routes.js
    │   ├── finanzas.routes.js
    │   ├── maquinaria.routes.js
    │   ├── semillas.routes.js
    │   ├── plagas.routes.js
    │   ├── riego.routes.js
    │   ├── campanas.routes.js  # Incluye /diario y /remisiones anidados
    │   ├── cambios.routes.js
    │   ├── owner.routes.js
    │   └── ai.routes.js
    │
    ├── controllers/            # Reciben req/res, delegan lógica al servicio
    │   └── [un controller por dominio]
    │
    ├── services/               # Lógica de negocio y queries SQL
    │   ├── ai.service.js       # Motor de IA (heurístico / OpenAI / Anthropic)
    │   └── [un service por dominio]
    │
    ├── data/
    │   └── knowledge.json      # Base de conocimiento agrícola para el modo heurístico
    │
    └── scripts/
        ├── test-db.js          # Verifica conectividad a la base de datos
        └── seed-owner.js       # Crea el usuario owner inicial
```

---

## Endpoints

Todos los endpoints (salvo los marcados como Público) requieren header:
```
Authorization: Bearer <token>
```

### Health
| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| GET | `/health` | Estado del servidor (uptime, env) | Público |
| GET | `/health/db` | Prueba conexión a MySQL | Público |

### Auth
| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| POST | `/auth/login` | Login → devuelve JWT + usuario | Público |

### Parcelas
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/parcelas` | Listar parcelas del usuario |
| POST | `/parcelas` | Crear parcela |
| GET | `/parcelas/:id` | Obtener parcela |
| PUT | `/parcelas/:id` | Actualizar parcela |
| DELETE | `/parcelas/:id` | Eliminar parcela |

### Trabajadores
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/trabajadores` | Listar trabajadores |
| POST | `/trabajadores` | Crear trabajador |
| PUT | `/trabajadores/:id` | Actualizar trabajador |
| DELETE | `/trabajadores/:id` | Eliminar trabajador |

### Finanzas
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/finanzas` | Obtener `{ ingresos, egresos }` del usuario |
| POST | `/finanzas/ingresos` | Registrar ingreso |
| POST | `/finanzas/egresos` | Registrar egreso |

### Maquinaria
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/maquinaria` | Listar maquinaria |
| POST | `/maquinaria` | Crear equipo |
| PUT | `/maquinaria/:id` | Actualizar equipo |
| DELETE | `/maquinaria/:id` | Eliminar equipo |

### Semillas / Plagas / Riego
Mismo patrón CRUD: `GET /`, `POST /`, `PUT /:id`, `DELETE /:id`

### Campañas
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/campanas` | Listar campañas |
| POST | `/campanas` | Crear campaña |
| GET | `/campanas/:id` | Detalle de campaña |
| PUT | `/campanas/:id` | Actualizar campaña |
| DELETE | `/campanas/:id` | Eliminar campaña |
| GET | `/campanas/:id/diario` | Logs diarios (acepta `?desde=&hasta=`) |
| POST | `/campanas/:id/diario` | Agregar entrada al diario |
| PUT | `/campanas/:id/diario/:entryId` | Editar entrada |
| DELETE | `/campanas/:id/diario/:entryId` | Eliminar entrada |
| GET | `/campanas/:id/remisiones` | Listar remisiones |
| POST | `/campanas/:id/remisiones` | Crear remisión |
| PUT | `/campanas/:id/remisiones/:remisionId` | Editar remisión |
| DELETE | `/campanas/:id/remisiones/:remisionId` | Eliminar remisión |

### Cambios (Changelog)
| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/cambios` | Público | Listar cambios (acepta `?limit=N`) |
| POST | `/cambios` | Owner | Publicar novedad/mejora/corrección |

### IA / AgroBot
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/ai/advice` | Obtener recomendación puntual (`{ question, context }`) |
| POST | `/ai/chat` | Chat multi-turno (`{ messages }`) |

### Owner
| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/owner/users` | Owner | Listar todos los usuarios |
| POST | `/owner/users` | Owner | Crear nuevo usuario |

---

## Base de datos

### Tablas

| Tabla | Descripción |
|-------|-------------|
| `usuarios` | Cuentas con rol (`admin` \| `owner`) y estado |
| `parcelas` | Lotes con cultivo, hectáreas, estado e inversión |
| `trabajadores` | Personal con cargo, salario y horas trabajadas |
| `ingresos` | Registros de ventas/cobros ligados opcionalmente a una parcela |
| `egresos` | Gastos con categoría (semillas, mano de obra, reparaciones…) |
| `maquinaria` | Equipos con fechas de último y próximo mantenimiento |
| `semillas` | Inventario de semillas por tipo, proveedor y costo |
| `plagas` | Incidentes con severidad, cultivo afectado y tratamiento |
| `riego` | Turnos de riego por parcela con consumo de agua |
| `fertilizantes` | Aplicaciones por parcela, cantidad y costo |
| `campanas` | Campañas de cosecha con financieros y producción agregada |
| `campanas_diario` | Entradas diarias por campaña (hectáreas cortadas, bultos) |
| `remisiones` | Documentos de despacho con datos de conductor, vehículo y flete |
| `cambios` | Changelog público del sistema |

Todas las tablas transaccionales incluyen `usuario_id` para aislamiento multi-tenant.  
Las tablas `campanas_diario` y `remisiones` usan `ON DELETE CASCADE` sobre `campana_id`.

---

## Servicio de IA (`ai.service.js`)

El servicio soporta tres modos configurables vía `AI_PROVIDER`:

| Modo | Descripción |
|------|-------------|
| `heuristic` | Sin API key externa. Genera recomendaciones basadas en reglas y en `data/knowledge.json`. Consulta Wikipedia para datos adicionales. |
| `openai` | Usa GPT-4o-mini (o el modelo configurado). Envía contexto del campo del usuario como system prompt. |
| `anthropic` | Usa Claude (modelo configurado). Misma estrategia de contexto que OpenAI. |

En todos los modos, el servicio consulta previamente la base de datos para incluir el contexto real de la finca del usuario (parcelas, trabajadores, finanzas, alertas).

---

## Middleware

| Archivo | Función |
|---------|---------|
| `requireAuth.js` | Extrae y verifica el token Bearer. Adjunta `req.user = { id, rol }`. Devuelve 401 si falta o es inválido. |
| `requireOwner.js` | Verifica `req.user.rol === 'owner'`. Devuelve 403 si no cumple. Requiere `requireAuth` antes. |
| `asyncHandler.js` | Envuelve handlers async para propagar errores al `errorHandler` global. |
| `errorHandler.js` | Responde con `{ error, message, details? }` y el status code apropiado (default 500). |
| `notFound.js` | Responde 404 con la ruta solicitada para facilitar el debugging. |

