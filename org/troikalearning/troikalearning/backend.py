#  Copyright (c) 2012 Timo Tiuraniemi
#
#  This file is part of Troika.
#
#  Troika is free software; you can redistribute it and/or modify
#  it under the terms of the GNU Affero General Public License as published
#  by the Free Software Foundation, either version 3 of the License, or
#  (at your option) any later version.
#
#  This program is distributed in the hope that it will be useful,
#  but WITHOUT ANY WARRANTY; without even the implied warranty of
#  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#  GNU Affero General Public License for more details.
#
#  You should have received a copy of the GNU Affero General Public License
#  along with this program; if not, see http://www.gnu.org/licenses
#

'''
Created on 15.8.2012

@author: ttiurani
'''
from troikalearning import app
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import Enum, or_, desc, text
from datetime import datetime

# To Create tables change this:
DB_DNS = None
#
# to something like:
#
# DB_DNS = 'mysql://tl:tlpwd@localhost/tldev'
#
# and run in a Python interpreter:
# >> from troikalearning.backend import db
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

class Area(db.Model):
    # Identification fields
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(128), unique=True, nullable=False)
    # TODO: Geolocation info   

class Campus(db.Model):
    # Identification fields
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(128), unique=True, nullable=False)
    # Area
    area_id = db.Column(db.Integer, db.ForeignKey('area.id'), nullable=True)
    # TODO: Geolocation info

    # Relationships
    area = db.relationship('Area', backref='campuses')

class User(db.Model):

    # Identification fields
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(128), unique=True, nullable=False)
    
    # Security fields
    role = db.Column(Enum('admin', 'user', name='role'), unique=False, nullable=False)
    password = db.Column(db.String(80), unique=False, nullable=False)
    password_reset_key = db.Column(db.String(32), unique=False, nullable=True)
    password_reset_expire = db.Column(db.DateTime, unique=False, nullable=True)

    # Location and language
    # ISO 3166-1 alpha-2 country code
    country = db.Column(db.String(2), unique=False, nullable=True)
    # ISO 3166-2 region code in the country
    region = db.Column(db.String(3), unique=False, nullable=True)
    # Area
    area_id = db.Column(db.Integer, db.ForeignKey('area.id'), nullable=True)
    # Campus
    campus_id = db.Column(db.Integer, db.ForeignKey('campus.id'), nullable=True)
    
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
    
    # Alias to use for public records. User name type field used, if user 
    # does not want to use her real name in public information. 
    alias = db.Column(db.String(512), unique=False, nullable=True)

    # Relationships
    area = db.relationship('Area', backref='users')
    campus = db.relationship('Campus', backref='users')    
    
troikas_users = db.Table('troikas_users',
    db.Column('troika_id', db.Integer, db.ForeignKey('troika.id')),
    db.Column('user_id', db.Integer, db.ForeignKey('user.id'))
)

