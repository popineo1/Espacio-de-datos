from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, Query
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional, Literal
import uuid
from datetime import datetime, timezone, timedelta
import jwt
import bcrypt
import re

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Configuration
JWT_SECRET = os.environ.get('JWT_SECRET', 'espacio-datos-secret-key-2024')
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24

# Create the main app
app = FastAPI()
api_router = APIRouter(prefix="/api")
security = HTTPBearer()

# ==================== USER MODELS ====================
class UserBase(BaseModel):
    email: EmailStr
    name: str
    role: Optional[str] = None

class UserCreate(BaseModel):
    email: EmailStr
    name: str
    password: str
    role: Optional[str] = None
    company_id: Optional[str] = None  # Link client to company

class UserResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    email: str
    name: str
    role: Optional[str] = None
    company_id: Optional[str] = None
    created_at: str

class UserUpdate(BaseModel):
    name: Optional[str] = None
    role: Optional[str] = None
    company_id: Optional[str] = None

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class LoginResponse(BaseModel):
    token: str
    user: UserResponse

# ==================== COMPANY MODELS ====================
class CompanyCreate(BaseModel):
    name: str
    nif: str
    sector: Optional[str] = None
    size_range: Optional[str] = None  # 1-10, 11-50, 51-250, 250+
    country: Optional[str] = "España"
    website: Optional[str] = None
    contact_name: Optional[str] = None
    contact_role: Optional[str] = None
    contact_phone: Optional[str] = None

class CompanyUpdate(BaseModel):
    name: Optional[str] = None
    nif: Optional[str] = None
    sector: Optional[str] = None
    size_range: Optional[str] = None
    country: Optional[str] = None
    website: Optional[str] = None
    contact_name: Optional[str] = None
    contact_role: Optional[str] = None
    contact_phone: Optional[str] = None

class CompanyResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    name: str
    nif: str
    sector: Optional[str] = None
    size_range: Optional[str] = None
    country: Optional[str] = None
    website: Optional[str] = None
    contact_name: Optional[str] = None
    contact_role: Optional[str] = None
    contact_phone: Optional[str] = None
    status: str  # lead, apta, descartada
    intake_status: str = "pendiente"  # pendiente, recibida
    created_at: str
    updated_at: str

# ==================== CLIENT INTAKE MODELS ====================
class ClientIntakeCreate(BaseModel):
    data_types: List[str] = []  # operativos, comerciales, clientes_pacientes, sensores_iot, historicos, no_lo_se
    data_usage: Literal["solo_interno", "reporting", "estrategico", "apenas"] = "solo_interno"
    main_interests: List[str] = []  # mejorar_procesos, acceder_datos_externos, monetizar, cumplimiento, no_lo_tengo_claro
    data_sensitivity: Literal["baja", "media", "alta", "no_lo_se"] = "baja"
    notes: Optional[str] = None

class ClientIntakeResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    company_id: str
    data_types: List[str] = []
    data_usage: str
    main_interests: List[str] = []
    data_sensitivity: str
    notes: Optional[str] = None
    submitted: bool = False
    submitted_at: Optional[str] = None
    created_at: str
    updated_at: str

# ==================== DIAGNOSTIC MODELS ====================
class DiagnosticCreate(BaseModel):
    eligibility_ok: bool = False
    space_identified: bool = False
    data_potential: bool = False
    legal_risk: Literal["bajo", "medio", "alto"] = "bajo"
    notes: Optional[str] = None

class DiagnosticUpdate(BaseModel):
    eligibility_ok: Optional[bool] = None
    space_identified: Optional[bool] = None
    data_potential: Optional[bool] = None
    legal_risk: Optional[Literal["bajo", "medio", "alto"]] = None
    notes: Optional[str] = None

class DiagnosticResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    company_id: str
    eligibility_ok: bool
    space_identified: bool
    data_potential: bool
    legal_risk: str
    notes: Optional[str] = None
    result: str  # pendiente, apta, no_apta
    decided_by_user_id: Optional[str] = None
    decided_at: Optional[str] = None
    created_at: str

class DiagnosticDecision(BaseModel):
    result: Literal["apta", "no_apta"]

# ==================== PROJECT MODELS ====================
class IncorporationChecklist(BaseModel):
    espacio_seleccionado: bool = False
    rol_definido: bool = False
    caso_uso_definido: bool = False
    validacion_rgpd: bool = False

class ProjectUpdate(BaseModel):
    space_name: Optional[str] = None
    target_role: Optional[Literal["participante", "proveedor"]] = None
    use_case: Optional[str] = None
    rgpd_checked: Optional[bool] = None
    incorporation_status: Optional[Literal["pendiente", "en_progreso", "completada"]] = None

class ProjectResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    company_id: str
    title: str
    phase: int
    status: str
    target_role: Optional[str] = None
    space_name: Optional[str] = None
    use_case: Optional[str] = None
    rgpd_checked: bool = False
    incorporation_status: str = "pendiente"
    incorporation_checklist: IncorporationChecklist = IncorporationChecklist()
    created_at: str

