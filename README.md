# Sistema de Inventario y Ventas - CPF Floors (Juliam Corp LLC)

Sistema integral de gestión de inventarios, despachos, clientes y ventas diseñado para la distribución de insumos de restaurantes (contenedores, vasos, cubiertos, servilletas y empaques). Construido sobre **Next.js (App Router)** con **Atomic Design**, **MongoDB en ReplicaSet transaccional (Mongoose)**, control de concurrencia optimista, autenticación JWT en cookies HttpOnly, suite de pruebas unitarias con **Vitest** y monitoreo centralizado de logs y alertas con **Filebeat, Elasticsearch y Grafana**.

---

## 🚀 Requisitos Previos

Para ejecutar la aplicación únicamente se requiere:
- **Docker Desktop** (versión 20+ con soporte para Docker Compose v2).
- **Git** instalado en el sistema.
- **Node.js 20+** (opcional, solo si deseas ejecutar scripts o pruebas locales fuera del contenedor).

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

> ⚠️ **Nota de Seguridad**: Los archivos `.env` reales contienen credenciales y están protegidos por `.gitignore` para no ser subidos al repositorio.

#### Ejemplos de Cadena de Conexión a MongoDB (`MONGODB_URI`):

- **Dentro del contenedor Docker (`store-app.env`):**
  ```env
  MONGODB_URI=mongodb://usuario_ejemplo:password_seguro_ejemplo@store-db:27017/store_db?authSource=admin&replicaSet=rs0&directConnection=true
  ```

- **Desde tu máquina local / Compass / Scripts locales fuera de Docker:**
  ```env
  MONGODB_URI=mongodb://usuario_ejemplo:password_seguro_ejemplo@localhost:27017/store_db?authSource=admin&replicaSet=rs0&directConnection=true
  ```

