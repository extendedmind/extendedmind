from flask import Flask
from troikagame import session
import os
app = Flask(__name__)
app.config.from_pyfile(os.getcwd() + os.sep + 'troikagame.cfg')
app.session_interface = session.ItsdangerousSessionInterface()


import views