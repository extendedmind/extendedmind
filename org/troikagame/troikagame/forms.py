'''
Created on 10.10.2012

@author: ttiurani
'''
from flask_wtf import Form, TextField, PasswordField, validators 

class RegistrationForm(Form):
    first_name = TextField('First Name *', [
        validators.Required(),
        validators.Length(max=128)])
    last_name = TextField('Last Name *', [
        validators.Required(),
        validators.Length(max=128)])
    handle = TextField('Handle', [validators.Length(max=512)])
    email = TextField('Email Address *', [
        validators.Required(),
        validators.email('Not a valid email address')])
    password = PasswordField('Password *', [
        validators.Required(),
        validators.EqualTo('confirm', message='Passwords must match')])
    confirm = PasswordField('Repeat Password *')

class LoginForm(Form):
    email = TextField('Email Address *', [
        validators.Required(),
        validators.email('Not a valid email address')])
    password = PasswordField('Password *', [
        validators.Required()])
