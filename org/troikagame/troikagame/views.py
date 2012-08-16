'''
Created on 14.8.2012

@author: ttiurani
'''
from troikagame import app
from login import do_the_login, show_the_login_form
from flask import request

@app.route('/')
def home():
    return 'Home'

@app.route('/about')
def about():
    return 'About'

@app.route('/user/<username>')
def show_user_profile(username):
    # show the user profile for that user
    return 'User %s' % username

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        return do_the_login(
            request.form['email'],
            request.form['password'])
    else:
        return show_the_login_form()
