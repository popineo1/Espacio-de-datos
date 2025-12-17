# Espacio de Datos - Iteración 1: CRM + Diagnóstico

## Problem Statement
App SaaS con Front Office (cliente) y Back Office (asesor/admin).
Iteración 1: CRM mínimo + Diagnóstico como filtro comercial.

## Modelos de Datos

### Company (empresa/lead)
- id, name, nif, sector, size_range, country, website
- contact_name, contact_role, contact_phone
- status: `lead` | `apta` | `descartada`
- created_at, updated_at

### Diagnostic (1:1 con Company)
- id, company_id
- eligibility_ok (boolean), space_identified (boolean), data_potential (boolean)
- legal_risk: `bajo` | `medio` | `alto`
- notes (text)
- result: `pendiente` | `apta` | `no_apta`
- decided_by_user_id, decided_at, created_at

### Project (solo si APTA)
- id, company_id, title
- phase: 2 (Incorporación efectiva)
- status: `iniciado`
- target_role: nullable
- created_at

## Reglas de Negocio
- ✅ Diagnóstico empieza en result = pendiente
- ✅ Si asesor marca NO APTA → Company.status = descartada (no se puede crear Project)
- ✅ Si asesor marca APTA → Company.status = apta + se crea Project automáticamente en fase=2

## Funcionalidades Implementadas

### Back Office (Asesor)
- ✅ Menú "Empresas" con lista, buscador y filtros por status
- ✅ CRUD completo de Company (crear/editar)
- ✅ Vista Company con pestañas "Datos" y "Diagnóstico"
- ✅ Formulario Diagnóstico con 4 checks + legalRisk + notes
- ✅ Botones grandes "Marcar APTA" y "Marcar NO APTA"
- ✅ Confirmación al marcar APTA: "Se ha iniciado el Proyecto (Fase 2)"

### Front Office (Cliente)
- ✅ Dashboard simple según Company.status:
  - lead → "En evaluación"
  - apta → "Apta: iniciando incorporación" + info de proyecto
  - descartada → Mensaje neutro "Evaluación completada"
- ✅ NO muestra palabras "subvención" ni "expediente"
- ✅ Banner fijo visible en todas las páginas

### Seguridad / RBAC
- ✅ Cliente solo ve su Company, diagnóstico y Project
- ✅ Asesor ve todas las Companies/Diagnostics/Projects
- ✅ Admin ve todo + gestión de usuarios

## Credenciales Demo

### Administradores/Asesores
| Rol | Email | Password |
|-----|-------|----------|
| Admin | admin@espaciodatos.com | admin123 |
| Asesor | asesor@espaciodatos.com | asesor123 |

### Clientes Demo (vinculados a empresas)
| Email | Password | Empresa | Status |
|-------|----------|---------|--------|
| cliente.lead@espaciodatos.com | cliente123 | TechData Solutions S.L. | En evaluación |
| cliente.apta@espaciodatos.com | cliente123 | Industrias Renovables S.A. | Apta (con proyecto) |
| cliente.descartada@espaciodatos.com | cliente123 | Comercial Express S.L. | Descartada |

## Endpoints API

### Auth
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | /api/auth/login | Login |
| GET | /api/auth/me | Usuario actual |

### Companies
| Método | Ruta | Descripción | Acceso |
|--------|------|-------------|--------|
| GET | /api/companies | Listar empresas | Asesor/Admin |
| POST | /api/companies | Crear empresa | Asesor/Admin |
| GET | /api/companies/:id | Ver empresa | Asesor/Admin/Cliente(propia) |
| PUT | /api/companies/:id | Editar empresa | Asesor/Admin |
| DELETE | /api/companies/:id | Eliminar empresa | Admin |

### Diagnostics
| Método | Ruta | Descripción | Acceso |
|--------|------|-------------|--------|
| GET | /api/companies/:id/diagnostic | Ver diagnóstico | Asesor/Admin |
| PUT | /api/companies/:id/diagnostic | Actualizar diagnóstico | Asesor/Admin |
| POST | /api/companies/:id/diagnostic/decide | Decidir (apta/no_apta) | Asesor/Admin |

### Projects
| Método | Ruta | Descripción | Acceso |
|--------|------|-------------|--------|
| GET | /api/companies/:id/project | Ver proyecto de empresa | Asesor/Admin/Cliente |
| GET | /api/projects | Listar todos los proyectos | Asesor/Admin |

### Client Dashboard
| Método | Ruta | Descripción | Acceso |
|--------|------|-------------|--------|
| GET | /api/client/dashboard | Estado del cliente | Cliente |

## Arquitectura
- **Backend**: FastAPI + MongoDB + JWT Auth
- **Frontend**: React + React Router + Tailwind CSS + Shadcn/UI
- **Database**: MongoDB

## Next Action Items (Iteración 2)
1. **Módulo de Documentos**
   - Subida de archivos
   - Validación de documentos
   - Estados de documentos

2. **Gestión avanzada de Proyectos**
   - Fases completas (1, 2, 3)
   - Hitos y tareas
   - Timeline de proyecto

3. **Asignación Asesor-Cliente**
   - Admin asigna clientes a asesores
   - Vista de carga de trabajo

4. **Notificaciones**
   - Email al cambiar estado
   - Alertas en dashboard

## GitHub
Para subir cambios: Usa el botón **"Save to GitHub"** en Emergent y selecciona rama `feat/diagnostico-filtro-crm`.
