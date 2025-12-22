# VentaPlus - Sistema de Punto de Venta

Sistema de gestión de ventas e inventario diseñado para reemplazar el registro manual en cuadernos, proporcionando control digital de inventarios, clientes y ventas con reportes en tiempo real.

## 🚀 Características

- **Punto de Venta (POS)**: Registro rápido de ventas con múltiples métodos de pago
- **Ventas a Crédito**: Sistema completo de ventas a crédito con gestión de pagos por cuotas
- **Gestión de Productos**: Control de inventario con alertas de stock bajo
- **Dashboard Administrativo**: Estadísticas y métricas en tiempo real
- **Gestión de Usuarios**: Sistema de roles (Administrador/Vendedor) con permisos diferenciados
- **Historial de Ventas**: Registro completo de todas las transacciones
- **Reportes**: Análisis de ventas y productos más vendidos con exportación a PDF/Excel

## 🛠️ Stack Tecnológico

- **Frontend Framework**: React 18.3.1 con TypeScript
- **Build Tool**: Vite 5.4.19
- **Routing**: React Router DOM 6.30.1
- **State Management**: React Context API + TanStack React Query
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **UI Components**: shadcn/ui (Radix UI)
- **Styling**: Tailwind CSS 3.4.17
- **Forms**: React Hook Form + Zod
- **Icons**: Lucide React
- **Charts**: Recharts
- **Date Handling**: date-fns

## 📋 Requisitos Previos

