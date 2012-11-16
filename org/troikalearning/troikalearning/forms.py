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
                      validators, HiddenField 
from flaskext.babel import gettext

class RegistrationForm(Form):
    first_name = TextField(gettext(u"First Name") + ' *', [
        validators.Required(),
        validators.Length(max=128)])
    last_name = TextField(gettext(u"Last Name") + ' *', [
        validators.Required(),
        validators.Length(max=128)])
    alias = TextField(gettext(u"Alias"), [validators.Length(max=512)])
    email = TextField(gettext(u"Email Address") + ' *', [
        validators.Required(),
        validators.email(gettext(u"Not a valid email address"))])
    password = PasswordField(gettext(u"Password") + ' *', [
        validators.Required(),
        validators.EqualTo('confirm', message=gettext(u"Passwords must match"))])
    confirm = PasswordField(gettext(u"Repeat Password") + ' *')

class LoginForm(Form):
    email = TextField(gettext(u"Email Address") + ' *', [
        validators.Required(),
        validators.email(gettext(u"Not a valid email address"))])
    password = PasswordField(gettext(u"Password") + ' *', [
        validators.Required()])

class UserForm(Form):
    first_name = RegistrationForm.first_name
    last_name = RegistrationForm.last_name
    alias = RegistrationForm.alias
    email = RegistrationForm.email
    new_password = PasswordField(gettext(u"New Password"), [
        validators.EqualTo('new_confirm', message=gettext(u"Passwords must match"))])
    new_confirm = PasswordField(gettext(u"Repeat New Password"))
    password = PasswordField(gettext(u"Current Password") + ' *', [
        validators.Required()])

class TroikaForm(Form):
    title = TextField(gettext(u"Title") + ' *', [
        validators.Required(),
        validators.Length(max=512)])
    description = TextAreaField(gettext(u"Description") + ' *', [
        validators.Required(),
        validators.Length(max=10000)])
    address = TextField(gettext(u"Address"), [
        validators.Length(max=512)])
    address_addendum = TextField(gettext(u"Address Addendum"), [
        validators.Length(max=512)])
    start_date = DateField(gettext(u"Start Date"), [validators.Optional()])
    start_time_hours = IntegerField(gettext(u"Start Time (hours, minutes)"),[
        validators.Optional(),
        validators.number_range(min=0, max=23, message=gettext(u"Hours must be between 0 and 23"))])
    start_time_minutes = IntegerField(gettext(u"Start Time (min)"),[
        validators.Optional(),
        validators.number_range(min=0, max=59, message=gettext(u"Minutes must be between 0 and 59"))])
    duration = IntegerField(gettext(u"Duration (min)"), [
        validators.Optional(),
        validators.number_range(min=1, message=gettext(u"Troika has to last at least one minute"))])
    max_participants = IntegerField(gettext(u"Max Participants"), [
        validators.Optional(),
        validators.number_range(min=3, message=gettext(u"Minumum of three participants"))])
    creator_role = RadioField(gettext(u"Your role in the Troika"), choices=[
        ('lead', gettext(u"I will lead this")), 
        ('learner', gettext(u"I want someone else to lead this."))],
        default='lead')
    
class FeedbackForm(Form):
    description = TextAreaField(gettext(u"Share us your thoughts on Troika. What do you like? What could be improved?"), [
        validators.Required(),
        validators.Length(max=10000)])
