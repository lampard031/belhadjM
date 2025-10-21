from fastapi import FastAPI, APIRouter, HTTPException, UploadFile, File
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime
import shutil
import pymysql
from contextlib import contextmanager


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Create uploads directory
UPLOAD_DIR = ROOT_DIR / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)

# MySQL connection configuration
DB_CONFIG = {
    'host': os.environ.get('DB_HOST', 'localhost'),
    'user': os.environ.get('DB_USER'),
    'password': os.environ.get('DB_PASSWORD'),
    'database': os.environ.get('DB_NAME'),
    'charset': 'utf8mb4',
    'cursorclass': pymysql.cursors.DictCursor
}

# Database connection helper
@contextmanager
def get_db_connection():
    connection = pymysql.connect(**DB_CONFIG)
    try:
        yield connection
        connection.commit()
    except Exception:
        connection.rollback()
        raise
    finally:
        connection.close()

# Create the main app without a prefix
app = FastAPI(title="Casino TRIPLE 7 API", version="1.0.0")

# Mount static files for uploads
app.mount("/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Initialize database tables on startup
@app.on_event("startup")
async def startup_event():
    with get_db_connection() as conn:
        with conn.cursor() as cursor:
            # Create winners table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS winners (
                    id VARCHAR(36) PRIMARY KEY,
                    amount DECIMAL(10, 2) NOT NULL,
                    game VARCHAR(255) NOT NULL,
                    date DATE NOT NULL,
                    photo TEXT NOT NULL,
                    isActive BOOLEAN DEFAULT TRUE,
                    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            logging.info("Database tables initialized")

# Casino Models
class ContactMessage(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: EmailStr
    phone: Optional[str] = None
    service: Optional[str] = None
    message: str
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    status: str = "new"

class ContactMessageCreate(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    service: Optional[str] = None
    message: str

class Winner(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    amount: float
    game: str
    date: datetime
    photo: str  # Image du gagnant (obligatoire)
    isActive: bool = True
    createdAt: datetime = Field(default_factory=datetime.utcnow)

class WinnerCreate(BaseModel):
    amount: float
    game: str
    date: datetime
    photo: str  # Image du gagnant (obligatoire)

class Reservation(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: EmailStr
    phone: str
    service: str
    partySize: Optional[int] = None
    preferredDate: Optional[datetime] = None
    preferredTime: Optional[str] = None
    message: Optional[str] = None
    status: str = "pending"
    createdAt: datetime = Field(default_factory=datetime.utcnow)

class ReservationCreate(BaseModel):
    name: str
    email: EmailStr
    phone: str
    service: str
    partySize: Optional[int] = None
    preferredDate: Optional[datetime] = None
    preferredTime: Optional[str] = None
    message: Optional[str] = None

# API Routes
@api_router.get("/")
async def root():
    return {"message": "Bienvenue à l'API Casino TRIPLE 7"}

# Contact Messages Endpoints
@api_router.post("/contact", response_model=dict)
async def create_contact_message(contact_data: ContactMessageCreate):
    try:
        contact_message = ContactMessage(**contact_data.dict())
        result = await db.contact_messages.insert_one(contact_message.dict())
        
        return {
            "success": True, 
            "message": "Message envoyé avec succès! Nous vous répondrons dans les plus brefs délais.",
            "id": contact_message.id
        }
    except Exception as e:
        logging.error(f"Error creating contact message: {e}")
        raise HTTPException(status_code=500, detail="Erreur lors de l'envoi du message")

@api_router.get("/contact", response_model=dict)
async def get_contact_messages():
    try:
        messages = await db.contact_messages.find({}, {"_id": 0}).sort("createdAt", -1).to_list(100)
        return {"messages": messages}
    except Exception as e:
        logging.error(f"Error fetching contact messages: {e}")
        raise HTTPException(status_code=500, detail="Erreur lors de la récupération des messages")

# Winners Endpoints
@api_router.get("/winners", response_model=dict)
def get_winners():
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute("""
                    SELECT id, amount, game, date, photo, isActive, createdAt
                    FROM winners 
                    WHERE isActive = TRUE 
                    ORDER BY date DESC 
                    LIMIT 10
                """)
                winners = cursor.fetchall()
                
                # Convert date to ISO format
                for winner in winners:
                    if winner.get('date'):
                        winner['date'] = winner['date'].isoformat()
                    if winner.get('createdAt'):
                        winner['createdAt'] = winner['createdAt'].isoformat()
                
                return {"winners": winners}
    except Exception as e:
        logging.error(f"Error fetching winners: {e}")
        raise HTTPException(status_code=500, detail="Erreur lors de la récupération des gagnants")

@api_router.post("/winners", response_model=dict)
def create_winner(winner_data: WinnerCreate):
    try:
        winner = Winner(**winner_data.dict())
        
        with get_db_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute("""
                    INSERT INTO winners (id, amount, game, date, photo, isActive, createdAt)
                    VALUES (%s, %s, %s, %s, %s, %s, %s)
                """, (
                    winner.id,
                    winner.amount,
                    winner.game,
                    winner.date.date() if hasattr(winner.date, 'date') else winner.date,
                    winner.photo,
                    winner.isActive,
                    winner.createdAt
                ))
        
        return {
            "success": True,
            "message": "Gagnant ajouté avec succès",
            "winner": {
                "id": winner.id,
                "amount": float(winner.amount),
                "game": winner.game,
                "date": winner.date.isoformat(),
                "photo": winner.photo
            }
        }
    except Exception as e:
        logging.error(f"Error creating winner: {e}")
        raise HTTPException(status_code=500, detail="Erreur lors de l'ajout du gagnant")

@api_router.delete("/winners/{winner_id}", response_model=dict)
def delete_winner(winner_id: str):
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute("DELETE FROM winners WHERE id = %s", (winner_id,))
                
                if cursor.rowcount == 0:
                    raise HTTPException(status_code=404, detail="Gagnant non trouvé")
        
        return {
            "success": True,
            "message": "Gagnant supprimé avec succès"
        }
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error deleting winner: {e}")
        raise HTTPException(status_code=500, detail="Erreur lors de la suppression du gagnant")

# Upload Image Endpoint
@api_router.post("/upload", response_model=dict)
def upload_image(file: UploadFile = File(...)):
    try:
        # Validate file type
        allowed_types = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
        if file.content_type not in allowed_types:
            raise HTTPException(status_code=400, detail="Type de fichier non autorisé. Utilisez JPG, PNG ou WEBP")
        
        # Generate unique filename
        file_extension = file.filename.split(".")[-1]
        unique_filename = f"{uuid.uuid4()}.{file_extension}"
        file_path = UPLOAD_DIR / unique_filename
        
        # Save file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Return URL
        file_url = f"/uploads/{unique_filename}"
        
        return {
            "success": True,
            "url": file_url,
            "filename": unique_filename
        }
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error uploading file: {e}")
        raise HTTPException(status_code=500, detail="Erreur lors de l'upload du fichier")

# Reservations Endpoints
@api_router.post("/reservations", response_model=dict)
async def create_reservation(reservation_data: ReservationCreate):
    try:
        reservation = Reservation(**reservation_data.dict())
        result = await db.reservations.insert_one(reservation.dict())
        
        return {
            "success": True,
            "message": "Réservation créée avec succès! Nous vous confirmerons les détails sous peu.",
            "reservation": reservation.dict()
        }
    except Exception as e:
        logging.error(f"Error creating reservation: {e}")
        raise HTTPException(status_code=500, detail="Erreur lors de la création de la réservation")

@api_router.get("/reservations", response_model=dict)
async def get_reservations():
    try:
        reservations = await db.reservations.find({}, {"_id": 0}).sort("createdAt", -1).to_list(100)
        return {"reservations": reservations}
    except Exception as e:
        logging.error(f"Error fetching reservations: {e}")
        raise HTTPException(status_code=500, detail="Erreur lors de la récupération des réservations")

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
