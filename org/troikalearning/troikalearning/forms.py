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
from troikalearning import _

class RegistrationForm(Form):
    first_name = TextField(_(u"First Name") + ' *', [
        validators.Required(),
        validators.Length(max=128)])
    last_name = TextField(_(u"Last Name") + ' *', [
        validators.Required(),
        validators.Length(max=128)])
    alias = TextField(_(u"Alias"), [validators.Length(max=512)])
    email = TextField(_(u"Email Address") + ' *', [
        validators.Required(),
        validators.email(message=_(u"Not a valid email address"))])
    password = PasswordField(_(u"Password") + ' *', [
        validators.Required(),
        validators.EqualTo('confirm', message=_(u"Passwords must match"))])
    confirm = PasswordField(_(u"Repeat Password") + ' *')

class LoginForm(Form):
    email = TextField(_(u"Email Address") + ' *', [
        validators.Required(),
        validators.email(_(u"Not a valid email address"))])
    password = PasswordField(_(u"Password") + ' *', [
        validators.Required()])

class UserForm(Form):
    first_name = RegistrationForm.first_name
    last_name = RegistrationForm.last_name
    alias = RegistrationForm.alias
    email = RegistrationForm.email
    new_password = PasswordField(_(u"New Password"), [
        validators.EqualTo('new_confirm', message=_(u"Passwords must match"))])
    new_confirm = PasswordField(_(u"Repeat New Password"))
    password = PasswordField(_(u"Current Password") + ' *', [
        validators.Required()])

class TroikaForm(Form):
    title = TextField(_(u"Title") + ' *', [
        validators.Required(),
        validators.Length(max=512)])
    description = TextAreaField(_(u"Description") + ' *', [
        validators.Required(),
        validators.Length(max=10000)])
    address = TextField(_(u"Address"), [
        validators.Length(max=512)])
    address_addendum = TextField(_(u"Address Addendum"), [
        validators.Length(max=512)])
    start_date = DateField(_(u"Start Date"), [validators.Optional()])
    start_time_hours = IntegerField(_(u"Start Time (hours, minutes)"),[
        validators.Optional(),
        validators.number_range(min=0, max=23, message=_(u"Hours must be between 0 and 23"))])
    start_time_minutes = IntegerField(_(u"Start Time (min)"),[
        validators.Optional(),
        validators.number_range(min=0, max=59, message=_(u"Minutes must be between 0 and 59"))])
    duration = IntegerField(_(u"Duration (min)"), [
        validators.Optional(),
        validators.number_range(min=1, message=_(u"Troika has to last at least one minute"))])
    max_participants = IntegerField(_(u"Max Participants"), [
        validators.Optional(),
        validators.number_range(min=3, message=_(u"Minumum of three participants"))])
    creator_role = RadioField(_(u"Your role in the Troika"), choices=[
        ('lead', _(u"I will lead this")), 
        ('learner', _(u"I want someone else to lead this."))],
        default='lead')
    
class FeedbackForm(Form):
    description = TextAreaField(_(u"Share us your thoughts on Troika. What do you like? What could be improved?"), [
        validators.Required(),
        validators.Length(max=10000)])
    
class LanguageForm(Form):
    language = SelectField(choices=[
        ('en', 'English'), 
        ('fi', 'Suomi')])

class InviteForm(Form):
    role = HiddenField(_(u"Role"), [validators.Length(min=1, max=1)])
    troika_id = HiddenField(_(u"Troika Id"), [validators.Required()])
    email = TextField(_(u"Email Address"), [validators.Required(),
        validators.email(message=_(u"Not a valid email address"))])
    