# Sistema Contable

Sistema contable completo con autenticación, módulo de usuarios, prueba de integración AI y módulo contable integrado.

## Características

- ✅ Autenticación con correo y contraseña (bcrypt)
- ✅ Módulo de gestión de usuarios (CRUD básico)
- ✅ Panel de administrador (`/dashboard`)
- ✅ Listado de usuarios (`/users`)
- ✅ **Módulo Contable Completo**:
  - Catálogo de cuentas (crear, listar)
  - Registro de asientos contables con validación de partida doble
  - Libro Diario (visualización por período)
  - Libro Mayor por cuenta
  - Balance de Prueba (verificación de equilibrio)
  - Estado de Resultados (ingresos, gastos, utilidad)
- ✅ Interfaz moderna con Tailwind CSS (CDN)
- ✅ Integración AI configurable (`/ai` - scaffold)
- ✅ Sesiones persistentes (SQLite)

## Requisitos

- Node.js 18+ 
- npm

## Instalación

```bash
cd /workspaces/sistema-contable
npm install
```

## Configuración

1. **Crear usuario admin (opcional — ya se hizo al iniciar)**:
   ```bash
   ADMIN_EMAIL=admin@local ADMIN_PASSWORD='Admin123!' ADMIN_NAME='Admin' node scripts/create_admin.js
   ```

2. **Variables de entorno** (archivo `.env` ya incluido):
   ```
   ADMIN_EMAIL=admin@local
   ADMIN_PASSWORD=Admin123!
   ADMIN_NAME=Admin Interno
   # AI_API_URL=... (opcional)
   # AI_API_KEY=... (opcional)
   ```

## Iniciar servidor

```bash
npm start
# Luego abre en tu navegador: http://localhost:3000
```

### Rutas disponibles

**Autenticación y Usuarios**:
- `/` → redirige a `/login`
- `/login` → iniciar sesión
- `/register` → crear nueva cuenta
- `/dashboard` → panel de bienvenida
- `/users` → listar usuarios registrados
- `/logout` → cerrar sesión

**Módulo Contable** (prefijo `/accounting`):
- `/cuentas` → catálogo de cuentas (listar)
- `/cuentas/crear` → crear nueva cuenta
- `/asientos` → listado de asientos contables
- `/asientos/crear` → registrar nuevo asiento
- `/asientos/:id` → ver asiento específico
- `/diario` → Libro Diario (filtrable por fecha)
- `/mayor` → Libro Mayor (por cuenta)
- `/mayor/:cuenta_id` → Mayor de cuenta específica
- `/balance` → Balance de Prueba (verificación de equilibrio)
- `/resultados` → Estado de Resultados (P&L)

**Otros**:
- `/ai` → formulario para probar integración AI

## Estructura del proyecto

```
sistema-contable/
├── index.js              # Servidor principal (Express)
├── db.js                 # Inicialización de BD (SQLite + tablas)
├── package.json          # Dependencias
├── .env                  # Variables de entorno
├── .env.example          # Template de variables
├── models/
│   ├── user.js           # Modelo de usuario (bcrypt)
│   ├── cuenta.js         # Modelo de cuentas contables
│   ├── asiento.js        # Modelo de asientos (partida doble)
│   └── transaccion.js    # Modelo de transacciones
├── routes/
│   ├── auth.js           # Rutas login/register/logout
│   ├── users.js          # Rutas dashboard/users
│   ├── ai.js             # Ruta /ai (prueba AI)
│   └── accounting.js     # Rutas del módulo contable
├── services/
│   └── aiClient.js       # Cliente AI genérico (axios)
├── views/
│   ├── login.ejs         # Vista login
│   ├── register.ejs      # Vista registro
│   ├── dashboard.ejs     # Vista dashboard
│   ├── users.ejs         # Vista listado de usuarios
│   ├── ai.ejs            # Vista prueba AI
│   └── accounting/       # Vistas del módulo contable
│       ├── cuentas.ejs           # Catálogo de cuentas
│       ├── crear-cuenta.ejs      # Formulario crear cuenta
│       ├── asientos.ejs          # Listado de asientos
│       ├── crear-asiento.ejs     # Formulario crear asiento (con JS dinámico)
│       ├── ver-asiento.ejs       # Ver asiento específico
│       ├── diario.ejs            # Libro Diario
│       ├── mayor.ejs             # Libro Mayor
│       ├── balance.ejs           # Balance de Prueba
│       └── resultados.ejs        # Estado de Resultados
├── scripts/
│   └── create_admin.js   # Script para crear admin
├── data/                 # Base de datos SQLite (generada)
└── public/               # Activos estáticos

## Notas de desarrollo

- **Base de datos**: SQLite en `data/database.sqlite3` (creada automáticamente)
- **Estilos**: Tailwind CSS vía CDN (sin instalación local requerida)
- **Sesiones**: Persistidas en `data/sessions.sqlite3`
- **Hashing de contraseñas**: bcrypt con salt 10
- **Autenticación saltada inicialmente**: Las rutas `/dashboard`, `/users`, `/ai` son accesibles sin login (configurable en `routes/users.js`)

## Próximos pasos (roadmap)

- Integración con API AI real (Anthropic, OpenAI, etc.) en `/ai`
- Protección real de rutas con middleware de sesión
- Editar/eliminar asientos (soft delete, auditoria)
- Reportes avanzados (PDF/Excel)
- Panel de auditoría y logs de cambios
- Multi-empresa (tenant) soporte
- Presupuestos y proyecciones
- Cierre contable automático por período

## Uso del Módulo Contable

### 1. Crear Cuentas

1. Ir a `/accounting/cuentas`
2. Clic en "+ Nueva Cuenta"
3. Llenar: Código (ej. 1010), Nombre (ej. Caja), Tipo (Activo/Pasivo/etc), Clase (opcional)
4. Guardar

### 2. Registrar Asientos

1. Ir a `/accounting/asientos`
2. Clic en "+ Nuevo Asiento"
3. Seleccionar Fecha, Descripción (opcional)
4. Agregar líneas: seleccionar cuenta, monto en Debe o Haber
   - **Regla**: Total Debe **debe ser igual** a Total Haber (partida doble)
5. Guardar

### 3. Consultar Reportes

- **Diario**: Ver todos los asientos en orden cronológico → `/accounting/diario`
- **Mayor**: Ver movimientos de una cuenta específica → `/accounting/mayor`
- **Balance**: Verificar que Debe = Haber → `/accounting/balance`
- **Resultados**: Ver ingresos, gastos y utilidad neta → `/accounting/resultados`

## Credenciales de prueba

- **Usuario**: `admin@local`
- **Contraseña**: `Admin123!`
- **Rol**: `admin`

⚠️ **Por seguridad**, cambia la contraseña después del primer acceso en producción.

---

**© 2025 Sistema Contable**