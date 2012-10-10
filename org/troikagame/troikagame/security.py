'''
Created on 14.8.2012

@author: ttiurani
'''

from troikagame.backend import User, save_user, get_user
from passlib.hash import sha256_crypt
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

def __validate_password(plain_password, password_hash):
    return sha256_crypt.verify(plain_password, password_hash)

def __generate_reload_token():
    return os.urandom(32);

def __hash_password():
    return '';
