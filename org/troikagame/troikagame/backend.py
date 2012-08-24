'''
Created on 15.8.2012

@author: ttiurani
'''
from troikagame import app
from flask_sqlalchemy import SQLAlchemy
import sqlalchemy

# To Create tables change this:
DB_DNS = None
#
# to something like:
#
# DB_DNS = 'sqlite:////home/ttiurani/devel/test.db'
#
# and run in the command prompt
# >> from troikagame.backend import db
# >> db.create_all()
if DB_DNS is None:
    if app.config.get('DB_DNS') is not None:
        DB_DNS = app.config.get('DB_DNS')
    else:
        DB_DNS = None

if DB_DNS is not None:
     app.config['SQLALCHEMY_DATABASE_URI'] = DB_DNS
elif app.config.get('DB_PREFIX') is not None and \
     app.config.get('DB_USER') is not None and \
     app.config.get('DB_PASSWORD') is not None and \
     app.config.get('DB_HOST') is not None and \
     app.config.get('DB_NAME') is not None:
     app.config['SQLALCHEMY_DATABASE_URI'] = app.config.get('DB_PREFIX') + \
                                             app.config.get('DB_USER') + \
                                        ':' + app.config.get('DB_PASSWORD') + \
                                        '@' + app.config.get('DB_HOST') + \
                                        '/' + app.config.get('DB_NAME')
else:
    raise Exception('Either DB_DNS or valid app.config must be set!')

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


class Troika(db.Model):
    
    # Identification fields
    id = db.Column(db.Integer, primary_key=True)

    # Phase of Troika 
    phase = db.Column(sqlalchemy.Enum('pending', 'pending_huddle', 'active', 'completed', name='phase'), unique=False, nullable=False)
    
    # Description
    title = db.Column(db.String(512), unique=False, nullable=False)
    description = db.Column(db.String(10000), unique=False, nullable=True)

    # Location and language
    # ISO 3166-1 alpha-2 country code
    country = db.Column(db.String(2), unique=False, nullable=False)
    # ISO 3166-2 region code in the country
    region = db.Column(db.String(3), unique=False, nullable=False)
    # City
    city = db.Column(db.String(128), unique=False, nullable=True)
    # Campus
    campus = db.Column(db.String(128), unique=False, nullable=True)
    # Address
    address = db.Column(db.String(512), unique=False, nullable=True)   
    # ISO-3166-2 two letter language code
    language = db.Column(db.String(2), unique=False, nullable=False)
    
    # Time
    start_time = db.Column(db.DateTime, unique=False, nullable=True)
    end_time = db.Column(db.DateTime, unique=False, nullable=True)
       
    # Users involved
    creator_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    teacher_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    first_learner_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    second_learner_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)

    def __init__(self, phase, title, description,
                 country, region, city, campus, address, 
                 language, start_time, end_time,
                 creator_id, teacher_id, first_learner_id,
                 second_learner_id):
        self.phase = phase
        self.title = title
        self.description = description
        self.country = country
        self.region = region
        self.city = city
        self.campus = campus
        self.address = address
        self.language = language
        self.start_time = start_time
        self.end_time = end_time
        self.creator_id = creator_id
        self.teacher_id = teacher_id
        self.first_learner_id = first_learner_id
        self.second_learner_id = second_learner_id

    def __repr__(self):
        return '<Troika %r>' % self.id

