'''
Created on 14.8.2012

@author: ttiurani
'''
from troikagame import app
from security import validate_login
from backend import Troika
from flask import request, session, flash, redirect, url_for, render_template

@app.route('/about')
def about():
    return 'About'

@app.route('/user/<username>')
def show_user_profile(username):
    # show the user profile for that user
    return 'User %s' % username

@app.route('/')
def show_troikas():
    troikas = Troika.query.order_by(Troika.start_time).limit(10).all()
    entries = [dict(start_time=troika.start_time, 
                    title=troika.title, 
                    description=troika.description) 
               for troika in troikas]
    return render_template('show_troikas.html', entries=entries)

@app.route('/login', methods=['GET', 'POST'])
def login():
    error = None
    if request.method == 'POST':
        if (validate_login(request.form['email'], request.form['password'])):
            session['logged_in'] = True
            flash('You were logged in')
            return redirect(url_for('show_troikas'))
        else:
            error = 'Invalid email/password'
  
    return render_template('login.html', error=error)


@app.route('/logout')
def logout():
    session.pop('logged_in', None)
    flash('You were logged out')
    return redirect(url_for('show_troikas'))
