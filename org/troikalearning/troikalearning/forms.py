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
Created on 10.10.2012

@author: ttiurani
'''
from flask_wtf import Form, IntegerField, RadioField, \
                      DateField, TextField, TextAreaField, PasswordField,  \
                      HiddenField, SelectField
from wtforms import validators
from troikalearning import __

class RegistrationForm(Form):
    first_name = TextField(__(u"First Name *"), [
        validators.Required(),
        validators.Length(max=128)])
    last_name = TextField(__(u"Last Name *"), [
        validators.Required(),
        validators.Length(max=128)])
    alias = TextField(__(u"Alias"), [validators.Length(max=512)])
    email = TextField(__(u"Email Address *"), [
        validators.Required(),
        validators.email(message=__(u"Not a valid email address"))])
    password = PasswordField(__(u"Password *"), [
        validators.Required(),
        validators.EqualTo('confirm', message=__(u"Passwords must match"))])
    confirm = PasswordField(__(u"Repeat Password *"))

class LoginForm(Form):
    email = TextField(__(u"Email Address *"), [
        validators.Required(),
        validators.email(__(u"Not a valid email address"))])
    password = PasswordField(__(u"Password *"), [
        validators.Required()])

class UserForm(Form):
    first_name = RegistrationForm.first_name
    last_name = RegistrationForm.last_name
    alias = RegistrationForm.alias
    email = RegistrationForm.email
    new_password = PasswordField(__(u"New Password"), [
        validators.EqualTo('new_confirm', message=__(u"Passwords must match"))])
    new_confirm = PasswordField(__(u"Repeat New Password"))
    password = PasswordField(__(u"Current Password *"), [
        validators.Required()])

class TroikaForm(Form):
    title = TextField(__(u"Title *"), [
        validators.Required(),
        validators.Length(max=512)])
    description = TextAreaField(__(u"Description *"), [
        validators.Required(),
        validators.Length(max=10000)])
    language = SelectField(__(u"Language"), [
        validators.Optional(),
        validators.Length(max=2, min=2)],
        choices=[('fi', __(u"Finnish")), ('en', __(u"English")), ('se', __(u"Swedish"))])
    address = TextField(__(u"Address"), [
        validators.Length(max=512)])
    address_addendum = TextField(__(u"Address Addendum"), [
        validators.Length(max=512)])
    start_date = DateField(__(u"Start Date"), [validators.Optional()])
    start_time_hours = IntegerField(__(u"Start Time (hours, minutes)"),[
        validators.Optional(),
        validators.number_range(min=0, max=23, message=__(u"Hours must be between 0 and 23"))])
    start_time_minutes = IntegerField(__(u"Start Time (min)"),[
        validators.Optional(),
        validators.number_range(min=0, max=59, message=__(u"Minutes must be between 0 and 59"))])
    duration = IntegerField(__(u"Duration (min)"), [
        validators.Optional(),
        validators.number_range(min=1, message=__(u"Troika has to last at least one minute"))])
    max_participants = IntegerField(__(u"Max Participants"), [
        validators.Optional(),
        validators.number_range(min=3, message=__(u"Minumum of three participants"))])
    creator_role = RadioField(__(u"Your role in the Troika"), choices=[
        ('lead', __(u"I will lead this")), 
        ('learner', __(u"I want someone else to lead this"))],
        default='lead')
    
class FeedbackForm(Form):
    description = TextAreaField(__(u"Share us your thoughts on Troika. What do you like? What could be improved?"), [
        validators.Required(),
        validators.Length(max=10000)])
    
class LanguageForm(Form):
    language = SelectField(choices=[
        ('en', 'English'), 
        ('fi', 'Suomi')])

class InviteForm(Form):
    role = HiddenField(__(u"Role"), [validators.Length(min=1, max=1)])
    troika_id = HiddenField(__(u"Troika Id"), [validators.Required()])
    email = TextField(__(u"Email Address"), [validators.Required(),
        validators.email(message=__(u"Not a valid email address"))])
    