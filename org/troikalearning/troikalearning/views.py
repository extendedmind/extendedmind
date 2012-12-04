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
Created on 14.8.2012

@author: ttiurani
'''
from troikalearning import app, mail, babel, _
from security import validate_login, register, hash_password, get_troika_access_right, activatable, \
                     get_redirect_target
from backend import Troika, get_active_troikas, get_pending_troikas, get_completed_troikas, \
                    user_exists, get_user, save_user, get_troika, save_troika, delete_troika, \
                    Feedback, save_feedback, get_feedback
from forms import LoginForm, RegistrationForm, TroikaForm, UserForm, FeedbackForm, LanguageForm, InviteForm
from flask import request, session, flash, redirect, url_for, render_template
from datetime import datetime
from datetime import time as dttime
from datetime import timedelta as dttimedelta
from flask_mail import Message
import re

# Language Selection

@babel.localeselector
def get_locale():
    # if a user is logged in, use the locale from the user settings
    if 'language' in session:
        return session['language']
    # otherwise try to guess the language from the user accept
    # header the browser transmits. The best match wins.
    return request.accept_languages.best_match(['fi', 'en'])

@babel.timezoneselector
def get_timezone():
    if 'timezone' in session:
        return session['timezone']
    return 'Europe/Helsinki'

@app.context_processor
def inject_language_form():
    langform = LanguageForm(prefix="language")
    langform.language.data = get_locale()
    return dict(langform=langform);

@app.route('/language', methods=['POST'])
def change_language():
    langform = LanguageForm(prefix="language")
    if langform.validate():
        if not 'language' in session or session['language'] != langform.language.data:
            session['language'] = langform.language.data
            # Also change the user language in the database, to make the change persistent
            if 'email' in session: 
                user = get_user(session['email'])
                user.preferred_language = session['language']
                save_user(user)
    else:
        flash(_(u'Invalid language form: ' + ', '.join((key + ': ' + value[0]) for key, value in langform.errors.items())), 'error')
    return redirect(get_redirect_target())

# Main pages

@app.route('/about', methods=['GET'])
def about():
    return render_template('about.html')

@app.route('/')
def troikas():    
    active_troikas = get_active_troikas()
    active_entries = [dict(id=active_troika.id,
                        start_time=__get_formatted_datetime(active_troika.start_time,"%d.%m.%Y %H:%M"), 
                        title=active_troika.title, 
                        description=active_troika.description) 
               for active_troika in active_troikas]
    pending_troikas = get_pending_troikas()
    pending_entries = [dict(id=pending_troika.id,
                        start_time=__get_formatted_datetime(pending_troika.start_time,"%d.%m.%Y %H:%M"), 
                        title=pending_troika.title, 
                        description=pending_troika.description) 
               for pending_troika in pending_troikas]
    completed_troikas = get_completed_troikas()
    completed_entries = [dict(id=completed_troika.id,
                        start_time=__get_formatted_datetime(completed_troika.start_time,"%d.%m.%Y %H:%M"), 
                        title=completed_troika.title, 
                        description=completed_troika.description) 
               for completed_troika in completed_troikas]
    return render_template('troikas.html', 
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
        user = validate_login(loginform.email.data, loginform.password.data)
        if (user != False):
            session['email'] = user.email
            session['language'] = user.preferred_language
            flash(_(u'You were logged in'))
            destination = url_for('troikas')
            if 'destination' in session:
                destination = session['destination']
                session.pop('destination', None)
            return redirect(destination)
        else:
            loginerrors.append(_(u'Invalid email/password'))
    if loginform.errors:
        for key, value in loginform.errors.items():
            loginerrors.append(key + ': ' + value[0])
    if regform.email.data and regform.validate_on_submit():
        if (user_exists(email=regform.email.data, alias=regform.alias.data)):
            regerrors.append(_(u'User with given email or alias already exists'))
        else:
            if regform.alias.data == "": regform.alias.data = None    
            register(regform.first_name.data, regform.last_name.data,
                     regform.alias.data, regform.email.data, 
                     regform.password.data);
            session['email'] = regform.email.data
            flash(_(u'Registration successful, you were logged in'))
            destination = url_for('troikas')
            if 'destination' in session:
                destination = session['destination']
                session.pop('destination', None)
            return redirect(destination)
    if regform.errors:
        for key, value in regform.errors.items():
            regerrors.append(key + ': ' + value[0])

    return render_template('login.html', loginform=loginform, regform=regform, 
                           loginerrors=loginerrors, regerrors=regerrors)

def __check_login(destination = None, url = None):
    if not 'email' in session:
        if url is None:
            url = url_for(destination)
        flash(_(u'You need to login or register first'))
        session['destination'] = url
        return url_for('login')
    return False

@app.route('/login/<troika_id>', methods=['GET'])
def login_troika(troika_id):
    # Login using
    session['destination'] = url_for('troika', troika_id = troika_id)
    return redirect(url_for('login'))

@app.route('/user', methods=['GET', 'POST'])
def user():
    url = __check_login('user')
    if url: return redirect(url)
    usererrors = []
    userform = UserForm(prefix="user")
    user = get_user(session['email'])
    if request.method == 'GET':
        # Add default values
        userform.email.data = user.email
        userform.first_name.data = user.short_name
        userform.last_name.data = user.family_name
        userform.alias.data = user.alias
    elif userform.validate_on_submit(): 
        if (validate_login(session['email'], userform.password.data)):
            # Update info
            user.email = userform.email.data
            user.short_name = userform.first_name.data 
            user.family_name = userform.last_name.data
            user.full_name = userform.first_name.data + " " + userform.last_name.data
            if userform.alias.data == "": userform.alias.data = None    
            user.alias = userform.alias.data
            if (userform.new_password.data):
                user.password = hash_password(userform.new_password.data)
            save_user(user)
            flash(_(u'Information updated'))
        else:
            usererrors.append(_(u'Invalid password'))
    if userform.errors:
        for key, value in userform.errors.items():
            usererrors.append(key + ': ' + value[0])

    return render_template('user.html', userform=userform, usererrors=usererrors)

def __participating(user, troika):
    if user == None:
        return False
    if user == troika.lead:
        return 'lead'
    if user == troika.first_learner:
        return 'first_learner'
    if user == troika.second_learner:
        return 'second_learner'
    if troika.get_phase() != 'complete' and user in troika.participants:
        return 'participant'
    return False

def __is_full(troika):
    if troika.max_participants is not None and \
        troika.lead is not None and \
        troika.first_learner is not None and \
        troika.second_learner is not None and \
        troika.participants is not None and \
        len(troika.participants) >= (troika.max_participants - 3):
        return True
    return False

def __get_display_name(user):
    if user.alias is not None:
        return user.alias
    return user.full_name

@app.route('/troika/<troika_id>')
def troika(troika_id):
    troika = get_troika(troika_id);
    access=False
    activate=False
    user = None
    if 'email' in session:
        user = get_user(session['email'])
        access = get_troika_access_right(user, troika)
        activate = activatable(user, troika, app.config.get('ACTIVATABLE_BEFORE_THREE'))
    
    troikaform = TroikaForm(language=troika.language)
    language_name = [item for item in troikaform.language.choices if item[0] == troika.language][0][1]
    entry = {'access': access,
             'activate': activate,
             'id': troika.id,
             'phase': troika.get_phase(),
             'title': troika.title, 
             'description': troika.description,
             'address': troika.address,
             'address_addendum': troika.address_addendum,
             'language': language_name,
             'start_time': __get_formatted_datetime(troika.start_time,"%d.%m.%Y %H:%M"),
             'end_time': __get_formatted_datetime(troika.end_time,"%d.%m.%Y %H:%M"),
             'max_participants': troika.max_participants,
             'is_full': __is_full(troika),
             'participating': __participating(user, troika),
             'lead': __get_display_name(troika.lead) if troika.lead != None else None,
             'first_learner': __get_display_name(troika.first_learner) if troika.first_learner != None else None,
             'second_learner': __get_display_name(troika.second_learner) if troika.second_learner != None else None,
             'participants': [dict(id=participant.id,
                                full_name=__get_display_name(participant)) 
                                for participant in troika.participants] if troika.participants != None else None
             }
    inviteform_lead = InviteForm(role='0', troika_id = troika.id)
    inviteform_first = InviteForm(role='1', troika_id = troika.id)
    inviteform_second = InviteForm(role='2', troika_id = troika.id)
    inviteform_participant = InviteForm(role='3', troika_id = troika.id)
    # show the troika with the given id
    return render_template('troika.html', 
                           troika=entry,
                           inviteform_lead=inviteform_lead,
                           inviteform_first=inviteform_first,
                           inviteform_second=inviteform_second,
                           inviteform_participant=inviteform_participant)

@app.route('/invite', methods=['POST'])
def invite():
    url = __check_login(url = get_redirect_target())
    if url: return redirect(url)
    inviteform = InviteForm()
    if inviteform.validate():
        user = get_user(session['email'])
        troika = get_troika(inviteform.troika_id.data)
        if troika is None:
            flash(_(u'Invalid troika id'), 'error')
        elif troika.get_phase() == 'complete':
            flash(_(u'Can not invite to a completed troika'), 'error')
        else:
            msg = Message(_(u"Come join the Troika \"%(title)s\"!", title=troika.title),
                      sender = ("Troika Webmaster", "webmaster@troikalearning.org"),
                      recipients=[inviteform.email.data])
        
            msg.body = _("%(user)s thought you should join the troika \"%(title)s\":", user = __get_display_name(user), title=troika.title)
            msg.body += "\n\n" + url_for('troika', troika_id=troika.id, _external=True)
            msg.body += "\n\n"
            
            role_string = None
            if inviteform.role.data == '0':
                if troika.lead is None:
                    role_string = _("the lead")
                else:
                    flash(_(u'Troika already has a second learner'), 'error')
            elif inviteform.role.data == '1':
                if troika.first_learner is None:
                    role_string = _("the first learner")
                else:
                    flash(_(u'Troika already has a second learner'), 'error')
            elif inviteform.role.data == '2':
                if troika.second_learner is None:
                    role_string = _("the second learner")
                else:
                    flash(_(u'Troika already has a second learner'), 'error')
            elif inviteform.role.data == '3':
                role_string = _("a participant")
            else:
                flash(_(u'Invalid role: ') + 'inviteform.role', 'error')
            if role_string is not None:  
                msg.body += _("as %(role)s.", role=role_string)
                msg.body += "\n\n" 
                msg.body += _("What do you say?\n\n")
                msg.body += __get_troika_message_signature()
                
                mail.send(msg)
                flash(_(u'Invite sent to %(email)s.', email = inviteform.email.data))
    else:
        flash(_(u'Invalid invite form: ' + ', '.join((key + ': ' + value[0]) for key, value in inviteform.errors.items())), 'error')
    return redirect(get_redirect_target())

def __get_start_datetime(start_date, start_time_hours, start_time_minutes):
    if start_date is None or start_time_hours is None:
        return None
    start_datetime = datetime.combine(start_date, dttime())
    start_datetime = start_datetime.replace(hour=start_time_hours, minute=start_time_minutes, second=0, microsecond=0)
    return start_datetime

def __get_end_datetime(start_datetime, duration):
    if start_datetime is None or duration is None:
        return None
    return start_datetime + dttimedelta(minutes=duration)

def __get_duration(start_datetime, end_datetime):
    if start_datetime is None or end_datetime is None:
        return None
    duration = end_datetime - start_datetime
    return duration.seconds//60 

def __get_formatted_datetime(dt, dt_format):
    if dt is None or dt_format is None:
        return None
    return dt.strftime(dt_format)

@app.route('/troika/<troika_id>/edit', methods=['GET', 'POST'])
def edit_troika(troika_id):
    url = __check_login(url = url_for('edit_troika', troika_id = troika_id))
    if url: return redirect(url)

    troikaerrors = []
    troikaform = TroikaForm(prefix="troika")
    # Find out if the logged in user has rights to edit/delete
    troika = get_troika(troika_id);
    user = get_user(session['email'])
    access = get_troika_access_right(user, troika)
    if not access:
        flash(_(u'Only the creator or the lead can edit the Troika'), 'error')
        return redirect(url_for('troika', troika_id=troika_id))

    if request.method == 'GET':
        # Add default values
        troikaform.title.data = troika.title
        troikaform.description.data = troika.description
        troikaform.address.data = troika.address
        troikaform.address_addendum.data = troika.address_addendum
        troikaform.language.data = troika.language
        troikaform.start_date.data = troika.start_time
        troikaform.start_time_hours.data = __get_formatted_datetime(troika.start_time,"%H")
        troikaform.start_time_minutes.data = __get_formatted_datetime(troika.start_time,"%M")
        troikaform.duration.data = __get_duration(troika.start_time, troika.end_time)
        troikaform.max_participants.data = troika.max_participants
    elif troikaform.validate_on_submit():
        if request.form["action"] == "Save Troika":
            # Validate times
            if troikaform.start_date.data is not None and (troikaform.start_time_hours.data is None or troikaform.start_time_minutes.data is None or troikaform.duration.data is None):
                troikaerrors.append(_(u"When a date is set, you must also give values for hours, minutes and duration."))
            else:
                start_time = __get_start_datetime(troikaform.start_date.data, troikaform.start_time_hours.data, troikaform.start_time_minutes.data)
                if user.role != 'admin' and start_time is not None and start_time < datetime.now():
                    troikaerrors.append(_(u"Start time for the troika must be in the future"))
                else:
                    # Update info
                    troika.title = troikaform.title.data
                    troika.description = troikaform.description.data 
                    troika.address = troikaform.address.data
                    troika.address_addendum = troikaform.address_addendum.data
                    troika.language = troikaform.language.data
                    troika.start_time = start_time
                    troika.end_time = __get_end_datetime(troika.start_time, troikaform.duration.data)
                    troika.max_participants = troikaform.max_participants.data
                    save_troika(troika)
                    return redirect(url_for('troika', troika_id=troika_id))
                    flash(_(u'Troika saved'))         
        elif request.form["action"] == _(u"Delete Troika"):
            title = troika.title
            delete_troika(troika)
            flash('Troika "' + title +  '" deleted')
            return redirect(url_for('troikas'))
    if troikaform.errors:
        for key, value in troikaform.errors.items():
            troikaerrors.append(key + ': ' + value[0])

    return render_template('edit_troika.html', 
                           troikaform=troikaform, troikaerrors=troikaerrors,
                           access=access)

def __get_troika_message(subject, troika):
    recipients = []
    if troika.lead is not None: recipients.append(troika.lead.email)
    if troika.first_learner is not None: recipients.append(troika.first_learner.email)
    if troika.second_learner is not None: recipients.append(troika.second_learner.email)
    return Message(subject,
              sender = (__get_display_name(troika.lead),troika.lead.email),
              recipients=recipients)

def __get_troika_message_signature():
    signature = "--\n"
    signature += _(u"Troika Team")
    signature += _(u"Salla, Olli, Petro and Timo")
    signature += "http://troikalearning.org"
    return signature

def __process_activation(troika):
    troika.activated = datetime.now()
    
    if not app.config.get('MAIL_SKIP'):    
        # Send message to all three participants
        msg = __get_troika_message(_(u"Troika \"%(title)s\" activated!", title=troika.title))
        msg.body = _(u"Congratulations! The troika \"%(title)s\":", title=troika.title)
        msg.body += "\n\n" + url_for('troika', troika_id=troika.id, _external=True)
        msg.body += "\n\n"
        msg.body += _(u"has now been activated. You can view the participants on the troika page.")
        msg.body += "\n\n"
        msg.body += _(u"Happy learnings!")
        msg.body += "\n\n"
        msg.body += __get_troika_message_signature()
        mail.send(msg)

def __process_pending(troika):
    if troika.get_phase() == 'pending' and \
       troika.lead is not None and \
       troika.first_learner is not None and \
       troika.second_learner is not None:
        troika.pended = datetime.now()
        if troika.start_time is not None and \
           troika.end_time is not None and \
           troika.address is not None:
            __process_activation(troika)
            flash ("Troika activated!")
        else: 
            if not app.config.get('MAIL_SKIP'):    
                # Send message to all three participants
                msg = __get_troika_message(_(u"Troika \"%(title)s\" is just about to be born!", title=troika.title), troika)
                msg.body = _(u"Congratulations! The troika \"%(title)s\":", title=troika.title)
                msg.body += "\n\n" + url_for('troika', troika_id=troika.id, _external=True)
                msg.body += "\n\n"
                msg.body += _(u"has now all three participants!")
                msg.body += "\n\n"
                msg.body += _(u"Your job now is to:")
                msg.body += "\n"
                msg.body += _(u"1. decide on the remaining open details for the troika,")
                msg.body += _(u"2. add that information to the troika by pressing \"Edit troika\" (visible for the lead and creator),")
                msg.body += _(u"3. and then press \"Activate troika\".")
                msg.body += "\n\n"
                msg.body += _(u"Get going!")
                msg.body += "\n\n"
                msg.body += _(u"[insert inspirational quote about balalaikas here]")
                msg.body += "\n\n"
                msg.body += __get_troika_message_signature()
                mail.send(msg)

@app.route('/troika/<troika_id>/activate', methods=['GET'])
def activate_troika(troika_id):
    url = __check_login(url = url_for('activate_troika', troika_id = troika_id))
    if url: return redirect(url)

    troika = get_troika(troika_id);
    user = get_user(session['email'])
    if activatable(user, troika, app.config.get('ACTIVATABLE_BEFORE_THREE')):
        if troika.start_time < datetime.now() and user.role != 'admin':
            flash(_(u'Start time is in the past, change it before activating Troika'), 'error')
            return redirect(url_for('troika', troika_id=troika_id))            
        __process_activation(troika)
        save_troika(troika)
        flash(_(u"Troika \"%(title)s\" activated", title=troika.title))
        return redirect(url_for('troika', troika_id=troika_id))
    else:
        flash(_(u'Troika can only be activated by the lead after all required information is set'), 'error')
        return redirect(url_for('troika', troika_id=troika_id))

@app.route('/troika/<troika_id>/<troika_role>/join', methods=['GET'])
def join_troika(troika_id, troika_role):
    url = __check_login(url = url_for('join_troika', troika_id = troika_id, troika_role = troika_role))
    if url: return redirect(url)
    troika = get_troika(troika_id);
    user = get_user(session['email'])
    
    if not __participating(user, troika):
        if troika_role == '0':
            if troika.lead is not None:
                flash(_(u"The Troika already has a lead"), 'error')
                return redirect(url_for('troika', troika_id=troika_id))
            troika.lead = user
            __process_pending(troika)
            save_troika(troika)
            flash(_(u"You are now teaching \"%(title)s\"!", title=troika.title))
            return redirect(url_for('troika', troika_id=troika_id))
        elif troika_role == '1':
            if troika.first_learner is not None:
                flash(_(u"The Troika already has a first learner"), 'error')
                return redirect(url_for('troika', troika_id=troika_id))
            troika.first_learner = user
            __process_pending(troika)
            save_troika(troika)
            flash(_(u"You are now the first learner of \"%(title)s\"!", title=troika.title))
            return redirect(url_for('troika', troika_id=troika_id))
        elif troika_role == '2':
            if troika.second_learner is not None:
                flash(_(u"The Troika already has a second learner"), 'error')
                return redirect(url_for('troika', troika_id=troika_id))
            troika.second_learner = user
            __process_pending(troika)
            save_troika(troika)
            flash(_(u"You are now the second learner of \"%(title)s\"!", title=troika.title))
            return redirect(url_for('troika', troika_id=troika_id))
        elif troika_role == '3':
            if user in troika.participants:
                flash(_(u"You are already participating in the Troika"), 'error')
                return redirect(url_for('troika', troika_id=troika_id))
            if __is_full(troika):
                flash(_(u"There is no more room in this Troika"), 'error')
                return redirect(url_for('troika', troika_id=troika_id))
            troika.participants.append(user)
            save_troika(troika)
            flash(_(u"You are now participating in \"%(title)s\"!", title=troika.title))
            return redirect(url_for('troika', troika_id=troika_id))
        else:
            flash(_(u"Unknown Troika role: %(role)", role=troika_role), 'error')
            return redirect(url_for('troika', troika_id=troika_id))
    else:
        flash(_(u"You are already partipating in the Troika."), 'error')
        return redirect(url_for('troika', troika_id=troika_id))
        
@app.route('/troika/<troika_id>/<troika_role>/leave', methods=['GET'])
def leave_troika(troika_id, troika_role):
    url = __check_login(url = url_for('leave_troika', troika_id = troika_id, troika_role = troika_role))
    if url: return redirect(url)

    troika = get_troika(troika_id);
    user = get_user(session['email'])
    if troika.get_phase() != 'complete':
        if troika_role == '0':
            if troika.lead != user:
                flash(_(u"You are not the lead of this Troika."), 'error')
                return redirect(url_for('troika', troika_id=troika_id))
            troika.lead = None
            save_troika(troika)
            flash(_(u"You are no longer teaching \"%(title)s\.", title=troika.title))
            return redirect(url_for('troika', troika_id=troika_id))
        elif troika_role == '1':
            if troika.first_learner != user:
                flash(_(u"You are not the first learner of this Troika."), 'error')
                return redirect(url_for('troika', troika_id=troika_id))
            troika.first_learner = None
            save_troika(troika)
            flash(_(u"You are no longer the first learner of \"%(title)s\".", title=troika.title))
            return redirect(url_for('troika', troika_id=troika_id))
        elif troika_role == '2':
            if troika.second_learner != user:
                flash(_(u"You are not the second learner of this Troika."), 'error')
                return redirect(url_for('troika', troika_id=troika_id))
            troika.second_learner = None
            save_troika(troika)
            flash(_(u"You are no longer the second learner of \"%(title)s\".", title=troika.title))
            return redirect(url_for('troika', troika_id=troika_id))
        elif troika_role == '3':
            if user not in troika.participants:
                flash(_(u"You are not participating in the Troika"), 'error')
                return redirect(url_for('troika', troika_id=troika_id))
            troika.participants.remove(user)
            save_troika(troika)
            flash(_(u"You are no longer participating in \"%(title)s\".", title=troika.title))
            return redirect(url_for('troika', troika_id=troika_id))
            
        else:
            flash(_(u"Unknown Troika role: %(role)s", role = troika_role), 'error')
            return redirect(url_for('troika', troika_id=troika_id))
    else:
        flash(_(u"You can not leave a Troika that is complete"), 'error')
        return redirect(url_for('troika', troika_id=troika_id))


@app.route('/create', methods=['GET', 'POST'])
def create_troika():
    url = __check_login('create_troika')
    if url: return redirect(url)
    
    troikaerrors = []
    troikaform = TroikaForm(prefix="troika")
    if troikaform.validate_on_submit():
        user = get_user(session['email'])
        # Validate times
        if troikaform.start_date.data is not None and (troikaform.start_time_hours.data is None or troikaform.start_time_minutes.data is None or troikaform.duration.data is None):
            troikaerrors.append(_(u"When a date is set, you must also give values for hours, minutes and duration.."))
        else:
            start_time = __get_start_datetime(troikaform.start_date.data, troikaform.start_time_hours.data, troikaform.start_time_minutes.data)
            if start_time is not None and start_time < datetime.now():
                troikaerrors.append(_(u"Start time for the troika must be in the future."))
            else:
                troika = Troika(created = datetime.now(),
                        title=troikaform.title.data,
                        description=troikaform.description.data,
                        country='FI', region=None, area_id=None, campus_id=None,
                        address=troikaform.address.data,
                        address_addendum=troikaform.address_addendum.data,
                        language=troikaform.language.data, 
                        start_time=start_time,
                        end_time=__get_end_datetime(start_time, troikaform.duration.data),
                        max_participants=troikaform.max_participants.data, 
                        creator=user)
                if troikaform.creator_role.data == 'lead':
                    troika.lead = user
                else:
                    troika.first_learner = user
                save_troika(troika)
                flash(_(u"Troika Created"))
                return redirect(url_for('troika', troika_id=troika.id))
    if troikaform.errors:
        for key, value in troikaform.errors.items():
            troikaerrors.append(key + ': ' + value[0])
    return render_template('edit_troika.html', 
                           troikaform=troikaform, troikaerrors=troikaerrors,
                           access='create')

@app.route('/feedback', methods=['GET', 'POST'])
def feedback():
    feedbackerrors = []
    feedbackform = FeedbackForm()
    user = None
    given_feedback = []
    if 'email' in session: 
        user = get_user(session['email'])
        if user.role == 'admin':
            # For admins, the feedback is shown
            given_feedback = get_feedback()
    
    if feedbackform.validate_on_submit():
        feedback = Feedback(created = datetime.now(),
                            description=feedbackform.description.data,
                            user=user)
        save_feedback(feedback)
        flash(_(u"Feedback saved. Thank you!"))
        return redirect(url_for('troikas'))
        
    if feedbackform.errors:
        for key, value in feedbackform.errors.items():
            feedbackerrors.append(key + ': ' + value[0])

    return render_template('feedback.html', feedbackform=feedbackform, 
                           feedbackerrors=feedbackerrors,
                           given_feedback=given_feedback)

@app.route('/logout')
def logout():
    if 'email' in session:
        session.pop('email', None)
        flash(_(u"You were logged out"))
    if 'destination' in session:
        session.pop('destination', None)
    return redirect(url_for('troikas'))
