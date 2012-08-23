from flask import Flask
from troikagame import session
app = Flask(__name__)
app.session_interface = session.ItsdangerousSessionInterface()

import views, backend