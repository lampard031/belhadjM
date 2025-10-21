# public_html/api/passenger_wsgi.py
import sys, os

# Chemin vers ton backend Flask
BACKEND_DIR = "/home/u498246000/domains/triple7casino.ca/backend"
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

# Optionnel: assure le chargement de .env par Flask si tu l'utilises dans app.py
os.environ.setdefault("PYTHONUNBUFFERED", "1")

TEST MINIMAL (décommenter ces 3 lignes pour valider Passenger, puis re-commenter)
def application(environ, start_response):
return [b'OK - passenger in /api works']

# App Flask
from app import app as application
