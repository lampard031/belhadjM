import os, uuid, shutil
from datetime import datetime
from pathlib import Path
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import pymysql

ROOT = Path(__file__).parent
load_dotenv(ROOT / ".env")

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "change_me")
CORS(app, origins=os.getenv("CORS_ORIGINS","*").split(","), supports_credentials=True)

DB_CFG = dict(
    host=os.getenv("DB_HOST","127.0.0.1"),
    port=int(os.getenv("DB_PORT","3306")),
    user=os.getenv("DB_USER"),
    password=os.getenv("DB_PASSWORD"),
    database=os.getenv("DB_NAME"),
    charset="utf8mb4",
    cursorclass=pymysql.cursors.DictCursor
)

def db():
    return pymysql.connect(**DB_CFG)

# IMPORTANT: uploader dans le dossier public servi par Apache
UPLOAD_DIR = ROOT.parent / "public_html" / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

@app.get("/api/healthz")
def healthz():
    try:
        with db() as conn, conn.cursor() as cur:
            cur.execute("SELECT 1")
        return {"status":"ok"}, 200
    except Exception as e:
        return {"status":"db_error","detail":str(e)}, 500

# --- Tables (si besoin) ---
DDL_WINNERS = """
CREATE TABLE IF NOT EXISTS winners (
    id VARCHAR(64) PRIMARY KEY,
    amount DECIMAL(10,2) NOT NULL,
    game VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    photo TEXT NOT NULL,
    isActive TINYINT(1) DEFAULT 1,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
"""
DDL_EVENTS = """
CREATE TABLE IF NOT EXISTS events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    event_date DATE,
    start_time TIME,
    price DECIMAL(10,2) NULL,
    image_url TEXT NULL,
    isActive TINYINT(1) DEFAULT 1,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
"""
DDL_PROMOS = """
CREATE TABLE IF NOT EXISTS promotions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_date DATE,
    end_date DATE,
    percent_off DECIMAL(5,2) NULL,
    fixed_amount DECIMAL(10,2) NULL,
    promo_code VARCHAR(50) NULL,
    image_url TEXT NULL,
    isActive TINYINT(1) DEFAULT 1,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
"""

@app.before_first_request
def init_db():
    with db() as conn, conn.cursor() as cur:
        cur.execute(DDL_WINNERS)
        cur.execute(DDL_EVENTS)
        cur.execute(DDL_PROMOS)

# --- Winners ---
@app.get("/api/winners")
def get_winners():
    with db() as conn, conn.cursor() as cur:
        cur.execute("""SELECT id, amount, game, date, photo, isActive, createdAt
                       FROM winners WHERE isActive=1 ORDER BY date DESC LIMIT 50""")
        rows = cur.fetchall()
        for r in rows:
            if isinstance(r.get("date"), datetime):
                r["date"] = r["date"].date().isoformat()
            elif r.get("date"):
                r["date"] = r["date"].isoformat()
            if r.get("createdAt"):
                r["createdAt"] = r["createdAt"].isoformat()
        return jsonify({"winners": rows})

@app.post("/api/winners")
def create_winner():
    data = request.get_json(force=True)
    required = ["amount","game","date","photo"]
    if any(k not in data or data[k] in (None,"") for k in required):
        return {"success":False,"message":"Champs manquants"}, 400
    _id = f"winner_{uuid.uuid4().hex}"
    with db() as conn, conn.cursor() as cur:
        cur.execute("""INSERT INTO winners (id, amount, game, date, photo, isActive)
                       VALUES (%s,%s,%s,%s,%s,1)""",
                    (_id, data["amount"], data["game"], data["date"], data["photo"]))
        conn.commit()
    return {"success":True,"id":_id}, 201

@app.delete("/api/winners/<winner_id>")
def delete_winner(winner_id):
    with db() as conn, conn.cursor() as cur:
        cur.execute("DELETE FROM winners WHERE id=%s", (winner_id,))
        conn.commit()
        if cur.rowcount == 0:
            return {"success":False,"message":"Gagnant introuvable"}, 404
    return {"success":True}

# --- Events ---
@app.get("/api/events")
def get_events():
    with db() as conn, conn.cursor() as cur:
        cur.execute("""SELECT * FROM events WHERE isActive=1
                       ORDER BY event_date DESC, start_time DESC LIMIT 100""")
        return jsonify({"events": cur.fetchall()})

@app.post("/api/events")
def create_event():
    data = request.get_json(force=True)
    with db() as conn, conn.cursor() as cur:
        cur.execute("""INSERT INTO events (title,description,category,event_date,start_time,price,image_url,isActive)
                       VALUES (%s,%s,%s,%s,%s,%s,%s,1)""",
                    (data.get("title"), data.get("description"), data.get("category"),
                     data.get("event_date"), data.get("start_time"), data.get("price"),
                     data.get("image_url")))
        conn.commit()
    return {"success":True}, 201

@app.delete("/api/events/<int:event_id>")
def delete_event(event_id):
    with db() as conn, conn.cursor() as cur:
        cur.execute("DELETE FROM events WHERE id=%s", (event_id,))
        conn.commit()
        if cur.rowcount == 0:
            return {"success":False,"message":"Événement introuvable"}, 404
    return {"success":True}

# --- Promotions ---
@app.get("/api/promotions")
def get_promotions():
    with db() as conn, conn.cursor() as cur:
        cur.execute("""SELECT * FROM promotions WHERE isActive=1
                       ORDER BY start_date DESC LIMIT 100""")
        return jsonify({"promotions": cur.fetchall()})

@app.post("/api/promotions")
def create_promotion():
    data = request.get_json(force=True)
    with db() as conn, conn.cursor() as cur:
        cur.execute("""INSERT INTO promotions
                       (title,description,start_date,end_date,percent_off,fixed_amount,promo_code,image_url,isActive)
                       VALUES (%s,%s,%s,%s,%s,%s,%s,%s,1)""",
                    (data.get("title"), data.get("description"), data.get("start_date"),
                     data.get("end_date"), data.get("percent_off"), data.get("fixed_amount"),
                     data.get("promo_code"), data.get("image_url")))
        conn.commit()
    return {"success":True}, 201

@app.delete("/api/promotions/<int:promo_id>")
def delete_promo(promo_id):
    with db() as conn, conn.cursor() as cur:
        cur.execute("DELETE FROM promotions WHERE id=%s", (promo_id,))
        conn.commit()
        if cur.rowcount == 0:
            return {"success":False,"message":"Promo introuvable"}, 404
    return {"success":True}

# --- Upload image ---
@app.post("/api/upload")
def upload_image():
    if "file" not in request.files:
        return {"success":False,"message":"Aucun fichier"}, 400
    f = request.files["file"]
    if f.mimetype not in ["image/jpeg","image/jpg","image/png","image/webp"]:
        return {"success":False,"message":"Type non autorisé"}, 400
    ext = (f.filename or "").split(".")[-1].lower()
    name = f"{uuid.uuid4().hex}.{ext}"
    path = UPLOAD_DIR / name
    with open(path, "wb") as out:
        shutil.copyfileobj(f.stream, out)
    # URL publique
    file_url = f"https://{request.host}/uploads/{name}"
    return {"success":True,"url":file_url,"filename":name}
