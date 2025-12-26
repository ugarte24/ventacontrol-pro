# 📄 PRD: VentaPlus - Sistema de Punto de Venta

## 1. Problema

En el negocio no existe un control digital de inventarios, clientes ni ventas. Los registros se realizan en cuadernos, lo que genera:
- Errores en el arqueo de caja
- Desconocimiento del stock real
- Falta de reportes claros sobre cuánto se vende al día
- Pérdida de tiempo en registros manuales
- Dificultad para analizar tendencias de venta

## 2. Usuarios

### 👤 Usuario Principal: Vendedor

**Situación actual:**
- Registra todas las ventas en un cuaderno de forma manual
- No tiene control automático del stock
- No cuenta con reportes de su total vendido
- Debe calcular manualmente los totales

**Necesidades:**
- Sistema rápido para registrar ventas
- Verificación automática de stock disponible
- Visualización de totales calculados automáticamente
- Historial de sus propias ventas

### 🧑‍💼 Usuario Secundario: Administrador

**Situación actual:**
- Revisa manualmente el cuaderno
- Realiza el arqueo de caja al final del día de forma manual
- No cuenta con reportes automáticos
- No tiene alertas de inventario
- Dificultad para analizar el rendimiento del negocio

**Necesidades:**
- Dashboard con métricas en tiempo real
- Reportes automáticos de ventas
- Alertas de stock bajo
- Control total del inventario
- Gestión de usuarios y permisos

## 3. Flujos de Usuario

### Flujo del Vendedor

1. Abre la aplicación
2. Inicia sesión con sus credenciales
3. Accede al punto de venta
4. Busca producto por nombre o código
5. Agrega productos al carrito
6. Selecciona método de pago (efectivo/QR/transferencia)
7. Completa la venta
8. El sistema registra automáticamente la transacción

### Flujo del Administrador

1. Inicia sesión
2. Visualiza el dashboard con estadísticas del día
3. Revisa ventas del día en tiempo real
4. Verifica alertas de stock bajo
5. Realiza arqueo de caja
6. Genera reportes según necesidad
7. Gestiona productos e inventario
8. Administra usuarios y permisos

## 4. Modelo de Datos (v1.2 – Final)

### 🧑‍💼 USUARIOS

```typescript
{
  id: string;                    // UUID o auth_uid
  nombre: string;                 // Nombre completo
  usuario: string;                 // Username único
  rol: 'admin' | 'vendedor';      // Rol del usuario
  estado: 'activo' | 'inactivo';  // Estado de la cuenta
  fecha_creacion: string;         // ISO date string
}
```

### 📦 PRODUCTOS

```typescript
{
  id: string;
  nombre: string;
  descripcion?: string;
  precio_venta: number;
  codigo: string;                 // Código único del producto
  id_categoria?: string;
  stock_actual: number;
  stock_minimo: number;           // Para alertas
  estado: 'activo' | 'inactivo';
  fecha_creacion: string;
}
```

### 🗂️ CATEGORÍAS

```typescript
{
  id: string;
  nombre: string;
  descripcion?: string;
  estado: 'activo' | 'inactivo';
}
```

### 👤 CLIENTES

```typescript
{
  id: string;
  nombre: string;
  ci_nit?: string;                // Cédula o NIT (opcional)
  telefono?: string;
  direccion?: string;
  fecha_registro: string;
}
```

### 🧾 VENTAS

```typescript
{
  id: string;
  fecha: string;                  // YYYY-MM-DD
  hora: string;                   // HH:mm
  total: number;
  metodo_pago: 'efectivo' | 'qr' | 'transferencia' | 'credito';
  id_cliente?: string;            // Opcional (requerido para crédito)
  id_vendedor: string;
  estado: 'completada' | 'anulada';
  // Campos para ventas a crédito
  meses_credito?: number;         // Cantidad de cuotas
  cuota_inicial?: number;         // Cuota inicial pagada al momento de la venta
  tasa_interes?: number;          // Tasa de interés mensual en porcentaje
  monto_interes?: number;         // Monto calculado de interés
  total_con_interes?: number;     // Total + (interés × cuotas)
  monto_pagado?: number;          // Cuota inicial + suma de pagos registrados
  estado_credito?: 'pendiente' | 'parcial' | 'pagado' | 'vencido';
  interes_eximido?: boolean;       // Si el administrador eximió el interés
}
```

### 🧾 DETALLE_VENTA

