import sqlite3
import os
from datetime import datetime
import json
from contextlib import contextmanager

# Configuration database SQLite
DATABASE_PATH = os.environ.get('DATABASE_PATH', '/home/username/database/casino.db')

def init_database():
    """Initialiser la base de données SQLite avec toutes les tables"""
    with sqlite3.connect(DATABASE_PATH) as conn:
        cursor = conn.cursor()
        
        # Table des gagnants
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS winners (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                amount REAL NOT NULL,
                game TEXT NOT NULL,
                date TEXT NOT NULL,
                photo TEXT,
                isActive BOOLEAN DEFAULT 1,
                createdAt TEXT DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Table des messages de contact
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS contact_messages (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                email TEXT NOT NULL,
                phone TEXT,
                service TEXT,
                message TEXT NOT NULL,
                status TEXT DEFAULT 'new',
                createdAt TEXT DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Table des réservations
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS reservations (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                email TEXT NOT NULL,
                phone TEXT NOT NULL,
                service TEXT NOT NULL,
                partySize INTEGER,
                preferredDate TEXT,
                preferredTime TEXT,
                message TEXT,
                status TEXT DEFAULT 'pending',
                createdAt TEXT DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        conn.commit()

@contextmanager
def get_db_connection():
    """Gestionnaire de contexte pour les connexions SQLite"""
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row  # Pour avoir des dictionnaires au lieu de tuples
    try:
        yield conn
    finally:
        conn.close()

class WinnerDB:
    @staticmethod
    def create(winner_data):
        """Créer un nouveau gagnant"""
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO winners (id, name, amount, game, date, photo, isActive, createdAt)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                winner_data['id'],
                winner_data['name'],
                winner_data['amount'],
                winner_data['game'],
                winner_data['date'],
                winner_data.get('photo'),
                winner_data.get('isActive', True),
                winner_data['createdAt']
            ))
            conn.commit()
            return winner_data
    
    @staticmethod
    def get_active(limit=10):
        """Récupérer les gagnants actifs"""
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                SELECT * FROM winners 
                WHERE isActive = 1 
                ORDER BY date DESC 
                LIMIT ?
            ''', (limit,))
            rows = cursor.fetchall()
            return [dict(row) for row in rows]

class ContactMessageDB:
    @staticmethod
    def create(message_data):
        """Créer un nouveau message de contact"""
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO contact_messages (id, name, email, phone, service, message, status, createdAt)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                message_data['id'],
                message_data['name'],
                message_data['email'],
                message_data.get('phone'),
                message_data.get('service'),
                message_data['message'],
                message_data.get('status', 'new'),
                message_data['createdAt']
            ))
            conn.commit()
            return message_data
    
    @staticmethod
    def get_all(limit=100):
        """Récupérer tous les messages"""
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                SELECT * FROM contact_messages 
                ORDER BY createdAt DESC 
                LIMIT ?
            ''', (limit,))
            rows = cursor.fetchall()
            return [dict(row) for row in rows]

class ReservationDB:
    @staticmethod
    def create(reservation_data):
        """Créer une nouvelle réservation"""
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO reservations (id, name, email, phone, service, partySize, preferredDate, preferredTime, message, status, createdAt)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                reservation_data['id'],
                reservation_data['name'],
                reservation_data['email'],
                reservation_data['phone'],
                reservation_data['service'],
                reservation_data.get('partySize'),
                reservation_data.get('preferredDate'),
                reservation_data.get('preferredTime'),
                reservation_data.get('message'),
                reservation_data.get('status', 'pending'),
                reservation_data['createdAt']
            ))
            conn.commit()
            return reservation_data
    
    @staticmethod
    def get_all(limit=100):
        """Récupérer toutes les réservations"""
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                SELECT * FROM reservations 
                ORDER BY createdAt DESC 
                LIMIT ?
            ''', (limit,))
            rows = cursor.fetchall()
            return [dict(row) for row in rows]

# Initialiser la base de données au démarrage
if __name__ == "__main__":
    init_database()
    print("Base de données SQLite initialisée avec succès!")