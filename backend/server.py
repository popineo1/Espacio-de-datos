from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import jwt
import bcrypt

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

# Models
class UserBase(BaseModel):
    email: EmailStr
    name: str
    role: Optional[str] = None  # admin, asesor, cliente, or None (pending)

class UserCreate(BaseModel):
    email: EmailStr
    name: str
    password: str
    role: Optional[str] = None

class UserResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    email: str
    name: str
    role: Optional[str] = None
    created_at: str

class UserUpdate(BaseModel):
    name: Optional[str] = None
    role: Optional[str] = None

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class LoginResponse(BaseModel):
    token: str
    user: UserResponse

class TokenPayload(BaseModel):
    user_id: str
    email: str
    role: Optional[str]
    exp: datetime

# Helper functions
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

# Auth Routes
@api_router.post("/auth/login", response_model=LoginResponse)
async def login(request: LoginRequest):
    user = await db.users.find_one({"email": request.email}, {"_id": 0})
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
        created_at=current_user["created_at"]
    )

# User Management Routes (Admin only)
@api_router.post("/users", response_model=UserResponse)
async def create_user(
    user_data: UserCreate,
    current_user: dict = Depends(require_role(["admin"]))
):
    # Check if email already exists
    existing = await db.users.find_one({"email": user_data.email})
    if existing:
        raise HTTPException(status_code=400, detail="El email ya está registrado")
    
    # Validate role if provided
    if user_data.role and user_data.role not in ["admin", "asesor", "cliente"]:
        raise HTTPException(status_code=400, detail="Rol inválido")
    
    user_id = str(uuid.uuid4())
    user_doc = {
        "id": user_id,
        "email": user_data.email,
        "name": user_data.name,
        "password": hash_password(user_data.password),
        "role": user_data.role,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.users.insert_one(user_doc)
    
    return UserResponse(
        id=user_doc["id"],
        email=user_doc["email"],
        name=user_doc["name"],
        role=user_doc["role"],
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
    
    if update_data:
        await db.users.update_one({"id": user_id}, {"$set": update_data})
    
    updated_user = await db.users.find_one({"id": user_id}, {"_id": 0, "password": 0})
    return UserResponse(
        id=updated_user["id"],
        email=updated_user["email"],
        name=updated_user["name"],
        role=updated_user.get("role"),
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

# Health check
@api_router.get("/")
async def root():
    return {"message": "Espacio de Datos API", "status": "ok"}

# Seed demo users
@api_router.post("/seed-demo-users")
async def seed_demo_users():
    demo_users = [
        {
            "id": str(uuid.uuid4()),
            "email": "admin@espaciodatos.com",
            "name": "Administrador Demo",
            "password": hash_password("admin123"),
            "role": "admin",
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "email": "asesor@espaciodatos.com",
            "name": "Asesor Demo",
            "password": hash_password("asesor123"),
            "role": "asesor",
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "email": "cliente@espaciodatos.com",
            "name": "Cliente Demo",
            "password": hash_password("cliente123"),
            "role": "cliente",
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
            "asesor": {"email": "asesor@espaciodatos.com", "password": "asesor123"},
            "cliente": {"email": "cliente@espaciodatos.com", "password": "cliente123"}
        }
    }

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