# ==================== HELPER FUNCTIONS ====================
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_token(user_id: str, email: str, role: Optional[str]) -> str:
    payload = {
        "user_id": user_id,
        "email": email,
        "role": role,
        "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def decode_token(token: str) -> dict:
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expirado")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Token inválido")

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    payload = decode_token(credentials.credentials)
    user = await db.users.find_one({"id": payload["user_id"]}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="Usuario no encontrado")
    return user

def require_role(allowed_roles: List[str]):
    async def role_checker(current_user: dict = Depends(get_current_user)):
        if current_user.get("role") not in allowed_roles:
            raise HTTPException(status_code=403, detail="No autorizado para este recurso")
        return current_user
    return role_checker

# ==================== AUTH ROUTES ====================
@api_router.post("/auth/login", response_model=LoginResponse)
async def login(request: LoginRequest):
    user = await db.users.find_one({"email": {"$regex": f"^{re.escape(request.email)}$", "$options": "i"}}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="Credenciales inválidas")
    
    if not verify_password(request.password, user["password"]):
        raise HTTPException(status_code=401, detail="Credenciales inválidas")
    
    token = create_token(user["id"], user["email"], user.get("role"))
    
    user_response = UserResponse(
        id=user["id"],
        email=user["email"],
        name=user["name"],
        role=user.get("role"),
        company_id=user.get("company_id"),
        created_at=user["created_at"]
    )
    
    return LoginResponse(token=token, user=user_response)

@api_router.get("/auth/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    return UserResponse(
        id=current_user["id"],
        email=current_user["email"],
        name=current_user["name"],
        role=current_user.get("role"),
        company_id=current_user.get("company_id"),
        created_at=current_user["created_at"]
    )

