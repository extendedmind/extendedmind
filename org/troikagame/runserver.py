#  Copyright © 2012 Olli Parviainen, Petro Poutanen, Salla Laaksonen and 
#  Filosofian Akatemia. [http://troikagame.org]
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

'''
Created on 14.8.2012

@author: ttiurani
'''
from troikagame import app

if __name__ == '__main__':
    if app.debug: use_debugger = True
    try:
        # Disable Flask's debugger if external debugger is requested
        use_debugger = not(app.config.get('DEBUG_WITH_APTANA'))
    except:
        pass
    app.run(use_debugger=use_debugger, debug=app.debug,
            use_reloader=use_debugger)