> 💡 **Parámetros clave de MongoDB:**
> - `authSource=admin`: Especifica la base de datos de autenticación del usuario.
> - `replicaSet=rs0`: Indica el nombre del ReplicaSet requerido para soportar transacciones atómicas.
> - `directConnection=true`: Fuerza la conexión directa al nodo único evitando timeouts por resolución de miembros de la réplica en Docker.

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
| **MongoDB (ReplicaSet `rs0`)** | `localhost:27017` | Base de datos NoSQL transaccional | Definidas en `store-db.env` |
| **Grafana** | [http://localhost:3001](http://localhost:3001) | Tablero de monitoreo, dashboards y alertas | `admin` / `admin` |
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

## 🛡️ Seguridad de Autenticación y Bloqueo de Intentos

- **Generación de Contraseñas y Primer Inicio de Sesión**:
  - Al registrar un nuevo usuario desde el panel de administración, el sistema genera automáticamente una contraseña temporal aleatoria (que también puede ser modificada o re-generada en el acto).
  - Al usuario se le asigna el flag de cambio obligatorio de contraseña (`mustChangePassword: true`). En su primer inicio de sesión, el sistema despliega automáticamente el modal `ChangePasswordModal` para exigirle definir su nueva clave antes de acceder a la plataforma.
- **Límite de 3 Intentos Fallidos**: Si un usuario ingresa una contraseña incorrecta 3 veces consecutivas, su cuenta se bloquea automáticamente para prevenir ataques de fuerza bruta.
- **Respuesta genérica y segura**: Durante los intentos fallidos previos, el sistema responde únicamente `Credenciales inválidas` sin revelar el conteo de intentos ni información interna.
- **Notificación de bloqueo**: Una vez alcanzado el límite de intentos, el sistema responde informando que la cuenta ha sido bloqueada y solicita contactar a un administrador, sin exponer temporizadores ni ventanas de desbloqueo al usuario final.
- **Desbloqueo manual por Administradores y Gerentes**: Desde la vista de gestión de usuarios (`/users`), se muestra el estado `Bloqueado (Intentos)` y se puede reactivar la cuenta editando el usuario y marcando la opción de desbloqueo.

---

## 👥 Matriz de Roles y Permisos

- **Administrador (`admin`)**:
  - Control total sobre usuarios: puede crear, editar y dar de baja usuarios asignando cualquier rol (`admin`, `manager`, `user`).
  - Control de catálogo: crear, editar, dar de baja y realizar carga masiva de productos vía CSV.
  - Registro de ventas, consulta de reportes y anulación de pedidos (con reposición de stock).
- **Gerente / Supervisor (`manager`)**:
  - Administración acotada de personal: solamente puede crear, editar o dar de baja a usuarios con rol `user`.
  - Gestión de inventario de productos y carga masiva CSV.
  - Registro, reportería y anulación de ventas con reposición de stock.
- **Usuario Estándar (`user`)**:
  - Registro de pedidos y ventas con paginación server-side.
  - Consulta de productos y stock disponible.
  - Consulta y registro de clientes.

---

## 📦 Módulos del Sistema

1. **Catálogo de Productos (`/products`)**:
   - Categorías admitidas: `Contenedores`, `Vasos`, `Cubiertos`, `Servilletas` y `Empaques`.
   - Generación automática de SKU según categoría (ej: `CON-XXXXXX`, `VAS-XXXXXX`).
   - Carga masiva de productos mediante archivo CSV (`/api/products/bulk`).
   - **Reporte y Descarga de Stock (`ProductStockReportModal`)**: Consulta analítica de existencias con filtros por categoría, nivel de stock (disponibles, críticos o agotados), valorización monetaria total y exportación a archivo CSV.
   - Control de versiones y concurrencia optimista (`__v` de Mongoose): previene sobreescrituras accidentales entre usuarios simultáneos.
2. **Clientes (`/clients`)**:
   - Directorio de clientes con documento/identificación fiscal único, teléfono, dirección y notas.
   - Soporte para *Soft Delete* (dar de baja sin romper históricos).
3. **Ventas y Despacho (`/sales`)**:
   - Registro de pedidos con carrito interactivo, selección y ajuste de cantidades en tiempo real.
   - Transacciones atómicas en MongoDB (`rs0` con soporte ACID y rollback ante fallos en stock).
   - Listado paginado desde el servidor (paginación server-side con totalizadores).
   - Modal interactivo de detalle de venta bajo demanda (`SaleDetailModal`).
   - Modal de confirmación para anulación de ventas (`CancelSaleModal`) con motivo y reposición de stock.
   - Reportes de ventas con filtros de fecha y exportación a CSV normalizado por producto y cantidades individuales.
4. **Usuarios (`/users`)**:
   - Directorio de colaboradores con asignación de roles y control de estado activo.

---

## 📊 Monitoreo y Observabilidad (Elasticsearch + Filebeat + Grafana)

1. La aplicación escribe eventos estructurados en formato **JSON Lines** en `./logs/app-YYYY-MM-DD.log`.
2. Incluye endpoint y cliente de logging de errores en el navegador (`/api/logs/client`) integrado con un `ErrorBoundary` de React.
3. **Filebeat** monitorea el volumen compartido en tiempo real y reenvía los logs a **Elasticsearch** (índice diario `store-app-logs-YYYY.MM.DD`).
4. En **Grafana** ([http://localhost:3001](http://localhost:3001)):
   - Aprovisionamiento automático de fuente de datos Elasticsearch (`uid: elasticsearch-logs`).
   - Dashboard preconfigurado de inventario y actividad (`inventory_dashboard.json`).
   - Reglas de alertas de stock crítico configuradas (`stock_alerts.yml`).

---

## 🧪 Pruebas Unitarias

La aplicación cuenta con una suite de pruebas unitarias configurada con **Vitest**, **React Testing Library** y entorno **happy-dom**:

```bash
cd store-app
npm test
# o para modo interactivo (watch):
npm run test:watch
```

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
- **Ver logs de la base de datos:**
  ```bash
  docker compose logs -f store-db
  ```