class Troika(db.Model):
    
    # Identification fields
    id = db.Column(db.Integer, primary_key=True)

    # Phase of Troika: NOTE: there is no "completed"
    # phase in the database because that would
    # require some sort of polling of end_time.
    created =  db.Column(db.DateTime, unique=False, nullable=False, default=datetime.now())
    pended =  db.Column(db.DateTime, unique=False, nullable=True)
    activated =  db.Column(db.DateTime, unique=False, nullable=True)

    # Description
    title = db.Column(db.String(512), unique=False, nullable=False)
    description = db.Column(db.String(10000), unique=False, nullable=True)

    # Location and language
    # Location is either given with country+(region+)address or
    # with area+address, or with campus+address
    # ISO 3166-1 alpha-2 country code
    country = db.Column(db.String(2), unique=False, nullable=True)
    # ISO 3166-2 region code in the country
    region = db.Column(db.String(3), unique=False, nullable=True)
    # Area
    area_id = db.Column(db.Integer, db.ForeignKey('area.id'), nullable=True)
    # Campus
    campus_id = db.Column(db.Integer, db.ForeignKey('campus.id'), nullable=True)
    # Street address, needs to be possible to find with e.g. Google Maps
    address = db.Column(db.String(512), unique=False, nullable=True)   
    # Street address addendum, such as "room 123"
    address_addendum = db.Column(db.String(512), unique=False, nullable=True)   

    # ISO-3166-2 two letter language code
    language = db.Column(db.String(2), unique=False, nullable=True)
    
    # Time
    start_time = db.Column(db.DateTime, unique=False, nullable=True)
    end_time = db.Column(db.DateTime, unique=False, nullable=True)

    # Participation limit, minimum is 3
    max_participants = db.Column(db.Integer, unique=False, nullable=True)

    # Users involved
    creator_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    lead_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    first_learner_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    second_learner_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    
    # Relationships
    area = db.relationship('Area', backref='troikas',
                                lazy='joined')
    campus = db.relationship('Campus', backref='troikas',
                                lazy='joined')    
    creator = db.relationship('User', backref='created_troikas',
                              primaryjoin="User.id==Troika.creator_id",
                              lazy='joined')
    lead = db.relationship('User', backref='lead_troikas',
                              primaryjoin="User.id==Troika.lead_id",
                                lazy='joined')
    first_learner = db.relationship('User', backref='first_learner_troikas',
                              primaryjoin="User.id==Troika.first_learner_id",
                                lazy='joined')
    second_learner = db.relationship('User', backref='second_learner_troikas',
                              primaryjoin="User.id==Troika.second_learner_id",
                                lazy='joined')
    # The rest of the users involved
    participants = db.relationship('User', secondary=troikas_users,
        backref=db.backref('participated_troikas', lazy='dynamic'))

    def get_phase(self):
        if self.activated is not None:
            if datetime.now() > self.activated:
                if datetime.now() < self.end_time:
                    return 'active'
                else:
                    return 'complete'
        if self.pended is not None:
            return 'pending_huddle'
        return 'pending'

class Feedback(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    created =  db.Column(db.DateTime, unique=False, nullable=False, default=datetime.now())
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    description = db.Column(db.String(10000), unique=False, nullable=False)

    user = db.relationship('User', backref='feedbacks',
                                lazy='joined')

# Methods

def get_troika(troika_id):
    return Troika.query.filter_by(id=troika_id).first()

def get_active_troikas(index=0, max_entries=50):
    return Troika.query.filter(Troika.activated != None) \
                       .filter(Troika.end_time > datetime.now()) \
                       .order_by(Troika.start_time).limit(max_entries).all()
def get_pending_troikas(index=0, max_entries=50):
    return Troika.query.filter(Troika.activated == None) \
                       .order_by(text('CASE when start_time is null then 1 else 0 end, start_time')) \
                       .limit(max_entries).all()
def get_completed_troikas(index=0, max_entries=50):
    return Troika.query.filter(Troika.activated != None) \
                       .filter(Troika.end_time < datetime.now()) \
                       .order_by(desc(Troika.start_time)).limit(max_entries).all()
def get_user(email):
    if email is None:
        return None
    return User.query.filter_by(email=email).first()

def user_exists(email = None, alias = None):
    user = None
    if email is None:
        if alias is None:
            return False
        user = User.query.filter_by(alias=alias).first()
    elif alias is not None:
        user = User.query.filter(or_(User.email == email, User.alias == alias)).first()
    else:
        user = User.query.filter_by(email=email).first()
    if user is not None:
        return True
    return False

def save_user(user):
    db.session.add(user)
    db.session.commit()

def save_troika(troika):
    db.session.add(troika)
    db.session.commit()

def delete_troika(troika):
    db.session.delete(troika)
    db.session.commit()

def save_feedback(feedback):
    db.session.add(feedback)
    db.session.commit()
    
def get_feedback(index=0, max_entries=500):
    return Feedback.query.order_by(desc(Feedback.created)).limit(max_entries).all()
