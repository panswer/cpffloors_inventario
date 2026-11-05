# Store App (Front-end & Backend API)

Aplicación web full-stack construida con **Next.js (App Router)** y **React 19**, orientada a la gestión de inventario, clientes, ventas y usuarios para distribución de insumos de restaurantes.

El proyecto implementa la metodología **Atomic Design** para sus componentes de interfaz, integración con **Mongoose** para la persistencia, autenticación sin estado mediante **JWT** en cookies HttpOnly y consumo reactivo con **TanStack React Query** y **Zustand**.

---

## 🏗️ Arquitectura del Proyecto

```text
store-app/
├── app/                      # Next.js App Router (Páginas y Rutas de API)
│   ├── api/                  # Endpoints del backend
│   │   ├── auth/             # Autenticación (/login, /logout, /me)
│   │   ├── users/            # CRUD de usuarios (/api/users, /api/users/[id])
│   │   ├── products/         # CRUD de productos (/api/products, /api/products/[id])
│   │   ├── clients/          # CRUD de clientes (/api/clients, /api/clients/[id])
│   │   └── sales/            # Operaciones de ventas (/api/sales, /api/sales/[id])
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
│   └── templates/            # Layouts estructurales (AuthTemplate, DashboardTemplate)
│
├── hooks/                    # Hooks de React Query (useAuth, useProducts, useClients, useSales, useUsers)
├── lib/                      # Utilidades de servidor (db.ts, auth.ts, authMiddleware.ts, logger.ts)
├── models/                   # Modelos y esquemas de Mongoose (User, Product, Client, Sale)
├── services/                 # Clientes API tipados en TypeScript (userService, productService, etc.)
├── store/                    # Manejador de estado global con Zustand (authStore.ts)
├── types/                    # Tipos y constantes compartidas (product.ts)
└── middleware.ts             # Protección de rutas y redirecciones automáticas por JWT
```

---

## ⚙️ Tecnologías y Librerías Principales

- **Framework**: Next.js 16 (App Router)
- **Librería UI**: React 19 / React DOM 19
- **Estilos**: Tailwind CSS v4 + PostCSS
- **Persistencia**: Mongoose 9 (MongoDB) con Optimistic Concurrency Control (`__v`)
- **Autenticación**: JSON Web Token (`jsonwebtoken`) + Criptografía PBKDF2 nativa de Node.js
- **Gestión de Estado**: Zustand 5
- **Data Fetching y Caché**: TanStack React Query 5
- **Monitoreo**: Logger interno estructurado en JSON Lines para ingesta con Filebeat/Elasticsearch

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
```

---

## 🔐 Variables de Entorno Requeridas

La aplicación lee sus variables desde `store-app.env` (o `.env.local` si se ejecuta fuera de Docker):

| Variable | Descripción | Valor de Ejemplo |
|---|---|---|
| `NODE_ENV` | Entorno de ejecución (`development` o `production`) | `development` |
| `MONGODB_URI` | Cadena de conexión a MongoDB | `mongodb://user:pass@localhost:27017/store_db?authSource=admin` |
| `JWT_SECRET` | Llave secreta para firmar tokens de sesión | `super_secret_jwt_key_cpffloors_2026` |
| `JWT_EXPIRES_IN` | Duración del token de sesión | `7d` |

---

## 🛡️ Seguridad y Control de Concurrencia

1. **Tokens en Cookies `HttpOnly`**: Los JWT de sesión se transmiten exclusivamente mediante cookies protegidas con flags `HttpOnly`, `SameSite=lax` y `Path=/`, impidiendo la lectura indebida por scripts de terceros (XSS).
2. **Middleware de Protección (`middleware.ts`)**: Redirige automáticamente a `/login` a usuarios sin credenciales activas e impide que usuarios logueados accedan nuevamente a la pantalla de login.
3. **Concurrencia Optimista (`versionKey: "__v"`)**: Los productos utilizan control optimista de versiones en Mongoose. Si dos usuarios intentan actualizar o vender el mismo producto con versiones desfasadas, la API rechaza la colisión con error HTTP `409 Conflict`, protegiendo la integridad del stock.
4. **Validación de Roles en Servidor**: Las rutas de API (`/api/users`, etc.) validan que únicamente los administradores puedan crear o elevar roles, y que los gerentes solo puedan gestionar usuarios con rol `user`.

---

## 🧩 Estandarización Atomic Design

Toda la interfaz de usuario se encuentra estructurada siguiendo [ATOMIC_DESIGN.md](./ATOMIC_DESIGN.md):
- **Átomos**: `Button`, `Input`, `Label`, `Badge`.
- **Moléculas**: `FormField`, `SelectField`, `DashboardCard`, `Table` (con paginación integrada).
- **Organismos**: `UsersTable`, `ProductsTable`, `ClientsTable`, `SalesTable` y los respectivos modales.
- **Templates**: `AuthTemplate`, `DashboardTemplate`.
