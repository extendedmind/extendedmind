__credits__ = '''
    Copyright (C) 2012 Timo Tiuraniemi
    
    This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published
    by the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program; if not, see http://www.gnu.org/licenses
'''
__author__  = 'Timo Tiuraniemi'
__version__ = '0.1'

from distutils.core import setup
setup(
    name = 'troikalearning',
    packages = ['troikalearning'],
    version = __version__,
    description = 'Troika',
    author=__author__,
    classifiers = [
        "Programming Language :: Python",
        "Development Status :: 1 - Planning",
        "Environment :: Other Environment",
        "Intended Audience :: Education",
		"License :: OSI Approved :: GNU Affero General Public License v3"
		"Operating System :: OS Independent",
        "Topic :: Internet :: WWW/HTTP",
        ],
    install_requires = [
        'flask',
        'mysql-python',
        'flask-sqlalchemy',
        'itsdangerous',
        'passlib',
        'Flask-WTF',
        'flask-mail']
)