- Node.js 18+ (recomendado usar [nvm](https://github.com/nvm-sh/nvm))
- npm, yarn, pnpm o bun

## 🏃 Inicio Rápido

### Instalación

```bash
# Clonar el repositorio
git clone <repository-url>
cd ventacontrol-pro

# Instalar dependencias
npm install
# o
yarn install
# o
bun install
```

### Desarrollo

```bash
# Iniciar servidor de desarrollo
npm run dev

# La aplicación estará disponible en http://localhost:8080
```

### Build para Producción

```bash
# Build de producción
npm run build

# Build de desarrollo
npm run build:dev

# Preview del build
npm run preview
```

### Linting

```bash
npm run lint
```

## 🔧 Configuración

### Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto con las siguientes variables:

```env
VITE_SUPABASE_URL=tu_url_de_supabase
VITE_SUPABASE_ANON_KEY=tu_anon_key_de_supabase
```

Estas variables son necesarias para la conexión con Supabase.

### Path Aliases

El proyecto utiliza path aliases configurados en `tsconfig.json`:
- `@/` → `./src/`

## 👤 Usuarios de Prueba

El sistema utiliza autenticación real con Supabase. Los usuarios deben estar creados en Supabase Auth. El sistema busca usuarios por username y requiere que existan en la tabla `usuarios` de la base de datos.

## 📁 Estructura del Proyecto

```
ventacontrol-pro/
├── src/
│   ├── components/        # Componentes reutilizables
│   │   ├── layout/        # Layouts (DashboardLayout, AppSidebar)
│   │   └── ui/            # Componentes shadcn/ui
│   ├── contexts/          # Context API (AuthContext, CartContext)
│   ├── hooks/             # Custom React hooks (useProducts, useSales, etc.)
│   ├── lib/               # Utilidades y helpers (supabase client)
│   ├── pages/             # Páginas principales
│   │   ├── Dashboard.tsx
│   │   ├── Login.tsx
│   │   ├── NewSale.tsx
│   │   ├── SalesHistory.tsx
│   │   ├── Products.tsx
│   │   ├── Categories.tsx
│   │   ├── Reports.tsx
│   │   └── Users.tsx
│   ├── services/         # Servicios de Supabase
│   │   ├── products.service.ts
│   │   ├── sales.service.ts
│   │   ├── categories.service.ts
│   │   ├── users.service.ts
│   │   └── clients.service.ts
│   └── types/             # Definiciones TypeScript
├── public/                # Archivos estáticos
├── documentos/            # Documentación del proyecto
├── package.json
├── vite.config.ts
├── tailwind.config.ts
└── tsconfig.json
```

## 🗺️ Rutas de la Aplicación

- `/login` - Página de autenticación
- `/dashboard` - Panel principal con estadísticas en tiempo real
- `/ventas/nueva` - Registro de nueva venta (POS)
- `/ventas` - Historial de ventas con filtros
- `/creditos` - Gestión de ventas a crédito y pagos
- `/productos` - Gestión de productos (CRUD completo)
- `/categorias` - Gestión de categorías (CRUD completo, solo admin)
- `/reportes` - Reportes y análisis con gráficos
- `/usuarios` - Gestión de usuarios (solo admin)

## 🔐 Roles y Permisos

### Administrador
- Acceso completo al sistema
- Gestión de usuarios, productos y categorías
- Ver todas las ventas
- Generar reportes y exportar a PDF/Excel
- Control de inventario
- Gestionar ventas a crédito
- Eximir intereses de ventas a crédito

### Vendedor
- Registrar ventas (efectivo, QR, transferencia, crédito)
- Registrar ventas a crédito con cliente
- Ver historial de sus ventas
- Ver stock disponible
- Registrar clientes
- Registrar pagos de crédito
- **No puede**: gestionar productos, usuarios, ver reportes generales o eximir intereses

## 📊 Estado Actual del Proyecto

### ✅ Implementado (v2.0)

**Backend y Persistencia:**
- ✅ Integración completa con Supabase (PostgreSQL)
- ✅ Autenticación real con Supabase Auth
- ✅ Persistencia de datos en tiempo real
- ✅ Row Level Security (RLS) configurado
- ✅ Funciones y triggers en base de datos
- ✅ **Corrección de zona horaria**: Todos los campos de fecha se guardan correctamente usando la hora local del cliente, sin desfase por zona horaria

**Funcionalidades Core:**
- ✅ Sistema de autenticación con roles (Supabase Auth)
- ✅ CRUD completo de productos
- ✅ CRUD completo de categorías
- ✅ CRUD completo de usuarios
- ✅ CRUD completo de clientes
- ✅ Registro de ventas con validación de stock
- ✅ Historial de ventas con filtros avanzados
- ✅ Dashboard con estadísticas en tiempo real
- ✅ Reportes con gráficos interactivos (Recharts)
- ✅ Exportación de reportes a PDF y Excel
- ✅ Control de inventario con alertas de stock bajo
- ✅ Anulación de ventas (solo admin)
- ✅ Gestión de carrito de compras
- ✅ Múltiples métodos de pago (efectivo, QR, transferencia, crédito)
- ✅ **Sistema de ventas a crédito:**
  - ✅ Registro de ventas a crédito con cliente
  - ✅ Configuración de cuotas e interés mensual
  - ✅ Cuota inicial opcional
  - ✅ Cálculo automático de interés
  - ✅ Registro de pagos por cuota
  - ✅ Historial de pagos completo
  - ✅ Gestión de estado de crédito
  - ✅ Eximir intereses (solo admin)
- ✅ Gestión de movimientos de inventario
- ✅ Arqueo de caja (apertura y cierre)
- ✅ **Optimizaciones móviles:**
  - ✅ Corrección de layout para pantallas pequeñas (eliminación de pantalla en blanco)
  - ✅ Mejoras de compatibilidad con Android (área táctil aumentada, eventos touch)
  - ✅ Corrección de apertura del menú lateral en móvil
  - ✅ Viewport optimizado para diferentes tamaños de pantalla
  - ✅ Favicon personalizado con logo V+ del sistema
  - ✅ Apple Touch Icon y Web Manifest para PWA
  - ✅ Theme color para personalización en móviles
- ✅ **Mejoras de interfaz:**
  - ✅ Versión del sistema visible en el sidebar
  - ✅ Constantes centralizadas para fácil mantenimiento

**UI/UX:**
- ✅ Diseño responsive (móvil, tablet, desktop)
- ✅ Interfaz moderna con shadcn/ui
- ✅ Validación de formularios (React Hook Form + Zod)
- ✅ Manejo de errores robusto
- ✅ Feedback visual inmediato
- ✅ Animaciones sutiles

### 🔜 Pendiente (v3.0)
- 🔜 Impresión de tickets
- 🔜 Paginación en listados grandes
- 🔜 Testing (unitario, integración, E2E)
- 🔜 Notificaciones push
- 🔜 Historial completo de movimientos de inventario con interfaz mejorada
- 🔜 Sincronización offline
- 🔜 Notificaciones de vencimiento de créditos
- 🔜 Reportes específicos de ventas a crédito

## 🎨 Diseño

El sistema utiliza un diseño moderno tipo dashboard administrativo con:
- Sidebar lateral colapsable
- Tarjetas informativas (stat cards)
- Gráficas y visualizaciones interactivas
- Interfaz limpia y corporativa
- Tema profesional
- **Diseño responsive completo** - Optimizado para móviles, tablets y desktop
- Tablas con diseño consistente y espaciado uniforme
- Componentes adaptativos según tamaño de pantalla
- **Optimizaciones móviles avanzadas:**
  - Layout corregido para pantallas pequeñas (sin pantalla en blanco)
  - Área táctil aumentada para Android (44px mínimo)
  - Eventos touch mejorados para mejor respuesta
  - Viewport optimizado con soporte para `-webkit-fill-available`
  - Favicon personalizado con logo V+ del sistema
  - Soporte PWA con Web Manifest y Apple Touch Icon
  - Versión del sistema visible en el sidebar para referencia rápida

## 📝 Scripts Disponibles

- `npm run dev` - Inicia servidor de desarrollo
- `npm run build` - Build de producción
- `npm run build:dev` - Build de desarrollo
- `npm run preview` - Preview del build
- `npm run lint` - Ejecuta ESLint

## 🤝 Contribución

Este es un proyecto privado. Para contribuir:

1. Crear una rama desde `main`
2. Realizar los cambios
3. Crear un Pull Request
4. Esperar revisión y aprobación

## 📄 Licencia

Proyecto privado - Todos los derechos reservados

## 📞 Soporte

Para soporte o consultas sobre el proyecto, contactar al equipo de desarrollo.

---

## 🔧 Notas Técnicas

### Gestión de Fechas y Zona Horaria

El sistema implementa un manejo robusto de fechas para evitar problemas de zona horaria:

- **Campos de fecha (DATE)**: Se calculan manualmente desde la hora local del cliente usando `getFullYear()`, `getMonth()`, `getDate()`
- **Campos de timestamp (TIMESTAMP)**: Se envían explícitamente usando `getLocalDateTimeISO()` que preserva la fecha local
- **Sin valores por defecto**: Se eliminaron todos los `now()` y `CURRENT_DATE` de la base de datos
- **Triggers corregidos**: Los triggers usan la fecha de la venta para construir timestamps correctos
- **Resultado**: No hay desfase de un día por zona horaria en ninguna tabla

**Tablas afectadas:**
- `ventas`: `fecha`, `created_at`, `updated_at`
- `detalle_venta`: `created_at`
- `movimientos_inventario`: `fecha`, `created_at`
- `productos`: `fecha_creacion`, `created_at`, `updated_at`
- `usuarios`: `fecha_creacion`, `updated_at`
- `clientes`: `fecha_registro`, `created_at`, `updated_at`
- `categorias`: `created_at`, `updated_at`
- `arqueos_caja`: `fecha`, `created_at`, `updated_at`

---

**Versión**: 2.2.0  
**Última actualización**: Diciembre 2024  
**Estado**: Sistema completo con Ventas a Crédito y Optimizaciones Móviles - En producción
