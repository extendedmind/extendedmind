from distutils.core import setup
setup(
    name = 'troikagame',
    packages = ['troikagame'],
    version = '0.1',
    description = 'Troika Game',
    author='Timo Tiuraniemi',
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
