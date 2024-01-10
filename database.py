import os
import hashlib
from typing import List
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
        
        self.cursor.execute('''
            CREATE TABLE IF NOT EXISTS articles (
                article_id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT,
                title VARCHAR(255) NOT NULL,
                content_path TEXT NOT NULL,
                date_published DATETIME DEFAULT NULL,
                is_published BOOLEAN NOT NULL DEFAULT FALSE,
                is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
                FOREIGN KEY (user_id) REFERENCES creators(id)
            )
        ''')
        
        self.conn.commit()
    
    def _close_connection(self) -> None:
        """Close database connection and cursor"""
        self.cursor.close()
        self.conn.close()
        
    def add_user(self, username: str, password: str) -> int:
        """Add user to the creator database

        Args:
            username (str): New user's username
            password (str): New user's password (plaintext)
            
        Returns:
            int: The new (or existing) user's ID
        """
        self._setup_connection()
        self.cursor.execute('SELECT id FROM creators WHERE username=%s', (username,))
        row = self.cursor.fetchone()
        
        if not row:
            password_hash = hashlib.sha256(password.encode()).hexdigest()
            insert_query = 'INSERT INTO creators (username, password) VALUES (%s, %s)'
            row = (username, password_hash)
            self.cursor.execute(insert_query, row)
            user_id = self.cursor.lastrowid
            self.conn.commit()            
        else:
            user_id = row[0]
                
        self._close_connection()
        return user_id
        
    def validate_user(self, username: str, password: str) -> int:
        """Validate whether entered user credentials match database entry

        Args:
            username (str): Entered username
            password (str): Entered password

        Returns:
            int: User ID of user if valid login. If not, returns None.
        """
        self._setup_connection()
        self.cursor.execute('SELECT * FROM creators WHERE username=%s', (username,))
        row = self.cursor.fetchone()
        self._close_connection()
        if row:
            password_hash = hashlib.sha256(password.encode()).hexdigest()
            if password_hash == row[2]:
                return row[0]
    
    def add_article(self, user_id: int, title: str, content_path: str) -> int:
        """Create an entry in the artices table

        Args:
            user_id (int): ID for the user publishing the article
            title (str): Title of the article
            content_path (str): Path to the HTML path of the article
            
        Returns:

        """
        self._setup_connection()
        insert_query = 'INSERT INTO articles (user_id, title, content_path) VALUES (%s, %s, %s)'
        row = (user_id, title, content_path)
        self.cursor.execute(insert_query, row)
        article_id = self.cursor.lastrowid
        self.conn.commit()
        self._close_connection()
        return article_id
    
    def update_article(self, article_id: int, title: str=None, content_path: str=None) -> None:
        """Update the title or content path of the article entry

        Args:
            article_id (int): Article ID to modify
            title (str): New title of the article
            content_path (str): Path to the HTML path of the article
        """
        self._setup_connection()
        query_prefix = 'UPDATE articles SET'
        query_suffix = 'WHERE article_id=%s'
        
        row_list = []
        set_list = []
        if title:
            set_list.append('title=%s')
            row_list.append(title)
        if content_path:
            set_list.append('content_path=%s')
            row_list.append(content_path)
        row_list.append(article_id)
        
        set_query = ', '.join(set_list)        
        update_query = ' '.join([query_prefix, set_query, query_suffix])
        row = tuple(row_list)
                        
        self.cursor.execute(update_query, row)
        self.conn.commit()
        self._close_connection()
        
    def publish_article(self, article_id: int) -> None:
        """Set publish fields to appropriate values

        Args:
            article_id (int): Article ID to publish
        """
        self._setup_connection()
        update_query = 'UPDATE articles SET date_published=CURRENT_TIMESTAMP, is_published=true WHERE article_id=%s'
        row = (article_id,)
        self.cursor.execute(update_query, row)
        self.conn.commit()
        self._close_connection()
    
    def set_article_delete(self, article_id: int, delete_state: bool) -> None:
        """Modify an article's is_delted attribute to True or False

        Args:
            article_id (int): Article ID to modify
            delete_state (bool): Whether to set the article to deleted or not
        """
        self._setup_connection()
        update_query = 'UPDATE articles SET is_deleted=%s WHERE article_id=%s'
        row = (delete_state, article_id)
        self.cursor.execute(update_query, row)
        self.conn.commit()
        self._close_connection()
        
    def remove_article(self, article_id: int) -> None:
        """Remove an article from the table completely (used for delete permanently operation)

        Args:
            article_id (int): Article ID to remove
        """
        self._setup_connection()
        delete_query = 'DELETE FROM articles WHERE article_id=%s'
        self.cursor.execute(delete_query, (article_id,))
        self.conn.commit()
        self._close_connection()
    
    def get_articles(self, user_id: int, is_published: bool=None) -> List:
        """Get a list of articles for a user and publication status

        Args:
            user_id (int, optional): User ID to search for
            is_published (bool, optional): Filter for if an article is published or not. Defaults to None.

        Returns:
            List: Matching article list
        """
        self._setup_connection()
        
        if is_published is not None:
            self.cursor.execute('SELECT * FROM articles WHERE user_id=%s AND is_published=%s', (user_id, is_published))
        else:
            self.cursor.execute('SELECT * FROM articles WHERE user_id=%s', (user_id,))
        rows = self.cursor.fetchall()
        self._close_connection()
        return rows