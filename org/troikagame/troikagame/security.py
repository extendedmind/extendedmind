'''
Created on 14.8.2012

@author: ttiurani
'''

from troikagame.backend import User
from passlib.hash import sha256_crypt
import os

def validate_login(email, password):
    # First get the user from the database based on email
    user = User.query.filter_by(email=email).first()
    if (__validate_password(password, user.password)):
        return True
    else:
        return False

def hash_password(password):
    return sha256_crypt.encrypt

def __validate_password(plain_password, password_hash):
    return sha256_crypt.verify(plain_password, password_hash)

def __generate_reload_token():
    return os.urandom(32);

def __hash_password():
    return '';
