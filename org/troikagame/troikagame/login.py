'''
Created on 14.8.2012

@author: ttiurani
'''

from troikagame import backend

def do_the_login(email, password):
    if(backend.validate_email_password(email, password)):
        return 'Login OK'
    else:
        return 'Login Failed'

def show_the_login_form():
    return 'Login form'