```typescript
{
  id: string;
  id_venta: string;
  id_producto: string;
  cantidad: number;
  precio_unitario: number;         // Precio al momento de la venta
  subtotal: number;                // cantidad * precio_unitario
}
```

### 💰 ARQUEOS_DE_CAJA

```typescript
{
  id: string;
  fecha: string;
  hora_apertura: string;
  hora_cierre?: string;
  monto_inicial: number;
  total_ventas: number;           // Calculado automáticamente
  efectivo_real: number;           // Ingresado por el admin
  diferencia: number;              // efectivo_real - (monto_inicial + total_ventas)
  id_administrador: string;
  observacion?: string;
  estado: 'abierto' | 'cerrado';
}
```

### 📊 INVENTARIO (MOVIMIENTOS)

```typescript
{
  id: string;
  id_producto: string;
  tipo_movimiento: 'entrada' | 'salida';
  cantidad: number;
  motivo: 'venta' | 'ajuste' | 'compra' | 'devolución';
  fecha: string;
  id_usuario?: string;             // Usuario que realizó el movimiento
}
```

### 💳 PAGOS_CREDITO

```typescript
{
  id: string;
  id_venta: string;
  numero_cuota: number;            // Número de cuota pagada (1, 2, 3, etc.)
  monto_pagado: number;
  fecha_pago: string;              // YYYY-MM-DD
  metodo_pago: 'efectivo' | 'qr' | 'transferencia';
  observacion?: string;
  id_usuario?: string;             // Usuario que registró el pago
  created_at: string;
  updated_at: string;
}
```

### 🔧 SERVICIOS

```typescript
{
  id: string;
  nombre: string;                  // Ej: "Recarga", "Agente BCP"
  descripcion?: string;
  saldo_actual: number;            // Saldo disponible actual
  estado: 'activo' | 'inactivo';
  created_at: string;
  updated_at: string;
}
```

### 📝 MOVIMIENTOS_SERVICIOS

```typescript
{
  id: string;
  id_servicio: string;
  tipo: 'aumento' | 'ajuste';     // Tipo de movimiento
  monto: number;                   // Monto del movimiento (siempre positivo)
  saldo_anterior: number;          // Saldo antes del movimiento
  saldo_nuevo: number;             // Saldo después del movimiento
  fecha: string;                   // YYYY-MM-DD
  hora: string;                    // HH:mm
  id_usuario: string;              // Usuario que realizó el movimiento
  observacion?: string;
  created_at: string;
}
```

### 📋 REGISTROS_SERVICIOS

```typescript
{
  id: string;
  id_servicio: string;
  fecha: string;                   // YYYY-MM-DD (único por servicio y fecha)
  saldo_inicial: number;           // Saldo al inicio del día
  saldo_final: number;             // Saldo al final del día
  total: number;                    // Calculado: saldo_inicial + monto_aumentado - saldo_final (renombrado de monto_transaccionado)
  monto_aumentado: number;         // Suma de todos los aumentos del día (calculado automáticamente o editable manualmente)
  id_usuario: string;              // Usuario que registró
  observacion?: string;
  created_at: string;
  updated_at: string;
}
```

### 📈 REPORTES (AUTOGENERADOS)

Los reportes se generan dinámicamente a partir de:
- Ventas (por fecha, vendedor, producto)
- Arqueos de caja
- Movimientos de inventario
- Productos más vendidos
- Rendimiento de vendedores
- Análisis de métodos de pago

## 5. Roles & Permisos

### 🧑‍💼 ADMINISTRADOR – Acceso Total

**Gestión de Usuarios:**
- Crear, editar, activar, desactivar usuarios
- Asignar y cambiar roles
- Ver historial de usuarios

**Gestión de Productos:**
- CRUD completo de productos
- CRUD completo de categorías
- Ajustar stock manualmente
- Registrar compras (entradas de inventario)

**Gestión de Ventas:**
- Ver todas las ventas del sistema
- Anular ventas
- Ver detalles completos de cualquier venta
- Filtrar y buscar ventas
- Registrar ventas a crédito
- Gestionar pagos de crédito
- Ver historial de pagos de crédito
- Eximir intereses de ventas a crédito

**Control de Caja:**
- Abrir y cerrar caja
- Realizar arqueos
- Ver historial de arqueos
- Registrar diferencias y observaciones

**Reportes:**
- Acceso a todos los reportes
- Exportar reportes a PDF/Excel
- Configurar parámetros de reportes

