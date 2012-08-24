'''
Created on 14.8.2012

@author: ttiurani
'''
from troikagame import app
import os

if __name__ == '__main__':
    if app.debug: use_debugger = True
    try:
        # Disable Flask's debugger if external debugger is requested
        use_debugger = not(app.config.get('DEBUG_WITH_APTANA'))
    except:
        pass
    app.run(use_debugger=use_debugger, debug=app.debug,
            use_reloader=use_debugger)
