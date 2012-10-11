'''
Created on 14.8.2012

@author: ttiurani
'''
from troikagame import app
from security import validate_login, register, hash_password
from backend import *
from forms import *
from flask import request, session, flash, redirect, url_for, render_template

@app.route('/about')
def about():
    return render_template('about.html')

@app.route('/user/<email>')
def show_user_profile(email):
    # show the user profile for that user
    return 'User %s' % email


@app.route('/')
def show_troikas():
    active_troikas = get_active_troikas()
    active_entries = [dict(id=active_troika.id,
                        start_time=active_troika.start_time, 
                        title=active_troika.title, 
                        description=active_troika.description) 
               for active_troika in active_troikas]
    pending_troikas = get_pending_troikas()
    pending_entries = [dict(id=pending_troika.id,
                        start_time=pending_troika.start_time, 
                        title=pending_troika.title, 
                        description=pending_troika.description) 
               for pending_troika in pending_troikas]
    completed_troikas = get_completed_troikas()
    completed_entries = [dict(id=completed_troika.id,
                        start_time=completed_troika.start_time, 
                        title=completed_troika.title, 
                        description=completed_troika.description) 
               for completed_troika in completed_troikas]
    return render_template('show_troikas.html', 
                           active_entries=active_entries,
                           pending_entries=pending_entries,
                           completed_entries=completed_entries)

@app.route('/login', methods=['GET', 'POST'])
def login():
    loginerrors = []
    regerrors = []
    regform = RegistrationForm(prefix="register")
    loginform = LoginForm(prefix="login")
    if loginform.email.data and loginform.validate_on_submit():
        if (validate_login(loginform.email.data, loginform.password.data)):
            session['logged_in'] = True
            session['email'] = loginform.email.data
            flash('You were logged in')
            return redirect(url_for('show_troikas'))
        else:
            loginerrors.append('Invalid email/password')
    if loginform.errors:
        for key, value in loginform.errors.items():
            loginerrors.append(key + ': ' + value[0])
    if regform.email.data and regform.validate_on_submit():
        register(regform.first_name.data, regform.last_name.data,
                 regform.handle.data, regform.email.data, 
                 regform.password.data);
        session['logged_in'] = True
        session['email'] = regform.email.data
        flash('Registration successful, you were logged in')
        return redirect(url_for('show_troikas'))
    if regform.errors:
        for key, value in regform.errors.items():
            regerrors.append(key + ': ' + value[0])

    return render_template('login.html', loginform=loginform, regform=regform, 
                           loginerrors=loginerrors, regerrors=regerrors)

@app.route('/user', methods=['GET', 'POST'])
def user():
    if not 'logged_in' in session:
        flash('You need to login first')
        return redirect(url_for('login'))
    usererrors = []
    userform = UserForm(prefix="user")
    user = get_user(session['email'])
    if request.method == 'GET':
        # Add default values
        userform.email.data = user.email
        userform.first_name.data = user.short_name
        userform.last_name.data = user.family_name
        userform.handle.data = user.handle
    elif userform.validate_on_submit(): 
        if (validate_login(session['email'], userform.password.data)):
            # Update info
            user.email = userform.email.data
            user.short_name = userform.first_name.data 
            user.family_name = userform.last_name.data
            user.full_name = userform.first_name.data + " " + userform.last_name.data
            user.handle = userform.handle.data
            if (userform.new_password.data):
                user.password = hash_password(userform.new_password.data)
            save_user(user)
            flash('Information updated')
        else:
            usererrors.append('Invalid password')
    if userform.errors:
        for key, value in userform.errors.items():
            usererrors.append(key + ': ' + value[0])

    return render_template('user.html', userform=userform, usererrors=usererrors)

@app.route('/troika/<troika_id>')
def show_troika_details(troika_id):
    troika = get_troika(troika_id);
    entry = {'id': troika.id,
             'phase': troika.get_phase(),
             'title': troika.title, 
             'description': troika.description,
             'address': troika.address,
             'address_addendum': troika.address_addendum,
             'start_time': troika.start_time,
             'end_time': troika.end_time,
             'max_participants': troika.max_participants,
             'teacher': troika.teacher.full_name if troika.teacher != None else None,
             'first_learner': troika.first_learner.full_name if troika.first_learner != None else None,
             'second_learner': troika.second_learner.full_name if troika.second_learner != None else None,
             'participants': [dict(id=participant.id,
                                full_name=participant.full_name) 
                                for participant in troika.participants] if troika.participants != None else None
             }

    # show the troika with the given id
    return render_template('show_troika_details.html', 
                           entry=entry)

@app.route('/troika/<troika_id>/edit', methods=['GET', 'POST'])
def troika(troika_id):
    if not 'logged_in' in session:
        flash('You need to login first')
        return redirect(url_for('login'))
    troikaerrors = []
    troikaform = TroikaForm(prefix="troika")
    troika = get_troika(troika_id);
    if request.method == 'GET':
        # Add default values
        troikaform.title.data = troika.title
        troikaform.description.data = troika.description
        troikaform.address.data = troika.address
        troikaform.address_addendum.data = troika.address_addendum
        troikaform.start_time.data = troika.start_time
        troikaform.end_time.data = troika.end_time
        troikaform.max_participants.data = troika.max_participants
    elif troikaform.validate_on_submit(): 
        if (validate_login(session['email'], troikaform.password.data)):
            # Update info
            troika.title = troikaform.title.data
            troika.description = troikaform.description.data 
            troika.address = troikaform.address.data
            troika.address_addendum = troikaform.address_addendum.data
            troika.start_time = troikaform.start_time.data
            troika.end_time = troikaform.end_time.data
            troika.max_participants = troikaform.max_participants.data
            save_troika(troika)
            flash('Troika saved')
        else:
            troikaerrors.append('Invalid password')
    if troikaform.errors:
        for key, value in troikaform.errors.items():
            troikaerrors.append(key + ': ' + value[0])

    return render_template('troika.html', troikaform=troikaform, troikaerrors=troikaerrors)


@app.route('/logout')
def logout():
    session.pop('logged_in', None)
    flash('You were logged out')
    return redirect(url_for('show_troikas'))
