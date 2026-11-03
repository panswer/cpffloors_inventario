# Arquitectura Atomic Design - store-app

Este proyecto implementa la metodología **Atomic Design** en `store-app/components`:

```
store-app/
├── components/
│   ├── atoms/          # Bloques fundamentales e indivisibles
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Label.tsx
│   │   └── index.ts
│   │
│   ├── molecules/      # Combinaciones simples de átomos
│   │   ├── FormField.tsx
│   │   └── index.ts
│   │
│   ├── organisms/      # Secciones complejas de UI con lógica de negocio
│   │   ├── LoginForm.tsx
│   │   └── index.ts
│   │
│   ├── templates/      # Estructuras de diseño y layouts de vistas
│   │   ├── AuthTemplate.tsx
│   │   └── index.ts
│   │
│   └── index.ts        # Exportaciones generales (opcional)
│
└── app/                # Páginas y rutas de Next.js (App Router)
    └── login/
        └── page.tsx    # Instancia y orquesta los componentes
```

---

## 1. Atoms (`components/atoms`)
Elementos HTML básicos y reutilizables que no se pueden dividir más:
- [`Button`](./components/atoms/Button.tsx): Botón con variantes visuales y estado de carga (`isLoading`).
- [`Input`](./components/atoms/Input.tsx): Input estilizado con soporte de errores y temas dark/light.
- [`Label`](./components/atoms/Label.tsx): Etiqueta con indicador de campo requerido.

## 2. Molecules (`components/molecules`)
Grupos de átomos que funcionan juntos:
- [`FormField`](./components/molecules/FormField.tsx): Une `Label` + `Input` + ícono/botón de acción (ej. ver clave) + mensaje de error.

## 3. Organisms (`components/organisms`)
Componentes más complejos que forman secciones completas:
- [`LoginForm`](./components/organisms/LoginForm.tsx): Contiene múltiples `FormField`, enlaces auxiliares, botón de envío y gestión de estado del formulario.

## 4. Templates (`components/templates`)
Estructuras y layouts que definen la disposición del contenido:
- [`AuthTemplate`](./components/templates/AuthTemplate.tsx): Contenedor centrado para pantallas de autenticación (logo, encabezados y tarjeta contenedora).

## 5. Pages (`app/login/page.tsx`)
Página de Next.js (App Router) que inyecta datos reales, maneja la llamada a APIs y conecta los templates y organismos.
