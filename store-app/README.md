# Store App (Front-end & Backend API)

Aplicación web full-stack construida con **Next.js (App Router)** y **React 19**, orientada a la gestión de inventario, clientes, ventas y usuarios para distribución de insumos de restaurantes.

El proyecto implementa la metodología **Atomic Design** para sus componentes de interfaz, integración con **Mongoose** y transacciones atómicas en MongoDB ReplicaSet, autenticación sin estado mediante **JWT** en cookies HttpOnly, consumo reactivo con **TanStack React Query**, estado con **Zustand**, reportería/carga masiva vía CSV y suite de pruebas unitarias con **Vitest**.

---

## 🏗️ Arquitectura del Proyecto

```text
store-app/
├── app/                      # Next.js App Router (Páginas y Rutas de API)
│   ├── api/                  # Endpoints del backend
│   │   ├── auth/             # Autenticación (/login, /logout, /me)
│   │   ├── users/            # CRUD de usuarios (/api/users, /api/users/[id])
│   │   ├── products/         # CRUD de productos y carga masiva (/api/products, /api/products/bulk)
│   │   ├── clients/          # CRUD de clientes (/api/clients, /api/clients/[id])
│   │   ├── sales/            # Ventas paginadas, reportes y detalle (/api/sales, /api/sales/reports)
│   │   └── logs/             # Logging de errores de cliente del navegador (/api/logs/client)
│   ├── clients/              # Vista de Directorio de Clientes (/clients)
│   ├── login/                # Vista de Inicio de Sesión (/login)
│   ├── products/             # Vista de Catálogo e Inventario (/products)
│   ├── sales/                # Vista de Ventas y Despachos (/sales)
│   ├── users/                # Vista de Administración de Usuarios (/users)
│   ├── layout.tsx            # Root Layout global con Providers
│   └── page.tsx              # Dashboard principal
│
├── components/               # Metodología Atomic Design
│   ├── atoms/                # Botones, Inputs, Labels, Badges
│   ├── molecules/            # FormField, SelectField, DashboardCard, Table
│   ├── organisms/            # Tablas y Modales de gestión (Usuarios, Productos, Clientes, Ventas)
│   │                         # Incluye modales especializados: ProductBulkUploadModal,
│   │                         # SalesReportModal, CancelSaleModal, SaleDetailModal.
│   ├── templates/            # Layouts estructurales (AuthTemplate, DashboardTemplate)
│   └── ErrorBoundary.tsx     # Captura global de errores de cliente y envío a logger
│
├── hooks/                    # Hooks de React Query (useAuth, useProducts, useClients, useSales, useUsers)
├── lib/                      # Utilidades de servidor y cliente (db.ts, auth.ts, logger.ts, clientLogger.ts, csvParser.ts)
├── models/                   # Modelos y esquemas de Mongoose (User, Product, Client, Sale)
├── services/                 # Clientes API tipados en TypeScript (userService, productService, clientService, saleService)
├── store/                    # Manejador de estado global con Zustand (authStore.ts)
├── test/                     # Configuración de pruebas unitarias (setup.ts)
├── types/                    # Tipos y contratos compartidos (product.ts, user.ts, client.ts, sale.ts)
├── vitest.config.ts          # Configuración de Vitest para React con happy-dom
└── middleware.ts             # Protección de rutas y redirecciones automáticas por JWT
```

---

## ⚙️ Tecnologías y Librerías Principales

- **Framework**: Next.js 16 (App Router)
- **Librería UI**: React 19 / React DOM 19
- **Estilos**: Tailwind CSS v4 + PostCSS
- **Persistencia**: Mongoose 9 (MongoDB ReplicaSet con transacciones y `versionKey: "__v"`)
- **Autenticación**: JSON Web Token (`jsonwebtoken`) + Criptografía PBKDF2 nativa de Node.js
- **Gestión de Estado**: Zustand 5
- **Data Fetching y Caché**: TanStack React Query 5
- **Pruebas**: Vitest, React Testing Library y happy-dom
- **Monitoreo**: Logger interno estructurado en JSON Lines (`logger.ts`) y reportería de cliente (`clientLogger.ts`)

---

## 🚀 Scripts Disponibles

Desde la carpeta `store-app`:

```bash
# Iniciar servidor de desarrollo (estándar Turbopack)
npm run dev

# Iniciar servidor de desarrollo con Webpack (recomendado en Docker/WSL2 para polling de volúmenes)
npm run dev:webpack

# Construir aplicación para producción
npm run build

# Iniciar servidor de producción
npm run start

# Ejecutar el linter de código
npm run lint

# Ejecutar pruebas unitarias (Vitest)
npm test

# Ejecutar pruebas unitarias en modo interactivo/watch
npm run test:watch
```

---

## 🔐 Variables de Entorno Requeridas

La aplicación lee sus variables desde `store-app.env` (o `.env.local` si se ejecuta fuera de Docker):

| Variable | Descripción | Valor de Ejemplo |
|---|---|---|
| `NODE_ENV` | Entorno de ejecución (`development` o `production`) | `development` |
| `MONGODB_URI` | Cadena de conexión a MongoDB ReplicaSet | `mongodb://user:pass@store-db:27017/store_db?authSource=admin&replicaSet=rs0&directConnection=true` |
| `JWT_SECRET` | Llave secreta para firmar tokens de sesión | `super_secret_jwt_key_cpffloors_2026` |
| `JWT_EXPIRES_IN` | Duración del token de sesión | `7d` |

---

## 🛡️ Seguridad y Control de Concurrencia

1. **Tokens en Cookies `HttpOnly`**: Los JWT de sesión se transmiten exclusivamente mediante cookies protegidas con flags `HttpOnly`, `SameSite=lax` y `Path=/`, impidiendo la lectura indebida por scripts de terceros (XSS).
2. **Middleware de Protección (`middleware.ts`)**: Redirige automáticamente a `/login` a usuarios sin credenciales activas e impide que usuarios logueados accedan nuevamente a la pantalla de login.
3. **Concurrencia Optimista (`versionKey: "__v"`)**: Los productos utilizan control optimista de versiones en Mongoose. Si dos usuarios intentan actualizar o vender el mismo producto con versiones desfasadas, la API rechaza la colisión con error HTTP `409 Conflict`, protegiendo la integridad del stock.
4. **Transacciones Atómicas y Rollback**: La creación de ventas se procesa dentro de una sesión transaccional de MongoDB (`session.withTransaction()`). Si alguna actualización de stock o persistencia falla, se revierte la operación por completo. Además, cuenta con un fallback compensatorio para entornos que no soporten transacciones.
5. **Validación de Roles en Servidor**: Las rutas de API (`/api/users`, etc.) validan que únicamente los administradores puedan crear o elevar roles, y que los gerentes solo puedan gestionar usuarios con rol `user`.

---

## 🧩 Estandarización Atomic Design

Toda la interfaz de usuario se encuentra estructurada siguiendo [ATOMIC_DESIGN.md](./ATOMIC_DESIGN.md):
- **Átomos**: `Button`, `Input`, `Label`, `Badge`.
- **Moléculas**: `FormField`, `SelectField`, `DashboardCard`, `Table` (con paginación integrada).
- **Organismos**:
  - Tablas: `UsersTable`, `ProductsTable`, `ClientsTable`, `SalesTable`.
  - Modales: `UserFormModal`, `ProductFormModal`, `ProductBulkUploadModal`, `ClientFormModal`, `SaleFormModal`, `SaleDetailModal`, `CancelSaleModal`, `SalesReportModal`.
- **Templates**: `AuthTemplate`, `DashboardTemplate`.
