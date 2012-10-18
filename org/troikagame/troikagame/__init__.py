from flask import Flask
from troikagame import session
import os
from flask_mail import Mail

app = Flask(__name__)
app.config.from_pyfile(os.getcwd() + os.sep + 'troikagame.cfg')
app.session_interface = session.ItsdangerousSessionInterface()
mail = Mail(app)

import views