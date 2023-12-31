import os
import hashlib
from dotenv import load_dotenv
import mysql.connector


load_dotenv('config.env')

class Database:
    def _setup_connection(self) -> None:
        """Create database connection + cursor and database + table if needed"""
        self.conn = mysql.connector.connect(host=os.environ['DATABASE_HOST'], user=os.environ['DATABASE_USERNAME'], 
                                    password=os.environ['DATABASE_PASSWORD'], database='hiw')
        self.cursor = self.conn.cursor()
        
        self.cursor.execute('CREATE DATABASE IF NOT EXISTS hiw')
        self.cursor.execute('USE hiw')
        
        self.cursor.execute('''
            CREATE TABLE IF NOT EXISTS creators (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(255) NOT NULL,
                password VARCHAR(255) NOT NULL
            )
        ''')
        
        self.conn.commit()
    
    def _close_connection(self) -> None:
        """Close database connection and cursor"""
        self.cursor.close()
        self.conn.close()
        
    def add_user(self, username: str, password: str) -> None:
        """Add user to the creator database

        Args:
            username (str): New user's username
            password (str): New user's password (plaintext)
        """
        self._setup_connection()
        self.cursor.execute('SELECT username FROM creators WHERE username=%s', (username,))
        if not self.cursor.fetchone():
            password_hash = hashlib.sha256(password.encode()).hexdigest()
            insert_str = 'INSERT INTO creators (username, password) VALUES (%s, %s)'
            row = (username, password_hash)
            self.cursor.execute(insert_str, row)
            self.conn.commit()
        
        self._close_connection()
        
    def validate_user(self, username: str, password: str) -> bool:
        """Validate whether entered user credentials match database entry

        Args:
            username (str): Entered username
            password (str): Entered password

        Returns:
            bool: Whether matching entry exists in the creator table
        """
        self._setup_connection()
        self.cursor.execute('SELECT password FROM creators WHERE username=%s', (username,))
        row = self.cursor.fetchone()
        if row:
            password_hash = hashlib.sha256(password.encode()).hexdigest()
            if password_hash == row[0]:
                self._close_connection()
                return True
            
        self._close_connection()
        return False