**Inventario:**
- Ver todos los movimientos
- Registrar ajustes de inventario
- Ver alertas de stock bajo
- Gestionar compras

**Gestión de Servicios:**
- CRUD completo de servicios (crear, editar, eliminar)
- Ver todos los servicios (nombre, descripción, estado)
- Ver historial completo de movimientos y registros
- Gestionar aumentos de saldo
- Editar manualmente el monto aumentado en el registro diario

### 🧾 VENDEDOR – Acceso Limitado

**Ventas:**
- Registrar nuevas ventas (efectivo, QR, transferencia, crédito)
- Registrar ventas a crédito con cliente seleccionado
- Ver su propio historial de ventas
- Ver total vendido del día
- Seleccionar productos disponibles

**Clientes:**
- Registrar nuevos clientes
- Ver clientes existentes

**Servicios:**
- Ver servicios activos (nombre, descripción, estado)
- Aumentar saldo de servicios
- Registrar saldo inicial y final del día (cierre diario)
- Editar manualmente el monto aumentado en el registro diario
- Ver historial de movimientos y registros
- **No puede**: crear, editar o eliminar servicios

**Productos:**
- Ver productos disponibles
- Ver stock disponible
- Buscar productos por nombre o código
- **NO puede**: crear, editar o eliminar productos

**Restricciones:**
- ❌ No gestiona productos
- ❌ No gestiona inventario
- ❌ No ve reportes generales
- ❌ No gestiona usuarios
- ❌ No realiza arqueos de caja
- ❌ No puede anular ventas de otros vendedores
- ❌ No puede eximir intereses de ventas a crédito

## 6. Panel de Administración (Dashboard)

### ✅ Métricas que el ADMIN debe ver:

**Resumen del Día:**
- Total vendido hoy (en Bs.)
- Número de ventas del día
- Ticket promedio
- Comparación con día anterior (tendencia)

**Estado de Caja:**
- Estado actual (abierta / cerrada)
- Monto inicial
- Total en efectivo esperado
- Diferencia (si hay arqueo pendiente)

**Alertas:**
- Productos con stock bajo o en cero
- Ventas anuladas del día
- Usuarios inactivos

**Actividad:**
- Últimas ventas en tiempo real
- Usuarios activos en el sistema
- Productos más vendidos del día

### ✅ Acciones Rápidas del Admin:

- Abrir/cerrar caja
- Crear nuevo producto
- Ajustar stock de producto
- Registrar compra (entrada de inventario)
- Ver todas las ventas
- Anular venta
- Crear nuevo vendedor
- Cambiar rol de usuario
- Ver reportes
- Exportar datos

## 7. Estado de Implementación

### ✅ v2.0 - Implementado y en Producción

**Backend y Persistencia:**
- ✅ Integración completa con Supabase (PostgreSQL)
- ✅ Autenticación real con Supabase Auth
- ✅ Persistencia de datos en tiempo real
- ✅ Row Level Security (RLS) configurado
- ✅ Funciones y triggers en base de datos
- ✅ **Corrección de zona horaria**: Todos los campos de fecha (`fecha`, `fecha_creacion`, `fecha_registro`, `created_at`, `updated_at`) se guardan correctamente usando la hora local del cliente, sin desfase por zona horaria

**Funcionalidades Completadas:**
- ✅ Sistema de autenticación con roles (Supabase Auth)
- ✅ CRUD completo de productos
- ✅ CRUD completo de categorías
- ✅ CRUD completo de usuarios
- ✅ CRUD completo de clientes
- ✅ Registro de ventas con validación de stock
- ✅ Historial de ventas con filtros avanzados
- ✅ Dashboard con estadísticas en tiempo real
- ✅ Reportes con gráficos (Recharts)
- ✅ Gestión de carrito de compras
- ✅ Control de inventario con alertas de stock bajo
- ✅ Anulación de ventas (solo admin)
- ✅ Búsqueda y filtros en todas las tablas
- ✅ Validación de formularios (React Hook Form + Zod)
- ✅ Diseño responsive (móvil, tablet, desktop)
- ✅ UI/UX moderna con shadcn/ui
- ✅ Sistema de permisos por rol funcional
- ✅ Múltiples métodos de pago (efectivo, QR, transferencia, crédito)
- ✅ **Sistema de ventas a crédito completo:**
  - ✅ Registro de ventas a crédito con selección de cliente
  - ✅ Configuración de cantidad de cuotas
  - ✅ Tasa de interés mensual configurable por venta
  - ✅ Cuota inicial opcional
  - ✅ Cálculo automático de interés (mínimo 1 mes desde la fecha de venta)
  - ✅ Interés total se suma a cada cuota
  - ✅ Registro de pagos por cuota
  - ✅ Historial de pagos con visualización de cuota inicial
  - ✅ Eliminación de cuotas pagadas
  - ✅ Gestión de estado de crédito (pendiente, parcial, pagado, vencido)
  - ✅ Eximir intereses (solo administrador)
