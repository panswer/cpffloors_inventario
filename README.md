# Sistema de Inventario y Ventas - CPF Floors (Juliam Corp LLC)

Sistema integral de gestión de inventarios, despachos, clientes y ventas diseñado para la distribución de insumos de restaurantes (contenedores, vasos, cubiertos, servilletas y empaques). Construido sobre **Next.js (App Router)** con **Atomic Design**, **MongoDB con Mongoose**, control de concurrencia optimista, autenticación JWT en cookies HttpOnly y monitoreo de logs con **Filebeat, Elasticsearch y Grafana**.

---

## 🚀 Requisitos Previos

Para ejecutar la aplicación únicamente se requiere:
- **Docker Desktop** (versión 20+ con soporte para Docker Compose v2).
- **Git** instalado en el sistema.
- **Node.js 20+** (opcional, solo si deseas ejecutar scripts o desarrollo local fuera del contenedor).

---

## 🛠️ Configuración Inicial y Puesta en Marcha

### 1. Clonar el repositorio
```bash
git clone <URL_DEL_REPOSITORIO>
cd inventario_cpffloors
```

### 2. Configurar las variables de entorno
Copia los archivos `.env.example` para generar los archivos de entorno reales:

**En Linux / macOS:**
```bash
cp store-app.env.example store-app.env
cp store-db.env.example store-db.env
cp elasticsearch.env.example elasticsearch.env
cp grafana.env.example grafana.env
```

**En Windows (PowerShell):**
```powershell
Copy-Item store-app.env.example store-app.env
Copy-Item store-db.env.example store-db.env
Copy-Item elasticsearch.env.example elasticsearch.env
Copy-Item grafana.env.example grafana.env
```

> ⚠️ **Nota de Seguridad**: Los archivos `.env` reales contienen credenciales y están protegidos por el `.gitignore` para no ser subidos al repositorio.

### 3. Levantar la plataforma con Docker Compose
Construye y levanta todos los contenedores en segundo plano:
```bash
docker compose up -d --build
```

---

## 🌐 Servicios Disponibles

| Servicio | URL Local | Descripción | Credenciales por Defecto |
|---|---|---|---|
| **Store App (Frontend/API)** | [http://localhost:3000](http://localhost:3000) | Plataforma de inventario, ventas y usuarios | Autocreado en primer login: `admin` / clave deseada |
| **MongoDB** | `localhost:27017` | Base de datos NoSQL principal | Definidas en `store-db.env` |
| **Grafana** | [http://localhost:3001](http://localhost:3001) | Tablero de monitoreo y visualización de logs | `admin` / `admin` |
| **Elasticsearch** | [http://localhost:9200](http://localhost:9200) | Almacenamiento e indexación de logs | Modo single-node |

---

## 🔑 Primer Inicio de Sesión (Bootstrap Admin)

Al iniciar el sistema por primera vez con la base de datos vacía:
1. Dirígete a [http://localhost:3000/login](http://localhost:3000/login).
2. Ingresa con:
   - **Usuario:** `admin`
   - **Contraseña:** la contraseña que desees (mínimo 6 caracteres).
3. El sistema detectará automáticamente que es el primer arranque y registrará tu usuario como **Administrador principal**.

---

## 👥 Matriz de Roles y Permisos

- **Administrador (`admin`)**:
  - Control total sobre usuarios: puede crear, editar y dar de baja usuarios asignando cualquier rol (`admin`, `manager`, `user`).
  - Control de catálogo: crear, editar y dar de baja productos.
  - Registro de ventas y anulación de pedidos (con reposición de stock).
- **Gerente / Supervisor (`manager`)**:
  - Administración acotada de personal: solamente puede crear, editar o dar de baja a usuarios con rol `user`.
  - Gestión de inventario de productos.
  - Anulación de ventas y reposición de stock.
- **Usuario Estándar (`user`)**:
  - Registro de pedidos y ventas.
  - Consulta de productos y stock disponible.
  - Consulta y registro de clientes.

---

## 📦 Módulos del Sistema

1. **Catálogo de Productos (`/products`)**:
   - Categorías admitidas: `Contenedores`, `Vasos`, `Cubiertos`, `Servilletas` y `Empaques`.
   - Generación automática de SKU según categoría (ej: `CON-XXXXXX`, `VAS-XXXXXX`).
   - Control de versiones y concurrencia optimista (`__v` de Mongoose): previene sobreescrituras accidentales entre usuarios simultáneos.
2. **Clientes (`/clients`)**:
   - Directorio de clientes con documento/identificación fiscal único, teléfono, dirección y notas.
   - Soporte para *Soft Delete* (dar de baja sin romper históricos).
3. **Ventas y Despacho (`/sales`)**:
   - Registro de pedidos con carrito interactivo y validación de stock disponible.
   - Datos de despacho: a quién se le entrega y dirección exacta de entrega.
   - Opción para registrar clientes nuevos al vuelo directamente dentro del pedido (se persisten solo si se confirma la venta).
   - Anulación de pedidos con devolución automática del stock al inventario.
4. **Usuarios (`/users`)**:
   - Directorio de colaboradores con asignación de roles y control de estado activo.

---

## 📊 Monitoreo y Observabilidad (Elasticsearch + Filebeat + Grafana)

1. La aplicación escribe eventos estructurados en formato **JSON Lines** en `./logs/app-YYYY-MM-DD.log`.
2. **Filebeat** monitorea el volumen compartido en tiempo real y reenvía los logs a **Elasticsearch**.
3. En **Grafana** ([http://localhost:3001](http://localhost:3001)):
   - Inicia sesión con `admin` / `admin`.
   - Ve a **Explore** y selecciona el datasource por defecto **Elasticsearch** para consultar eventos por nivel (`INFO`, `WARN`, `ERROR`), número de venta o usuario.

---

## 🛑 Detener o Reiniciar el Entorno

- **Detener servicios:**
  ```bash
  docker compose down
  ```
- **Detener y eliminar volúmenes de base de datos (reinicio limpio):**
  ```bash
  docker compose down -v
  ```
- **Ver logs de la aplicación:**
  ```bash
  docker compose logs -f store-app
  ```
