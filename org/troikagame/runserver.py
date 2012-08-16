'''
Created on 14.8.2012

@author: ttiurani
'''
from troikagame import app
import os

def create_app(config_filename):
    app.config.from_pyfile(config_filename)    
    return app

if __name__ == '__main__':
    # To allow aptana to receive errors, set use_debugger=False
    app = create_app(config_filename=os.getcwd() + os.sep + "config.cfg")

    if app.debug: use_debugger = True
    try:
        # Disable Flask's debugger if external debugger is requested
        use_debugger = not(app.config.get('DEBUG_WITH_APTANA'))
    except:
        pass
    app.run(use_debugger=use_debugger, debug=app.debug,
            use_reloader=use_debugger)