- ✅ **Sistema de gestión de servicios:**
  - ✅ CRUD completo de servicios (solo admin)
  - ✅ Aumento de saldo de servicios con historial
  - ✅ Registro diario de saldo inicial y final
  - ✅ Cálculo automático de monto transaccionado y aumentado
  - ✅ Edición manual del monto aumentado en el registro diario
  - ✅ Historial completo de movimientos y registros
  - ✅ Visualización de servicios en Dashboard
  - ✅ Búsqueda de servicios en la lista principal
  - ✅ Interfaz simplificada: saldo actual no visible en lista (solo en registro diario)
- ✅ Gestión de movimientos de inventario
- ✅ Arqueo de caja (apertura y cierre)
- ✅ Exportación de reportes a PDF y Excel
- ✅ Ocultación de spinner en campos numéricos para mejor UX
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
- ✅ **Paginación en listados grandes:**
  - ✅ Paginación implementada en todas las tablas del sistema
  - ✅ 20 elementos por página en todas las tablas
  - ✅ Controles de navegación (anterior/siguiente) con números de página
  - ✅ Reseteo automático de página cuando cambian los datos o filtros
  - ✅ Implementado en: Historial de Ventas, Ventas a Crédito, Productos, Clientes, Usuarios, Categorías, Servicios, Registro de Servicios, Historial de Servicios, Movimientos de Inventario, Historial de Arqueos
- ✅ **Impresión de tickets mejorada:**
  - ✅ Impresión de tickets para ventas normales
  - ✅ Impresión de tickets para ventas a crédito con cuota inicial
  - ✅ Impresión de comprobantes de pago para cuotas de crédito
  - ✅ Botón de impresión directo en cada fila del historial de ventas
  - ✅ Botón de impresión en diálogo de detalles de venta
  - ✅ Formato optimizado para impresoras térmicas (80mm)
  - ✅ Diseño diferenciado para ventas a crédito y pagos
- ✅ **Diseño de reportes profesional:**
  - ✅ Encabezado con logo y nombre del sistema
  - ✅ Información de usuario conectado y fecha del reporte
  - ✅ Título del reporte centrado en verde
  - ✅ Tabla centrada con encabezados en color teal oscuro
  - ✅ Formato consistente en todos los reportes exportados (PDF)
- ✅ **Reportes específicos de ventas a crédito:**
  - ✅ Pestañas para separar reportes generales de reportes de crédito
  - ✅ Estadísticas específicas: Total ventas, Pendiente por cobrar, Total cobrado, Créditos activos, Pagados, Parciales, Pendientes
  - ✅ Gráficos de distribución por estado (pendiente, parcial, pagado, vencido)
  - ✅ Gráfico de tendencia de cobros por día
  - ✅ Top 5 clientes con más créditos
  - ✅ Exportación a PDF/Excel con información detallada de cada crédito (cliente, productos, intereses, pagos, saldo pendiente)
  - ✅ Diseño optimizado de columnas para que todas quepan en el ancho de página

**Estado Técnico:**
- Frontend completo y funcional
- Backend con Supabase (PostgreSQL)
- Arquitectura escalable implementada
- TypeScript con tipado completo
- React Query para gestión de estado del servidor
- Context API para estado global
- Manejo de errores robusto
- Optimización de performance con React Query caching
- **Gestión de fechas**: Sistema robusto que preserva la fecha local del cliente en todos los timestamps

**Cambios en v2.8.0:**
- ✅ Inclusión de servicios en el arqueo de caja: El total transaccionado de servicios del día se incluye automáticamente en el cálculo del arqueo
- ✅ Reorganización del menú: La sección de Servicios ahora aparece debajo de Inventario en el menú lateral

**Cambios en v2.9.0:**
- ✅ Campo de email agregado al formulario de editar usuario
- ✅ Administradores pueden ver y actualizar el email de cualquier usuario
- ✅ Edge Functions implementadas para gestión de emails (`get-user-email`, `update-user-email`)
- ✅ Scripts de despliegue automatizados para Edge Functions
- ✅ Documentación completa de Edge Functions y despliegue

