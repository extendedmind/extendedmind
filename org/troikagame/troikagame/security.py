'''
Created on 14.8.2012

@author: ttiurani
'''

from troikagame.backend import User, save_user, get_user
from passlib.hash import sha256_crypt
from flask import flash
import os

def validate_login(email, password):
    # First get the user from the backend based on email
    user = get_user(email)
    if user is not None:
        if (__validate_password(password, user.password)):
            return True
    return False

def register(first_name, last_name, handle, email, password):
    hash = hash_password(password)
    user = User(email=email, role='user', 
             password=hash,
             country='FI', region='18', preferred_language='fi',
             full_name=first_name + " " + last_name, short_name=first_name, 
             given_names=first_name, family_name=last_name)
    save_user(user)
    
def hash_password(password):
    return sha256_crypt.encrypt(password)

def get_troika_access_right(user, troika):
    access = False
    if user.role == 'admin':
        # Admin can always do anything he wants
        access = 'delete'
    elif troika.get_phase() is not 'complete':
        if user == troika.creator:
            # Creator can delete non-completed Troikas
            access = 'delete'
        elif user == troika.teacher:
            # Teacher can edit Troika contents
            access = 'edit'
    return access

def activatable(user, troika, activatable_before_three):

    if ((user.role == "admin" or troika.teacher is user) and  
        troika.address is not None and 
        troika.start_time is not None and 
        troika.end_time is not None and 
        troika.max_participants is not None and
        troika.activated is None):
        
        if activatable_before_three or user.role == "admin":
            return True
        else:
            # Also make sure there are three participants
            if (troika.first_learner is not None and
                troika.second_learner is not None):
                return True

    return False

def __validate_password(plain_password, password_hash):
    return sha256_crypt.verify(plain_password, password_hash)

def __generate_reload_token():
    return os.urandom(32);

def __hash_password():
    return '';
