#  Copyright © 2012 Timo Tiuraniemi
#
#  This file is part of Troika Game.
#
#  Troika Game is free software; you can redistribute it and/or modify
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
Created on 10.10.2012

@author: ttiurani
'''
from flask_wtf import Form, IntegerField, BooleanField, \
                      DateField, DateTimeField, TextField, TextAreaField, PasswordField,  \
                      validators 

class RegistrationForm(Form):
    first_name = TextField('First Name *', [
        validators.Required(),
        validators.Length(max=128)])
    last_name = TextField('Last Name *', [
        validators.Required(),
        validators.Length(max=128)])
    handle = TextField('Alias', [validators.Length(max=512)])
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
    handle = TextField('Alias', [validators.Length(max=512)])
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
    description = TextAreaField('Description *', [
        validators.Required(),
        validators.Length(max=10000)])
    address = TextField('Address', [
        validators.Length(max=512)])
    address_addendum = TextField('Address Addendum', [
        validators.Length(max=512)])
    start_date = DateField('Start Date', [validators.Optional()])
    start_time_hours = IntegerField('Start Time (hours, minutes)',[
        validators.Optional(),
        validators.number_range(min=0, max=23, message="Hours must be between 0 and 23")])
    start_time_minutes = IntegerField('Start Time (min)',[
        validators.Optional(),
        validators.number_range(min=0, max=59, message="Minutes must be between 0 and 59")])
    duration = IntegerField('Duration (min)', [
        validators.Optional(),
        validators.number_range(min=1, message="Troika has to last at least one minute")])
    max_participants = IntegerField('Max Participants', [
        validators.Optional(),
        validators.number_range(min=3, message="Minumum of three participants")])
    creator_is_teacher = BooleanField('I will lead this')