**Cambios en v2.10.0:**
- ✅ Corrección del cálculo de saldo anterior en movimientos de servicios: Los movimientos del mismo día ahora se encadenan correctamente usando el saldo_nuevo del movimiento anterior
- ✅ Orden descendente en movimientos de saldo: Los movimientos se muestran con los más recientes primero
- ✅ Actualización automática de saldos posteriores: Al editar un movimiento, todos los movimientos posteriores del mismo día se recalculan automáticamente
- ✅ Cierre automático del diálogo al editar: El diálogo "Aumentar Saldo" se cierra automáticamente después de guardar un movimiento editado
- ✅ Preservación de estado del sidebar: La posición de scroll y el estado de secciones abiertas/cerradas se mantienen al navegar entre páginas
- ✅ Corrección de mensajes duplicados: Eliminación de mensajes de éxito duplicados en la edición de movimientos

### 🔜 v3.0 - Pendiente de Implementación 

**Funcionalidades Futuras:**
- 🔜 Backup automático
- 🔜 Historial completo de movimientos de inventario con interfaz mejorada
- 🔜 Notificaciones de vencimiento de créditos

**Mejoras Futuras:**
- 🔜 Testing (unitario, integración, E2E)
- 🔜 Lazy loading de rutas
- 🔜 Optimizaciones avanzadas de performance
- 🔜 Internacionalización (i18n)
- 🔜 Modo oscuro
- 🔜 Sincronización offline

## 8. Branding y Diseño

**Nombre:** VentaPlus

**Tono:** Profesional, confiable, eficiente

**Estilo Visual:**
- Dashboard moderno tipo panel administrativo
- Tarjetas informativas (stat cards)
- Gráficas y visualizaciones de datos
- Sidebar lateral colapsable
- Diseño limpio y corporativo
- Paleta de colores profesional
- Tipografía clara y legible
- Iconografía consistente (Lucide React)

**Experiencia de Usuario:**
- Interfaz intuitiva y fácil de usar
- Feedback visual inmediato
- Animaciones sutiles
- Responsive design completo
- Accesibilidad considerada
- **Optimizaciones móviles avanzadas:**
  - Layout corregido para pantallas pequeñas (eliminación de pantalla en blanco)
  - Área táctil aumentada para Android (44px mínimo según estándares)
  - Eventos touch mejorados para mejor respuesta en dispositivos móviles
  - Viewport optimizado con soporte para `-webkit-fill-available`
  - Z-index y stacking context optimizados para evitar bloqueos de touch
  - Favicon personalizado con logo V+ del sistema
  - Soporte PWA con Web Manifest y Apple Touch Icon
  - Theme color para personalización de la barra de estado en móviles

## 9. Métricas de Éxito

**Para el Negocio:**
- Reducción del tiempo de registro de ventas en 70%
- Eliminación de errores en arqueo de caja
- Visibilidad completa del stock en tiempo real
- Reportes automáticos diarios

**Para los Usuarios:**
- Facilidad de uso (tiempo de aprendizaje < 30 min)
- Velocidad de registro de venta < 2 min
- Satisfacción del usuario > 4.5/5

## 10. Roadmap Futuro (v3.0+)

- Integración con sistemas de facturación
- App móvil para vendedores
- Integración con proveedores
- Sistema de promociones y descuentos
- Múltiples sucursales
- Sincronización en la nube
- Backup automático

---

**Versión del PRD:** 2.10  
**Última actualización:** Diciembre 2025  
**Estado del Proyecto:** v2.10.0 - Sistema Completo con Mejoras en Gestión de Servicios y UX

### 📝 Notas Técnicas Importantes

**Gestión de Fechas y Zona Horaria:**
- Todos los campos de fecha se calculan usando la hora local del cliente (navegador)
- Los campos `fecha` (tipo DATE) se formatean manualmente desde la hora local
- Los campos `created_at` y `updated_at` (tipo TIMESTAMP) se envían explícitamente usando `getLocalDateTimeISO()`
- Se eliminaron todos los valores por defecto `now()` y `CURRENT_DATE` de la base de datos
- Los triggers de base de datos usan la fecha de la venta para construir timestamps correctos
- **Resultado**: No hay desfase de un día por zona horaria en ninguna tabla
