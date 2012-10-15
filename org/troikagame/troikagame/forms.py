'''
Created on 10.10.2012

@author: ttiurani
'''
from flask_wtf import Form, IntegerField, BooleanField, \
                      DateField, DateTimeField, TextField, PasswordField,  \
                      validators 

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

class UserForm(Form):
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
    new_password = PasswordField('New Password', [
        validators.EqualTo('new_confirm', message='Passwords must match')])
    new_confirm = PasswordField('Repeat New Password')
    password = PasswordField('Current Password *', [
        validators.Required()])

class TroikaForm(Form):
    title = TextField('Title *', [
        validators.Required(),
        validators.Length(max=512)])
    description = TextField('Description *', [
        validators.Required(),
        validators.Length(max=10000)])
    address = TextField('Address', [
        validators.Length(max=512)])
    address_addendum = TextField('Address Addendum', [
        validators.Length(max=512)])
    start_date = DateField('Start Date', [validators.Optional()])
    start_time = TextField('Start Time', [validators.Optional()])
    duration = IntegerField('Duration (min)', [
        validators.Optional(),
        validators.number_range(min=1, message="Troika has to last at least one minute")])
    max_participants = IntegerField('Max Participants', [
        validators.Optional(),
        validators.number_range(min=3, message="Minumum of three participants")])
    creator_is_teacher = BooleanField('I will teach this')
