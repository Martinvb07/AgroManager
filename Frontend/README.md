<div align="center">

# AgroManager Pro — Frontend

**Interfaz web de gestión agrícola construida con React 19 + Vite**

[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-7.2-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.1-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![React Router](https://img.shields.io/badge/React_Router-7.11-CA4245?style=for-the-badge&logo=reactrouter&logoColor=white)](https://reactrouter.com/)

</div>

---

## Descripción

SPA (Single Page Application) que consume la API REST del Backend de AgroManager. Provee el dashboard administrativo, el panel del propietario, una landing page pública y un asistente de IA flotante (AgroBot).

---

## Stack

| Paquete | Versión | Uso |
|---------|---------|-----|
| `react` + `react-dom` | 19.2 | UI framework |
| `react-router-dom` | 7.11 | Routing del lado del cliente |
| `tailwindcss` | 4.1 | Estilos utilitarios |
| `lucide-react` | 0.553 | Librería de iconos |
| `jspdf` | 2.5 | Exportación de remisiones en PDF |
| `sweetalert2` | 11.15 | Modales y alertas de confirmación |
| `vite` + `@vitejs/plugin-react-swc` | 7.2 / 4.2 | Build tool con Fast Refresh via SWC |

---

## Estructura de carpetas

```
Frontend/
├── public/
│   ├── Logo AgroManager.png        # Logotipo principal
│   └── hero/                       # Imágenes del carrusel (Landing)
│       ├── AgroManager1.png
│       ├── AgroManager2.png
│       └── AgroManager3.png
│
└── src/
    ├── App.jsx                     # Definición de rutas
    ├── main.jsx                    # Entry point React DOM
    │
    ├── views/                      # Páginas completas
    │   ├── Landing.jsx             # Homepage pública
    │   ├── Login.jsx               # Autenticación
    │   ├── CropManagementDashboard.jsx  # Panel admin (~2000 líneas)
    │   ├── CampanaDetail.jsx       # Detalle de campaña + diario + remisiones
    │   ├── OwnerDashboard.jsx      # Panel del propietario
    │   └── Cambios.jsx             # Página pública de changelog
    │
    ├── components/
    │   ├── ChatBot.jsx             # Chatbot flotante (FAB)
    │   ├── TractorLoader.jsx       # Animación de carga
    │   └── sections/              # Secciones del dashboard
    │       ├── Navigation.jsx
    │       ├── DashboardOverview.jsx
    │       ├── AiAssistantCard.jsx
    │       ├── ParcelasGrid.jsx
    │       ├── TrabajadoresTable.jsx
    │       ├── FinanzasView.jsx
    │       ├── MaquinariaGrid.jsx
    │       ├── CampanasTable.jsx
    │       ├── SemillasTable.jsx
    │       ├── PlagasGrid.jsx
    │       ├── RiegoTable.jsx
    │       ├── FertilizantesTable.jsx
    │       └── ReportesGrid.jsx
    │
    ├── services/
    │   ├── api.js                  # Cliente HTTP con todas las llamadas a la API
    │   └── mockData.js             # Datos de prueba / fallback
    │
    └── styles/                    # CSS por página/componente
        ├── index.css
        ├── admin.css
        ├── Landing.css
        ├── Login.css
        ├── OwnerDashboard.css
        ├── Cambios.css
        ├── ChatBot.css
        └── TractorLoader.css
```

---

## Rutas

| Ruta | Componente | Acceso | Descripción |
|------|-----------|--------|-------------|
| `/` | `Landing` | Público | Homepage con carrusel, features y changelog |
| `/login` | `Login` | Público | Formulario de autenticación |
| `/admin` | `CropManagementDashboard` | Admin | Panel principal con todos los módulos |
| `/admin/campanas/:id` | `CampanaDetail` | Admin | Detalle de campaña, diario y remisiones |
| `/owner` | `OwnerDashboard` | Owner | Gestión de usuarios y publicación de novedades |
| `/cambios` | `Cambios` | Público | Historial de cambios filtrable |

El rol del usuario (obtenido en login) determina la redirección: `owner` → `/owner`, cualquier otro → `/admin`.

---

## Vistas en detalle

### Landing
- Carrusel hero automático (3 slides, 4.5 s)
- 8 tarjetas de funcionalidades
- Estadísticas del producto
- Banner con los últimos cambios del sistema
- Menú hamburguesa responsive

### Login
- Formulario email + contraseña
- Animación TractorLoader durante la autenticación
- Redirección basada en rol tras login exitoso

### CropManagementDashboard
Dashboard central con 11 secciones accesibles desde el sidebar:

| # | Sección | Qué muestra |
|---|---------|-------------|
| 1 | Dashboard | KPIs, alertas, últimas transacciones, AgroBot |
| 2 | Parcelas | Grid de lotes con estado, cultivo e inversión |
| 3 | Trabajadores | Tabla de personal con liquidación de nómina |
| 4 | Finanzas | Ingresos y egresos con totales mensuales |
| 5 | Maquinaria | Inventario de equipos y mantenimientos |
| 6 | Campañas | Listado de campañas con acceso al detalle |
| 7 | Semillas | Inventario de semillas por tipo y proveedor |
| 8 | Plagas | Registro de incidentes con severidad y tratamiento |
| 9 | Riego | Turnos de riego y consumo de agua |
| 10 | Fertilizantes | Aplicaciones por parcela y costo |
| 11 | Reportes | Vista de reportes (en desarrollo) |

### CampanaDetail
- Resumen financiero y productivo de la campaña
- **Diario de cosecha**: CRUD de registros diarios (fecha, hectáreas, bultos)
- **Remisiones**: Formulario de despacho con info del conductor, vehículo, ruta, carga y fletes
- Firma digital de conductor y propietario en canvas
- Exportación a PDF con jsPDF

### OwnerDashboard
- Registro y listado de usuarios del sistema
- Publicación de novedades, mejoras y correcciones en el changelog

### Cambios
- Feed filtrable por tipo: Todo / Novedad / Mejora / Corrección

---

## Componentes reutilizables

### `ChatBot.jsx`
Botón flotante (FAB) en la esquina inferior derecha que abre una ventana de chat con AgroBot. Mantiene historial de conversación. Envía mensajes con `Enter`, nueva línea con `Shift+Enter`.

### `TractorLoader.jsx`
Overlay de carga con animación de tractor cruzando la pantalla. Acepta `message`, `visible` y `onFinish` (callback al cerrar).

### `AiAssistantCard.jsx`
Chat embebido dentro del dashboard (no flotante). Misma lógica que `ChatBot` pero en línea con el layout.

### `Navigation.jsx`
Sidebar con 11 botones de sección. Recibe `activeSection` y `setActiveSection` como props.

---

## Servicio API (`services/api.js`)

Cliente HTTP centralizado. Detecta el entorno automáticamente:
- **Desarrollo:** `http://localhost:3001/api/v1`
- **Producción:** `https://agromanager.pro/api`
- **Override manual:** variable de entorno `VITE_API_BASE_URL`

Inyecta el token JWT desde `localStorage` en cada petición. Todas las funciones son async y lanzan error en respuestas no-OK.

**Módulos disponibles:**

| Módulo | Funciones |
|--------|-----------|
| Auth | `login` |
| Parcelas | `fetchParcelas`, `crearParcela`, `actualizarParcela`, `eliminarParcela` |
| Trabajadores | `fetchTrabajadores`, `crearTrabajador`, `actualizarTrabajador`, `eliminarTrabajador` |
| Finanzas | `fetchFinanzas`, `crearIngreso`, `crearEgreso` |
| Maquinaria | `fetchMaquinaria`, `crearMaquinaria`, `actualizarMaquinaria`, `eliminarMaquinaria` |
| Campañas | `fetchCampanas`, `fetchCampana`, `crearCampana`, `actualizarCampana`, `eliminarCampana` |
| Diario | `fetchCampanaDiario`, `crearCampanaDia`, `actualizarCampanaDia`, `eliminarCampanaDia` |
| Remisiones | `fetchRemisiones`, `crearRemision`, `actualizarRemision`, `eliminarRemision` |
| Semillas | `fetchSemillas`, `crearSemilla`, `actualizarSemilla`, `eliminarSemilla` |
| Plagas | `fetchPlagas`, `crearPlaga`, `actualizarPlaga`, `eliminarPlaga` |
| Riego | `fetchRiego`, `crearRiego`, `actualizarRiego`, `eliminarRiego` |
| Cambios | `fetchCambios`, `crearCambio` |
| IA | `pedirConsejoIA`, `enviarMensajeChat` |
| Usuarios | `fetchUsuarios`, `crearUsuario` |

---

## Convenciones de estilos

- **Tailwind CSS v4** para clases utilitarias en componentes
- **CSS por módulo** en `styles/` para estilos globales o animaciones complejas (ej. TractorLoader)
- **Estilos inline** para valores dinámicos y computados en runtime
- Paleta principal: emerald (activo), slate (fondos), red (alertas), blue (info), amber (advertencias)
