#  Copyright © 2012 Timo Tiuraniemi
#
#  This file is part of Troika Game.
#
#  Troika Game is free software; you can redistribute it and/or modify
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
from flask import Flask
from troikagame import session
import os
from flask_mail import Mail

app = Flask(__name__)
app.config.from_pyfile(os.getcwd() + os.sep + 'troikagame.cfg')
app.session_interface = session.ItsdangerousSessionInterface()
mail = Mail(app)

import views