# ==================== USER MANAGEMENT ROUTES ====================
@api_router.post("/users", response_model=UserResponse)
async def create_user(
    user_data: UserCreate,
    current_user: dict = Depends(require_role(["admin"]))
):
    existing = await db.users.find_one({"email": {"$regex": f"^{re.escape(user_data.email)}$", "$options": "i"}})
    if existing:
        raise HTTPException(status_code=400, detail="El email ya está registrado")
    
    if user_data.role and user_data.role not in ["admin", "asesor", "cliente"]:
        raise HTTPException(status_code=400, detail="Rol inválido")
    
    user_id = str(uuid.uuid4())
    user_doc = {
        "id": user_id,
        "email": user_data.email.lower(),
        "name": user_data.name,
        "password": hash_password(user_data.password),
        "role": user_data.role,
        "company_id": user_data.company_id,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.users.insert_one(user_doc)
    
    return UserResponse(
        id=user_doc["id"],
        email=user_doc["email"],
        name=user_doc["name"],
        role=user_doc["role"],
        company_id=user_doc.get("company_id"),
        created_at=user_doc["created_at"]
    )

@api_router.get("/users", response_model=List[UserResponse])
async def list_users(current_user: dict = Depends(require_role(["admin"]))):
    users = await db.users.find({}, {"_id": 0, "password": 0}).to_list(1000)
    return [
        UserResponse(
            id=u["id"],
            email=u["email"],
            name=u["name"],
            role=u.get("role"),
            company_id=u.get("company_id"),
            created_at=u["created_at"]
        )
        for u in users
    ]

@api_router.put("/users/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: str,
    user_data: UserUpdate,
    current_user: dict = Depends(require_role(["admin"]))
):
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    update_data = {}
    if user_data.name:
        update_data["name"] = user_data.name
    if user_data.role is not None:
        if user_data.role and user_data.role not in ["admin", "asesor", "cliente"]:
            raise HTTPException(status_code=400, detail="Rol inválido")
        update_data["role"] = user_data.role
    if user_data.company_id is not None:
        update_data["company_id"] = user_data.company_id
    
    if update_data:
        await db.users.update_one({"id": user_id}, {"$set": update_data})
    
    updated_user = await db.users.find_one({"id": user_id}, {"_id": 0, "password": 0})
    return UserResponse(
        id=updated_user["id"],
        email=updated_user["email"],
        name=updated_user["name"],
        role=updated_user.get("role"),
        company_id=updated_user.get("company_id"),
        created_at=updated_user["created_at"]
    )

@api_router.delete("/users/{user_id}")
async def delete_user(
    user_id: str,
    current_user: dict = Depends(require_role(["admin"]))
):
    if current_user["id"] == user_id:
        raise HTTPException(status_code=400, detail="No puedes eliminar tu propia cuenta")
    
    result = await db.users.delete_one({"id": user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    return {"message": "Usuario eliminado correctamente"}

# ==================== COMPANY ROUTES ====================
@api_router.post("/companies", response_model=CompanyResponse)
async def create_company(
    company_data: CompanyCreate,
    current_user: dict = Depends(require_role(["admin", "asesor"]))
):
    # Check NIF unique
    existing = await db.companies.find_one({"nif": company_data.nif})
    if existing:
        raise HTTPException(status_code=400, detail="Ya existe una empresa con este NIF")
    
    company_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    
    company_doc = {
        "id": company_id,
        "name": company_data.name,
        "nif": company_data.nif,
        "sector": company_data.sector,
        "size_range": company_data.size_range,
        "country": company_data.country,
        "website": company_data.website,
        "contact_name": company_data.contact_name,
        "contact_role": company_data.contact_role,
        "contact_phone": company_data.contact_phone,
        "status": "lead",
        "intake_status": "pendiente",
        "created_at": now,
        "updated_at": now
    }
    
    await db.companies.insert_one(company_doc)
    
    # Create initial diagnostic
    diagnostic_doc = {
        "id": str(uuid.uuid4()),
        "company_id": company_id,
        "eligibility_ok": False,
        "space_identified": False,
        "data_potential": False,
        "legal_risk": "bajo",
        "notes": None,
        "result": "pendiente",
        "decided_by_user_id": None,
        "decided_at": None,
        "created_at": now
    }
    await db.diagnostics.insert_one(diagnostic_doc)
    
    return CompanyResponse(**{k: v for k, v in company_doc.items() if k != "_id"})

@api_router.get("/companies", response_model=List[CompanyResponse])
async def list_companies(
    status: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    current_user: dict = Depends(get_current_user)
):
    # Cliente only sees their company
    if current_user.get("role") == "cliente":
        if not current_user.get("company_id"):
            return []
        company = await db.companies.find_one({"id": current_user["company_id"]}, {"_id": 0})
        return [CompanyResponse(**company)] if company else []
    
    # Asesor/Admin see all
    if current_user.get("role") not in ["admin", "asesor"]:
        raise HTTPException(status_code=403, detail="No autorizado")
    
    query = {}
    if status:
        query["status"] = status
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"nif": {"$regex": search, "$options": "i"}},
            {"contact_name": {"$regex": search, "$options": "i"}}
        ]
    
    companies = await db.companies.find(query, {"_id": 0}).to_list(1000)
    return [CompanyResponse(**c) for c in companies]

@api_router.get("/companies/{company_id}", response_model=CompanyResponse)
async def get_company(
    company_id: str,
    current_user: dict = Depends(get_current_user)
):
    # Cliente can only access their company
    if current_user.get("role") == "cliente":
        if current_user.get("company_id") != company_id:
            raise HTTPException(status_code=403, detail="No autorizado")
    elif current_user.get("role") not in ["admin", "asesor"]:
        raise HTTPException(status_code=403, detail="No autorizado")
    
    company = await db.companies.find_one({"id": company_id}, {"_id": 0})
    if not company:
        raise HTTPException(status_code=404, detail="Empresa no encontrada")
    
    return CompanyResponse(**company)

@api_router.put("/companies/{company_id}", response_model=CompanyResponse)
async def update_company(
    company_id: str,
    company_data: CompanyUpdate,
    current_user: dict = Depends(require_role(["admin", "asesor"]))
):
    company = await db.companies.find_one({"id": company_id}, {"_id": 0})
    if not company:
        raise HTTPException(status_code=404, detail="Empresa no encontrada")
    
    update_data = {k: v for k, v in company_data.model_dump().items() if v is not None}
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    if update_data:
        await db.companies.update_one({"id": company_id}, {"$set": update_data})
    
    updated = await db.companies.find_one({"id": company_id}, {"_id": 0})
    return CompanyResponse(**updated)

@api_router.delete("/companies/{company_id}")
async def delete_company(
    company_id: str,
    current_user: dict = Depends(require_role(["admin"]))
):
    company = await db.companies.find_one({"id": company_id})
    if not company:
        raise HTTPException(status_code=404, detail="Empresa no encontrada")
    
    # Delete related data
    await db.diagnostics.delete_many({"company_id": company_id})
    await db.projects.delete_many({"company_id": company_id})
    await db.client_intakes.delete_many({"company_id": company_id})
    await db.companies.delete_one({"id": company_id})
    
    return {"message": "Empresa eliminada correctamente"}

# ==================== CLIENT INTAKE ROUTES ====================
@api_router.get("/companies/{company_id}/intake", response_model=Optional[ClientIntakeResponse])
async def get_client_intake(
    company_id: str,
    current_user: dict = Depends(get_current_user)
):
    # Cliente can only access their company intake
    if current_user.get("role") == "cliente":
        if current_user.get("company_id") != company_id:
            raise HTTPException(status_code=403, detail="No autorizado")
    elif current_user.get("role") not in ["admin", "asesor"]:
        raise HTTPException(status_code=403, detail="No autorizado")
    
    intake = await db.client_intakes.find_one({"company_id": company_id}, {"_id": 0})
    if not intake:
        return None
    
    return ClientIntakeResponse(**intake)

@api_router.post("/companies/{company_id}/intake", response_model=ClientIntakeResponse)
async def create_or_update_intake(
    company_id: str,
    intake_data: ClientIntakeCreate,
    current_user: dict = Depends(get_current_user)
):
    # Only cliente can create/update their own intake
    if current_user.get("role") == "cliente":
        if current_user.get("company_id") != company_id:
            raise HTTPException(status_code=403, detail="No autorizado")
    elif current_user.get("role") not in ["admin", "asesor"]:
        raise HTTPException(status_code=403, detail="No autorizado")
    
    # Check company exists and is in lead status
    company = await db.companies.find_one({"id": company_id}, {"_id": 0})
    if not company:
        raise HTTPException(status_code=404, detail="Empresa no encontrada")
    
    # Check if intake already exists and is submitted
    existing = await db.client_intakes.find_one({"company_id": company_id}, {"_id": 0})
    if existing and existing.get("submitted"):
        # Only admin/asesor can update submitted intake
        if current_user.get("role") == "cliente":
            raise HTTPException(status_code=400, detail="El cuestionario ya ha sido enviado y no puede modificarse")
    
    now = datetime.now(timezone.utc).isoformat()
    
    if existing:
        # Update existing
        update_data = {
            "data_types": intake_data.data_types,
            "data_usage": intake_data.data_usage,
            "main_interests": intake_data.main_interests,
            "data_sensitivity": intake_data.data_sensitivity,
            "notes": intake_data.notes,
            "updated_at": now
        }
        await db.client_intakes.update_one({"company_id": company_id}, {"$set": update_data})
        updated = await db.client_intakes.find_one({"company_id": company_id}, {"_id": 0})
        return ClientIntakeResponse(**updated)
    else:
        # Create new
        intake_doc = {
            "id": str(uuid.uuid4()),
            "company_id": company_id,
            "data_types": intake_data.data_types,
            "data_usage": intake_data.data_usage,
            "main_interests": intake_data.main_interests,
            "data_sensitivity": intake_data.data_sensitivity,
            "notes": intake_data.notes,
            "submitted": False,
            "submitted_at": None,
            "created_at": now,
            "updated_at": now
        }
        await db.client_intakes.insert_one(intake_doc)
        return ClientIntakeResponse(**intake_doc)

@api_router.post("/companies/{company_id}/intake/submit", response_model=ClientIntakeResponse)
async def submit_intake(
    company_id: str,
    current_user: dict = Depends(get_current_user)
):
    # Only cliente can submit their own intake
    if current_user.get("role") == "cliente":
        if current_user.get("company_id") != company_id:
            raise HTTPException(status_code=403, detail="No autorizado")
    elif current_user.get("role") not in ["admin", "asesor"]:
        raise HTTPException(status_code=403, detail="No autorizado")
    
    intake = await db.client_intakes.find_one({"company_id": company_id}, {"_id": 0})
    if not intake:
        raise HTTPException(status_code=404, detail="Debe completar el cuestionario antes de enviarlo")
    
    if intake.get("submitted"):
        raise HTTPException(status_code=400, detail="El cuestionario ya ha sido enviado")
    
    now = datetime.now(timezone.utc).isoformat()
    
    # Mark as submitted
    await db.client_intakes.update_one(
        {"company_id": company_id},
        {"$set": {"submitted": True, "submitted_at": now, "updated_at": now}}
    )
    
    # Update company intake_status
    await db.companies.update_one(
        {"id": company_id},
        {"$set": {"intake_status": "recibida", "updated_at": now}}
    )
    
    updated = await db.client_intakes.find_one({"company_id": company_id}, {"_id": 0})
    return ClientIntakeResponse(**updated)

@api_router.post("/companies/{company_id}/intake/reset")
async def reset_intake(
    company_id: str,
    current_user: dict = Depends(require_role(["admin", "asesor"]))
):
    """Allow asesor/admin to reset intake so client can edit again"""
    intake = await db.client_intakes.find_one({"company_id": company_id}, {"_id": 0})
    if not intake:
        raise HTTPException(status_code=404, detail="No hay cuestionario para esta empresa")
    
    now = datetime.now(timezone.utc).isoformat()
    
    await db.client_intakes.update_one(
        {"company_id": company_id},
        {"$set": {"submitted": False, "submitted_at": None, "updated_at": now}}
    )
    
    await db.companies.update_one(
        {"id": company_id},
        {"$set": {"intake_status": "pendiente", "updated_at": now}}
    )
    
    return {"message": "Cuestionario reabierto para edición"}

# Create client user for company
class CreateCompanyUserRequest(BaseModel):
    email: EmailStr
    name: str
    password: str

@api_router.post("/companies/{company_id}/user", response_model=UserResponse)
async def create_company_user(
    company_id: str,
    user_data: CreateCompanyUserRequest,
    current_user: dict = Depends(require_role(["admin", "asesor"]))
):
    # Check company exists
    company = await db.companies.find_one({"id": company_id}, {"_id": 0})
    if not company:
        raise HTTPException(status_code=404, detail="Empresa no encontrada")
    
    # Check if email already exists
    existing = await db.users.find_one({"email": {"$regex": f"^{re.escape(user_data.email)}$", "$options": "i"}})
    if existing:
        raise HTTPException(status_code=400, detail="El email ya está registrado")
    
    # Check if company already has a user
    existing_company_user = await db.users.find_one({"company_id": company_id})
    if existing_company_user:
        raise HTTPException(status_code=400, detail="Esta empresa ya tiene un usuario asignado")
    
    user_id = str(uuid.uuid4())
    user_doc = {
        "id": user_id,
        "email": user_data.email.lower(),
        "name": user_data.name,
        "password": hash_password(user_data.password),
        "role": "cliente",
        "company_id": company_id,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.users.insert_one(user_doc)
    
    return UserResponse(
        id=user_doc["id"],
        email=user_doc["email"],
        name=user_doc["name"],
        role=user_doc["role"],
        company_id=user_doc["company_id"],
        created_at=user_doc["created_at"]
    )

@api_router.get("/companies/{company_id}/user", response_model=Optional[UserResponse])
async def get_company_user(
    company_id: str,
    current_user: dict = Depends(require_role(["admin", "asesor"]))
):
    user = await db.users.find_one({"company_id": company_id, "role": "cliente"}, {"_id": 0, "password": 0})
    if not user:
        return None
    
    return UserResponse(
        id=user["id"],
        email=user["email"],
        name=user["name"],
        role=user.get("role"),
        company_id=user.get("company_id"),
        created_at=user["created_at"]
    )

# ==================== DIAGNOSTIC ROUTES ====================
@api_router.get("/companies/{company_id}/diagnostic", response_model=DiagnosticResponse)
async def get_diagnostic(
    company_id: str,
    current_user: dict = Depends(get_current_user)
):
    # Cliente can only access their company diagnostic
    if current_user.get("role") == "cliente":
        if current_user.get("company_id") != company_id:
            raise HTTPException(status_code=403, detail="No autorizado")
    elif current_user.get("role") not in ["admin", "asesor"]:
        raise HTTPException(status_code=403, detail="No autorizado")
    
    diagnostic = await db.diagnostics.find_one({"company_id": company_id}, {"_id": 0})
    if not diagnostic:
        raise HTTPException(status_code=404, detail="Diagnóstico no encontrado")
    
    return DiagnosticResponse(**diagnostic)

@api_router.put("/companies/{company_id}/diagnostic", response_model=DiagnosticResponse)
async def update_diagnostic(
    company_id: str,
    diagnostic_data: DiagnosticUpdate,
    current_user: dict = Depends(require_role(["admin", "asesor"]))
):
    diagnostic = await db.diagnostics.find_one({"company_id": company_id}, {"_id": 0})
    if not diagnostic:
        raise HTTPException(status_code=404, detail="Diagnóstico no encontrado")
    
    # Can't update if already decided
    if diagnostic["result"] != "pendiente":
        raise HTTPException(status_code=400, detail="El diagnóstico ya ha sido decidido")
    
    update_data = {k: v for k, v in diagnostic_data.model_dump().items() if v is not None}
    
    if update_data:
        await db.diagnostics.update_one({"company_id": company_id}, {"$set": update_data})
    
    updated = await db.diagnostics.find_one({"company_id": company_id}, {"_id": 0})
    return DiagnosticResponse(**updated)

@api_router.post("/companies/{company_id}/diagnostic/decide", response_model=DiagnosticResponse)
async def decide_diagnostic(
    company_id: str,
    decision: DiagnosticDecision,
    current_user: dict = Depends(require_role(["admin", "asesor"]))
):
    diagnostic = await db.diagnostics.find_one({"company_id": company_id}, {"_id": 0})
    if not diagnostic:
        raise HTTPException(status_code=404, detail="Diagnóstico no encontrado")
    
    if diagnostic["result"] != "pendiente":
        raise HTTPException(status_code=400, detail="El diagnóstico ya ha sido decidido")
    
    company = await db.companies.find_one({"id": company_id}, {"_id": 0})
    if not company:
        raise HTTPException(status_code=404, detail="Empresa no encontrada")
    
    now = datetime.now(timezone.utc).isoformat()
    
    # Update diagnostic
    await db.diagnostics.update_one(
        {"company_id": company_id},
        {"$set": {
            "result": decision.result,
            "decided_by_user_id": current_user["id"],
            "decided_at": now
        }}
    )
    
    # Update company status
    new_status = "apta" if decision.result == "apta" else "descartada"
    await db.companies.update_one(
        {"id": company_id},
        {"$set": {"status": new_status, "updated_at": now}}
    )
    
    # If APTA, create project
    project_created = None
    if decision.result == "apta":
        project_doc = {
            "id": str(uuid.uuid4()),
            "company_id": company_id,
            "title": f"Incorporación - {company['name']}",
            "phase": 2,
            "status": "iniciado",
            "target_role": None,
            "space_name": None,
            "use_case": None,
            "rgpd_checked": False,
            "incorporation_status": "pendiente",
            "incorporation_checklist": {
                "espacio_seleccionado": False,
                "rol_definido": False,
                "caso_uso_definido": False,
                "validacion_rgpd": False
            },
            "created_at": now
        }
        await db.projects.insert_one(project_doc)
        project_created = project_doc["id"]
    
    updated = await db.diagnostics.find_one({"company_id": company_id}, {"_id": 0})
    response = DiagnosticResponse(**updated)
    
    return response

# ==================== PROJECT ROUTES ====================
def build_project_response(project: dict) -> ProjectResponse:
    """Build ProjectResponse with proper checklist handling"""
    checklist = project.get("incorporation_checklist", {})
    return ProjectResponse(
        id=project["id"],
        company_id=project["company_id"],
        title=project["title"],
        phase=project["phase"],
        status=project["status"],
        target_role=project.get("target_role"),
        space_name=project.get("space_name"),
        use_case=project.get("use_case"),
        rgpd_checked=project.get("rgpd_checked", False),
        incorporation_status=project.get("incorporation_status", "pendiente"),
        incorporation_checklist=IncorporationChecklist(
            espacio_seleccionado=checklist.get("espacio_seleccionado", False),
            rol_definido=checklist.get("rol_definido", False),
            caso_uso_definido=checklist.get("caso_uso_definido", False),
            validacion_rgpd=checklist.get("validacion_rgpd", False)
        ),
        created_at=project["created_at"]
    )

@api_router.get("/companies/{company_id}/project", response_model=Optional[ProjectResponse])
async def get_company_project(
    company_id: str,
    current_user: dict = Depends(get_current_user)
):
    # Cliente can only access their company project
    if current_user.get("role") == "cliente":
        if current_user.get("company_id") != company_id:
            raise HTTPException(status_code=403, detail="No autorizado")
    elif current_user.get("role") not in ["admin", "asesor"]:
        raise HTTPException(status_code=403, detail="No autorizado")
    
    project = await db.projects.find_one({"company_id": company_id}, {"_id": 0})
    if not project:
        return None
    
    return build_project_response(project)

@api_router.put("/companies/{company_id}/project", response_model=ProjectResponse)
async def update_company_project(
    company_id: str,
    project_data: ProjectUpdate,
    current_user: dict = Depends(require_role(["admin", "asesor"]))
):
    project = await db.projects.find_one({"company_id": company_id}, {"_id": 0})
    if not project:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")
    
    update_data = {}
    checklist = project.get("incorporation_checklist", {
        "espacio_seleccionado": False,
        "rol_definido": False,
        "caso_uso_definido": False,
        "validacion_rgpd": False
    })
    
    # Update fields and auto-update checklist
    if project_data.space_name is not None:
        update_data["space_name"] = project_data.space_name
        checklist["espacio_seleccionado"] = bool(project_data.space_name and project_data.space_name.strip())
    
    if project_data.target_role is not None:
        update_data["target_role"] = project_data.target_role
        checklist["rol_definido"] = bool(project_data.target_role)
    
    if project_data.use_case is not None:
        update_data["use_case"] = project_data.use_case
        checklist["caso_uso_definido"] = bool(project_data.use_case and project_data.use_case.strip())
    
    if project_data.rgpd_checked is not None:
        update_data["rgpd_checked"] = project_data.rgpd_checked
        checklist["validacion_rgpd"] = project_data.rgpd_checked
    
    update_data["incorporation_checklist"] = checklist
    
    # Handle incorporation status
    if project_data.incorporation_status is not None:
        # Can only mark as completed if all checklist items are true
        if project_data.incorporation_status == "completada":
            all_checked = all([
                checklist["espacio_seleccionado"],
                checklist["rol_definido"],
                checklist["caso_uso_definido"],
                checklist["validacion_rgpd"]
            ])
            if not all_checked:
                raise HTTPException(
                    status_code=400, 
                    detail="Para completar la incorporación faltan pasos del checklist."
                )
        update_data["incorporation_status"] = project_data.incorporation_status
    
    if update_data:
        await db.projects.update_one({"company_id": company_id}, {"$set": update_data})
    
    updated = await db.projects.find_one({"company_id": company_id}, {"_id": 0})
    return build_project_response(updated)

@api_router.get("/projects", response_model=List[ProjectResponse])
async def list_projects(
    current_user: dict = Depends(get_current_user)
):
    if current_user.get("role") == "cliente":
        if not current_user.get("company_id"):
            return []
        project = await db.projects.find_one({"company_id": current_user["company_id"]}, {"_id": 0})
        return [build_project_response(project)] if project else []
    
    if current_user.get("role") not in ["admin", "asesor"]:
        raise HTTPException(status_code=403, detail="No autorizado")
    
    projects = await db.projects.find({}, {"_id": 0}).to_list(1000)
    return [build_project_response(p) for p in projects]

# ==================== CLIENT DASHBOARD ====================
@api_router.get("/client/dashboard")
async def get_client_dashboard(
    current_user: dict = Depends(require_role(["cliente"]))
):
    if not current_user.get("company_id"):
        return {
            "status": "sin_empresa",
            "message": "No tienes una empresa asignada. Contacta con tu asesor."
        }
    
    company = await db.companies.find_one({"id": current_user["company_id"]}, {"_id": 0})
    if not company:
        return {
            "status": "sin_empresa",
            "message": "Empresa no encontrada. Contacta con tu asesor."
        }
    
    project = await db.projects.find_one({"company_id": company["id"]}, {"_id": 0})
    
    status_messages = {
        "lead": {
            "status": "en_evaluacion",
            "title": "En evaluación",
            "message": "Tu empresa está siendo evaluada por nuestro equipo de asesores."
        },
        "apta": {
            "status": "apta",
            "title": "Apta: iniciando incorporación",
            "message": "¡Enhorabuena! Tu empresa ha sido evaluada positivamente y estamos iniciando el proceso de incorporación al espacio de datos."
        },
        "descartada": {
            "status": "no_apta",
            "title": "Evaluación completada",
            "message": "Tras el análisis realizado, tu empresa no cumple actualmente con los requisitos necesarios. Si tienes dudas, contacta con tu asesor."
        }
    }
    
    result = status_messages.get(company["status"], status_messages["lead"])
    result["company"] = {
        "id": company["id"],
        "name": company["name"],
        "status": company["status"],
        "intake_status": company.get("intake_status", "pendiente")
    }
    
    # Include intake info for lead companies
    intake = await db.client_intakes.find_one({"company_id": company["id"]}, {"_id": 0})
    if intake:
        result["intake"] = {
            "id": intake["id"],
            "data_types": intake.get("data_types", []),
            "data_usage": intake.get("data_usage"),
            "main_interests": intake.get("main_interests", []),
            "data_sensitivity": intake.get("data_sensitivity"),
            "notes": intake.get("notes"),
            "submitted": intake.get("submitted", False),
            "submitted_at": intake.get("submitted_at")
        }
    
    if project:
        result["project"] = {
            "id": project["id"],
            "title": project["title"],
            "phase": project["phase"],
            "status": project["status"],
            "space_name": project.get("space_name"),
            "target_role": project.get("target_role"),
            "use_case": project.get("use_case"),
            "incorporation_status": project.get("incorporation_status", "pendiente"),
            "incorporation_checklist": project.get("incorporation_checklist", {})
        }
    
    return result

# ==================== SEED DATA ====================
@api_router.post("/seed-demo-users")
async def seed_demo_users():
    demo_users = [
        {
            "id": str(uuid.uuid4()),
            "email": "admin@espaciodatos.com",
            "name": "Administrador Demo",
            "password": hash_password("admin123"),
            "role": "admin",
            "company_id": None,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "email": "asesor@espaciodatos.com",
            "name": "Asesor Demo",
            "password": hash_password("asesor123"),
            "role": "asesor",
            "company_id": None,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
    ]
    
    created = []
    for user in demo_users:
        existing = await db.users.find_one({"email": user["email"]})
        if not existing:
            await db.users.insert_one(user)
            created.append(user["email"])
    
    return {
        "message": "Usuarios demo creados",
        "created": created,
        "credentials": {
            "admin": {"email": "admin@espaciodatos.com", "password": "admin123"},
            "asesor": {"email": "asesor@espaciodatos.com", "password": "asesor123"}
        }
    }

@api_router.post("/seed-demo-companies")
async def seed_demo_companies(current_user: dict = Depends(require_role(["admin", "asesor"]))):
    now = datetime.now(timezone.utc).isoformat()
    
    # Company 1: Lead (en evaluación)
    company1_id = str(uuid.uuid4())
    company1 = {
        "id": company1_id,
        "name": "TechData Solutions S.L.",
        "nif": "B12345678",
        "sector": "Tecnología",
        "size_range": "11-50",
        "country": "España",
        "website": "https://techdata.example.com",
        "contact_name": "María García",
        "contact_role": "CEO",
        "contact_phone": "+34 612 345 678",
        "status": "lead",
        "created_at": now,
        "updated_at": now
    }
    
    # Company 2: Apta (con proyecto)
    company2_id = str(uuid.uuid4())
    company2 = {
        "id": company2_id,
        "name": "Industrias Renovables S.A.",
        "nif": "A87654321",
        "sector": "Energía",
        "size_range": "51-250",
        "country": "España",
        "website": "https://renovables.example.com",
        "contact_name": "Carlos López",
        "contact_role": "Director General",
        "contact_phone": "+34 698 765 432",
        "status": "apta",
        "created_at": now,
        "updated_at": now
    }
    
    # Company 3: Descartada
    company3_id = str(uuid.uuid4())
    company3 = {
        "id": company3_id,
        "name": "Comercial Express S.L.",
        "nif": "B11223344",
        "sector": "Comercio",
        "size_range": "1-10",
        "country": "España",
        "website": None,
        "contact_name": "Ana Martínez",
        "contact_role": "Propietaria",
        "contact_phone": "+34 655 443 221",
        "status": "descartada",
        "created_at": now,
        "updated_at": now
    }
    
    companies_created = []
    
    for company in [company1, company2, company3]:
        existing = await db.companies.find_one({"nif": company["nif"]})
        if not existing:
            await db.companies.insert_one(company)
            companies_created.append(company["name"])
            
            # Create diagnostic
            diag_result = "pendiente" if company["status"] == "lead" else ("apta" if company["status"] == "apta" else "no_apta")
            diagnostic = {
                "id": str(uuid.uuid4()),
                "company_id": company["id"],
                "eligibility_ok": company["status"] != "descartada",
                "space_identified": company["status"] == "apta",
                "data_potential": company["status"] == "apta",
                "legal_risk": "bajo" if company["status"] == "apta" else ("alto" if company["status"] == "descartada" else "medio"),
                "notes": "Evaluación inicial completada." if company["status"] != "lead" else None,
                "result": diag_result,
                "decided_by_user_id": current_user["id"] if company["status"] != "lead" else None,
                "decided_at": now if company["status"] != "lead" else None,
                "created_at": now
            }
            await db.diagnostics.insert_one(diagnostic)
            
            # Create project for apta company
            if company["status"] == "apta":
                project = {
                    "id": str(uuid.uuid4()),
                    "company_id": company["id"],
                    "title": f"Incorporación - {company['name']}",
                    "phase": 2,
                    "status": "iniciado",
                    "target_role": "participante",
                    "space_name": "Espacio de Datos Industrial",
                    "use_case": "Compartir datos de producción para optimización de procesos industriales.",
                    "rgpd_checked": True,
                    "incorporation_status": "en_progreso",
                    "incorporation_checklist": {
                        "espacio_seleccionado": True,
                        "rol_definido": True,
                        "caso_uso_definido": True,
                        "validacion_rgpd": True
                    },
                    "created_at": now
                }
                await db.projects.insert_one(project)
    
    # Create cliente users linked to companies
    cliente_users = []
    
    # Cliente for company 1 (lead)
    cliente1_existing = await db.users.find_one({"email": "cliente.lead@espaciodatos.com"})
    if not cliente1_existing:
        company1_doc = await db.companies.find_one({"nif": "B12345678"})
        if company1_doc:
            cliente1 = {
                "id": str(uuid.uuid4()),
                "email": "cliente.lead@espaciodatos.com",
                "name": "María García (TechData)",
                "password": hash_password("cliente123"),
                "role": "cliente",
                "company_id": company1_doc["id"],
                "created_at": now
            }
            await db.users.insert_one(cliente1)
            cliente_users.append({"email": "cliente.lead@espaciodatos.com", "company": "TechData Solutions S.L."})
    
    # Cliente for company 2 (apta)
    cliente2_existing = await db.users.find_one({"email": "cliente.apta@espaciodatos.com"})
    if not cliente2_existing:
        company2_doc = await db.companies.find_one({"nif": "A87654321"})
        if company2_doc:
            cliente2 = {
                "id": str(uuid.uuid4()),
                "email": "cliente.apta@espaciodatos.com",
                "name": "Carlos López (Renovables)",
                "password": hash_password("cliente123"),
                "role": "cliente",
                "company_id": company2_doc["id"],
                "created_at": now
            }
            await db.users.insert_one(cliente2)
            cliente_users.append({"email": "cliente.apta@espaciodatos.com", "company": "Industrias Renovables S.A."})
    
    # Cliente for company 3 (descartada)
    cliente3_existing = await db.users.find_one({"email": "cliente.descartada@espaciodatos.com"})
    if not cliente3_existing:
        company3_doc = await db.companies.find_one({"nif": "B11223344"})
        if company3_doc:
            cliente3 = {
                "id": str(uuid.uuid4()),
                "email": "cliente.descartada@espaciodatos.com",
                "name": "Ana Martínez (Express)",
                "password": hash_password("cliente123"),
                "role": "cliente",
                "company_id": company3_doc["id"],
                "created_at": now
            }
            await db.users.insert_one(cliente3)
            cliente_users.append({"email": "cliente.descartada@espaciodatos.com", "company": "Comercial Express S.L."})
    
    return {
        "message": "Datos demo creados",
        "companies_created": companies_created,
        "cliente_users": cliente_users,
        "credentials": {
            "cliente_lead": {"email": "cliente.lead@espaciodatos.com", "password": "cliente123", "status": "En evaluación"},
            "cliente_apta": {"email": "cliente.apta@espaciodatos.com", "password": "cliente123", "status": "Apta"},
            "cliente_descartada": {"email": "cliente.descartada@espaciodatos.com", "password": "cliente123", "status": "Descartada"}
        }
    }

# Health check
@api_router.get("/")
async def root():
    return {"message": "Espacio de Datos API", "status": "ok"}

# Include the router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
