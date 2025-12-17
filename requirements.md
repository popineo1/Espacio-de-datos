# Espacio de Datos - MVP Auth & RBAC

## Problem Statement Original
App SaaS con Front Office (cliente) y Back Office (asesor/admin).
Primera iteración: base del proyecto con autenticación y RBAC (roles admin, asesor, cliente).

## Requisitos Implementados
- ✅ Rutas protegidas: /admin, /asesor, /cliente (redirige a login o "no autorizado" según corresponda)
- ✅ Autenticación JWT con email/password
- ✅ RBAC con 3 roles: admin, asesor, cliente
- ✅ Solo admin puede crear usuarios
- ✅ Usuarios sin rol quedan pendientes de asignación
- ✅ Layout con paleta corporativa: bg #f4f6fb, primary #8b1530, soft #fbeff3, text #0f172a, muted #64748b
- ✅ Botón flotante de WhatsApp (+34 693 90 86 37) visible en todas las páginas
- ✅ Banner fijo con texto informativo en todas las páginas
- ✅ Usuarios demo: 1 admin, 1 asesor, 1 cliente

## Credenciales Demo
| Rol | Email | Password |
|-----|-------|----------|
| Admin | admin@espaciodatos.com | admin123 |
| Asesor | asesor@espaciodatos.com | asesor123 |
| Cliente | cliente@espaciodatos.com | cliente123 |

## Arquitectura
- **Backend**: FastAPI + MongoDB + JWT Auth
- **Frontend**: React + React Router + Tailwind CSS + Shadcn/UI
- **Database**: MongoDB

## Endpoints API
| Método | Ruta | Descripción | Acceso |
|--------|------|-------------|--------|
| POST | /api/auth/login | Login | Público |
| GET | /api/auth/me | Usuario actual | Autenticado |
| GET | /api/users | Listar usuarios | Admin |
| POST | /api/users | Crear usuario | Admin |
| PUT | /api/users/:id | Editar usuario | Admin |
| DELETE | /api/users/:id | Eliminar usuario | Admin |
| POST | /api/seed-demo-users | Crear usuarios demo | Público |

## Páginas Frontend
- `/login` - Página de inicio de sesión
- `/admin` - Dashboard de administrador
- `/admin/users` - Gestión de usuarios (CRUD)
- `/asesor` - Dashboard de asesor
- `/cliente` - Dashboard de cliente
- `/unauthorized` - Página de acceso denegado

## Next Action Items (Siguientes Iteraciones)
1. **Gestión de Clientes (Asesor)**
   - Listar clientes asignados al asesor
   - Ver detalle de cliente
   - Historial de interacciones

2. **Gestión de Documentos (Cliente)**
   - Subir documentos
   - Ver estado de documentos
   - Descargar documentos

3. **Sistema de Solicitudes**
   - Crear solicitud de subvención
   - Flujo de aprobación
   - Notificaciones

4. **Asignación Asesor-Cliente**
   - Admin asigna clientes a asesores
   - Vista de carga de trabajo por asesor

5. **Reportes y Analytics**
   - Dashboard con métricas reales
   - Exportación de informes

## GitHub
Para subir cambios: Usa el botón "Save to GitHub" en Emergent y selecciona rama `feat/auth-rbac-base` o crea una nueva.
