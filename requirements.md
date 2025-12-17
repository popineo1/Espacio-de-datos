# Espacio de Datos - fix/cliente-mostrar-fase2

## Verificación Iteración 2

### ✅ Funcionalidades Verificadas

#### 1. Creación de Project al marcar APTA
- Al pulsar "Marcar APTA", se crea automáticamente un Project con:
  - phase = 2
  - incorporation_status = "pendiente"
  - checklist con 4 items en false
- No se crean duplicados si ya existe Project

#### 2. Vista Asesor - Pestaña "Proyecto (Fase 2)"
- Pestaña visible SOLO si Company.status = "apta"
- Campos editables:
  - spaceName (selector con 6 opciones)
  - targetRole (participante/proveedor)
  - useCase (textarea)
  - rgpdChecked (checkbox)
- Checklist autoactualizado (✅/⬜)
- Botones de estado:
  - "Marcar como En progreso" (si pendiente)
  - "Marcar como Completada" (solo si checklist completo)

#### 3. Vista Cliente - Datos del Project
- Si Company.status="lead" → "En evaluación"
- Si Company.status="apta" + Project existe:
  - Tarjeta "Incorporación al Espacio de Datos"
  - Estado: Pendiente / En progreso / Completada
  - Espacio de datos (si existe)
  - Modalidad (si existe)
  - Caso de uso (si existe)
  - Checklist visual (solo lectura)
- Cliente NO puede editar campos

#### 4. Seguridad
- Cliente solo ve su propia Company y Project
- Asesor puede editar todos los campos
- Admin ve todo

## Credenciales Demo

| Email | Password | Empresa | Status |
|-------|----------|---------|--------|
| asesor@espaciodatos.com | asesor123 | - | Asesor |
| cliente.lead@espaciodatos.com | cliente123 | TechData Solutions | APTA (proyecto pendiente) |
| cliente.apta@espaciodatos.com | cliente123 | Industrias Renovables | APTA (proyecto completado) |
| cliente.descartada@espaciodatos.com | cliente123 | Comercial Express | Descartada |

## Modelo Project (Actualizado)

```javascript
{
  id: string,
  company_id: string,
  title: string,
  phase: 2,
  status: "iniciado",
  space_name: string | null,
  target_role: "participante" | "proveedor" | null,
  use_case: string | null,
  rgpd_checked: boolean,
  incorporation_status: "pendiente" | "en_progreso" | "completada",
  incorporation_checklist: {
    espacio_seleccionado: boolean,  // auto: space_name no vacío
    rol_definido: boolean,           // auto: target_role no null
    caso_uso_definido: boolean,      // auto: use_case no vacío
    validacion_rgpd: boolean         // auto: rgpd_checked = true
  },
  created_at: string
}
```

## Endpoints API

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | /api/companies/:id/project | Ver proyecto |
| PUT | /api/companies/:id/project | Actualizar proyecto |
| POST | /api/companies/:id/diagnostic/decide | Marcar APTA/NO APTA (crea Project si APTA) |
| GET | /api/client/dashboard | Dashboard cliente con Project |

## GitHub
**Rama:** `fix/cliente-mostrar-fase2`
Usa el botón **"Save to GitHub"** en Emergent.
