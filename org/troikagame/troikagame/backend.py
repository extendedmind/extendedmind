'''
Created on 15.8.2012

@author: ttiurani
'''

from troikagame import app
from flask_sqlalchemy import SQLAlchemy
import sqlalchemy

# configuration
DB_HOST  = 'localhost'
DB_NAME  = 'tgdev'
USERNAME = 'tg'
PASSWORD = 'tgpwd'

app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql://' + USERNAME + ':' + PASSWORD + '@' + DB_HOST + '/' + DB_NAME;
db = SQLAlchemy(app)

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True)
    password = db.Column(db.String(80), unique=False)
    role = db.Column(sqlalchemy.Enum('admin', 'user', name='role'), unique=False)

    def __init__(self, email, password, role):
        self.email = email
        self.password = password
        self.role = role

    def __repr__(self):
        return '<User %r>' % self.email

def validate_email_password(email, password):
    return True;