# Espacio de Datos - Iteración 2: Fase 2 Incorporación

## Problem Statement
App SaaS con Front Office (cliente) y Back Office (asesor/admin).
Iteración 2: Gestión de Fase 2 - Incorporación al Espacio de Datos con checklist.

## Modelos de Datos

### Company
- id, name, nif, sector, size_range, country, website
- contact_name, contact_role, contact_phone
- status: `lead` | `apta` | `descartada`
- created_at, updated_at

### Diagnostic (1:1 con Company)
- eligibility_ok, space_identified, data_potential (boolean)
- legal_risk: `bajo` | `medio` | `alto`
- result: `pendiente` | `apta` | `no_apta`

### Project (solo si APTA) - **ACTUALIZADO**
- id, company_id, title, phase: 2, status
- **space_name**: nombre del espacio de datos (nullable)
- **target_role**: `participante` | `proveedor` (nullable)
- **use_case**: descripción del caso de uso (text, nullable)
- **rgpd_checked**: validación RGPD (boolean)
- **incorporation_status**: `pendiente` | `en_progreso` | `completada`
- **incorporation_checklist** (JSON):
  - espacio_seleccionado (auto: true si space_name no vacío)
  - rol_definido (auto: true si target_role no null)
  - caso_uso_definido (auto: true si use_case no vacío)
  - validacion_rgpd (auto: true si rgpd_checked)

## Reglas de Negocio
- ✅ Checklist se actualiza automáticamente al rellenar campos
- ✅ Solo se puede marcar "Completada" si los 4 items del checklist están en true
- ✅ Cliente solo puede ver (solo lectura), asesor puede editar

## Funcionalidades Implementadas

### Back Office (Asesor) - NUEVO
- ✅ Pestaña "Proyecto (Fase 2)" en vista de empresa apta
- ✅ Selector de Espacio de Datos (6 opciones)
- ✅ Selector de Modalidad (participante/proveedor)
- ✅ Campo texto "Caso de uso"
- ✅ Checkbox "Validación RGPD realizada"
- ✅ Checklist visual con 4 items autoactualizado (✅/⬜)
- ✅ Botón "Marcar como En progreso"
- ✅ Botón "Marcar como Completada" (solo si checklist completo)
- ✅ Mensaje de error si intenta completar sin checklist completo

### Front Office (Cliente) - ACTUALIZADO
- ✅ Estado de incorporación: Pendiente / En progreso / Completada
- ✅ Vista de espacio de datos, modalidad y caso de uso (solo lectura)
- ✅ Progreso visual del checklist
- ✅ Barra de progreso de la fase 2
- ✅ NO muestra documentos ni botones de subida
- ✅ NO usa palabras "solicitud" o "expediente"

## Credenciales Demo

### Administradores/Asesores
| Rol | Email | Password |
|-----|-------|----------|
| Admin | admin@espaciodatos.com | admin123 |
| Asesor | asesor@espaciodatos.com | asesor123 |

### Clientes Demo
| Email | Password | Empresa | Status |
|-------|----------|---------|--------|
| cliente.lead@espaciodatos.com | cliente123 | TechData Solutions | En evaluación |
| cliente.apta@espaciodatos.com | cliente123 | Industrias Renovables | Apta (proyecto en_progreso) |
| cliente.descartada@espaciodatos.com | cliente123 | Comercial Express | Descartada |

## Endpoints API

### Project (NUEVO/ACTUALIZADO)
| Método | Ruta | Descripción | Acceso |
|--------|------|-------------|--------|
| GET | /api/companies/:id/project | Ver proyecto | Asesor/Admin/Cliente |
| PUT | /api/companies/:id/project | Actualizar proyecto | Asesor/Admin |
| GET | /api/projects | Listar proyectos | Asesor/Admin |

### Campos actualizables en PUT /project
```json
{
  "space_name": "Espacio de Datos Industrial",
  "target_role": "participante",
  "use_case": "Descripción del caso de uso...",
  "rgpd_checked": true,
  "incorporation_status": "en_progreso"
}
```

## Espacios de Datos Disponibles
- Espacio de Datos Industrial
- Espacio de Datos Agrícola
- Espacio de Datos Turismo
- Espacio de Datos Salud
- Espacio de Datos Movilidad
- Espacio de Datos Energía

## Arquitectura
- **Backend**: FastAPI + MongoDB + JWT Auth
- **Frontend**: React + React Router + Tailwind CSS + Shadcn/UI
- **Database**: MongoDB

## Next Action Items (Iteración 3)
1. **Fase 3: Solicitud de Ayuda**
   - Formulario de solicitud
   - Estados de solicitud
   - Documentación requerida

2. **Módulo de Documentos**
   - Subida de archivos
   - Validación de documentos
   - Estados de documentos

3. **Notificaciones**
   - Email al cambiar estado
   - Alertas en dashboard

4. **Reportes**
   - Dashboard con métricas
   - Exportación de datos

## GitHub
Para subir cambios: Usa el botón **"Save to GitHub"** en Emergent y selecciona rama `feat/fase2-checklist-incorporacion`.
