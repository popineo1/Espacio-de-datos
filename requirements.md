# Espacio de Datos - feat/cuestionario-contexto-cliente

## Nueva Funcionalidad: Cuestionario de Contexto de Datos

### Modelo ClientIntake (1:1 con Company)
```javascript
{
  id: string,
  company_id: string (unique),
  data_types: string[],        // operativos, comerciales, clientes_pacientes, sensores_iot, historicos, no_lo_se
  data_usage: enum,            // solo_interno, reporting, estrategico, apenas
  main_interests: string[],    // mejorar_procesos, acceder_datos_externos, monetizar, cumplimiento, no_lo_tengo_claro
  data_sensitivity: enum,      // baja, media, alta, no_lo_se
  notes: string | null,
  submitted: boolean,
  submitted_at: datetime | null,
  created_at: datetime,
  updated_at: datetime
}
```

### Campo añadido a Company
- `intake_status`: `pendiente` | `recibida` (default: pendiente)

### Reglas de Negocio
- ✅ Cuestionario visible SOLO cuando Company.status = "lead"
- ✅ Al enviar: ClientIntake.submitted=true, Company.intake_status="recibida"
- ✅ Cliente NO puede editar después de enviar
- ✅ Admin/Asesor pueden ver y resetear el cuestionario

### UI Cliente (Mi Panel)
- Si status=lead e intake_status=pendiente:
  - Muestra formulario editable con todos los campos
  - Botón "Enviar información"
  - Texto: "No implica ninguna solicitud ni compromiso"
- Si status=lead e intake_status=recibida:
  - Muestra cuestionario en modo solo lectura
  - Badge "Enviado"
  - Mensaje: "Gracias. Nuestro equipo está evaluando la viabilidad"
- Si status=apta: Muestra sección de Incorporación (no cuestionario)
- Si status=descartada: Mensaje neutro

### UI Asesor (Diagnóstico)
- Sección "Información aportada por la empresa"
- Badge: "Recibido" / "Pendiente" / "Sin completar"
- Muestra todos los datos del cuestionario en solo lectura

## Endpoints API

| Método | Ruta | Descripción | Acceso |
|--------|------|-------------|--------|
| GET | /api/companies/{id}/intake | Ver cuestionario | Cliente(propio)/Asesor/Admin |
| POST | /api/companies/{id}/intake | Crear/actualizar cuestionario | Cliente(propio)/Asesor/Admin |
| POST | /api/companies/{id}/intake/submit | Enviar cuestionario | Cliente(propio)/Asesor/Admin |
| POST | /api/companies/{id}/intake/reset | Reabrir cuestionario | Asesor/Admin |

## Credenciales Demo

| Email | Password | Empresa | Status |
|-------|----------|---------|--------|
| cliente.cuestionario@espaciodatos.com | cliente123 | Demo Cuestionario S.L. | Lead (ver cuestionario) |
| cliente.lead@espaciodatos.com | cliente123 | TechData Solutions | Apta |
| cliente.apta@espaciodatos.com | cliente123 | Industrias Renovables | Apta |
| cliente.descartada@espaciodatos.com | cliente123 | Comercial Express | Descartada |

## Test Results
- Backend: 100% ✅
- Frontend: 100% ✅

## GitHub
**Rama:** `feat/cuestionario-contexto-cliente`
Usa el botón **"Save to GitHub"** en Emergent.
