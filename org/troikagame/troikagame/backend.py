'''
Created on 15.8.2012

@author: ttiurani
'''

from troikagame import app
from flask_sqlalchemy import SQLAlchemy
import sqlalchemy

app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql://' + str(app.config.get('DB_USER')) + \
                                        ':' + str(app.config.get('DB_PASSWORD')) + \
                                        '@' + str(app.config.get('DB_HOST')) + \
                                        '/' + str(app.config.get('DB_NAME'))
db = SQLAlchemy(app)

class User(db.Model):
    
    # Identification fields
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(128), unique=True, nullable=False)
    
    # Security fields
    role = db.Column(sqlalchemy.Enum('admin', 'user', name='role'), unique=False, nullable=False)
    password = db.Column(db.String(80), unique=False, nullable=False)
    password_reset_key = db.Column(db.String(32), unique=False, nullable=True)
    password_reset_expire = db.Column(db.DateTime, unique=False, nullable=True)

    # Location and language
    # ISO 3166-1 alpha-2 country code
    country = db.Column(db.String(2), unique=False, nullable=True)
    # ISO 3166-2 region code in the country
    region = db.Column(db.String(3), unique=False, nullable=True)
    # City of residence
    city = db.Column(db.String(128), unique=False, nullable=True)
    # ISO-3166-2 two letter language code
    preferred_language = db.Column(db.String(2), unique=False, nullable=False) 
    
    # i18n ready name fields
    # full_name printed in the typical order of the nationality
    full_name = db.Column(db.String(512), unique=False, nullable=False)
    # short_name, typically first name, but could be artist name
    short_name = db.Column(db.String(128), unique=False, nullable=False)
    # all given names
    given_names = db.Column(db.String(256), unique=False, nullable=True)
    # Family name
    family_name = db.Column(db.String(128), unique=False, nullable=True)
    
    # Handle to use for public records. User name type field used, if user 
    # does not want to use her real name in public information. 
    handle = db.Column(db.String(512), unique=False, nullable=True)
    
    def __init__(self, email, role, password, password_reset_key, password_reset_expire,
                country, region, city, preferred_language,
                full_name, short_name, given_names, family_name,
                handle):
        self.email = email
        self.role = role
        self.password = password
        self.password_reset_key = password_reset_key
        self.password_reset_expire = password_reset_expire
        self.country = country
        self.region = region
        self.city = city 
        self.preferred_language = preferred_language
        self.full_name = full_name
        self.short_name = short_name
        self.given_names = given_names
        self.family_name = family_name
        self.handle = handle

    def __repr__(self):
        return '<User %r>' % self.email
