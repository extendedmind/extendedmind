# coding: utf-8
from troikagame.backend import db, User, Troika
from passlib.hash import sha256_crypt
import datetime
# Creates tables if they are not there yet
db.create_all()
hash = sha256_crypt.encrypt("test");
# Test users
admin = User(email="admin@troikagame.org", role='admin', 
             password=hash, preferred_language='en',
             full_name="Troika Game Administrator", short_name="admin")
olli = User(email="verkostoanatomia@gmail.com", role='user', 
             password=hash,
             country='FI', region='18', preferred_language='fi',
             full_name="Olli Parviainen", short_name="Olli", given_names="Olli", family_name="Parviainen")
petro = User(email="petro.poutanen@helsinki.fi", role='user', 
             password=hash,
             country='FI', region='18', preferred_language='fi',
             full_name="Petro Poutanen", short_name="Petro", given_names="Petro", family_name="Poutanen")
salla = User(email="salla.laaksonen@iki.fi", role='user', 
             password=hash,
             country='FI', region='18', preferred_language='fi',
             full_name="Salla Laaksonen", short_name="Salla", given_names="Salla", family_name="Laaksonen")
timo = User(email="timo.tiuraniemi@iki.fi", role='user', 
             password=hash,
             country='FI', region='18', preferred_language='fi',
             full_name="Timo Tiuraniemi", short_name="Timo", given_names="Timo", family_name="Tiuraniemi")
lauri = User(email="lauri.jarvilehto@filosofianakatemia.fi", role='user', 
             password=hash,
             country='FI', region='18', preferred_language='fi',
             full_name=u"Lauri Järvilehto", short_name="Lauri", given_names="Lauri", family_name=u"Järvilehto")
arho = User(email="arho.toikka@helsinki.fi", role='user', 
             password=hash,
             country='FI', region='18', preferred_language='fi',
             full_name="Arho Toikka", short_name="Arho", given_names="Arho", family_name="Toikka")

db.session.add(admin)
db.session.add(olli)
db.session.add(petro)
db.session.add(salla)
db.session.add(timo)
db.session.add(lauri)
db.session.add(arho)
db.session.commit()

# Test Troikas
# The first Troika will always be completed,
# the second active, and the third pending.
# Troika #2 and #3 were IRL the other way 'round, 
# because we want to also fill the troikas_users 
# table!
one_month_ago = datetime.datetime.now() - datetime.timedelta(days=30)
one_month_ago.replace(hour=16, minute=0, second=0, microsecond=0)
one_month_away = datetime.datetime.now() + datetime.timedelta(days=30)
one_month_away.replace(hour=17, minute=0, second=0, microsecond=0)

troika1 = Troika(phase='active', title=u"How to visualize data with network analysis?", 
                 description=u"Olli Parviainen talks about data visualization using network analysis.",
                 country='FI', region='18', area_id=None, campus_id=None, 
                 address=u"Unioninkatu 37",
                 address_addendum=u"Viestinnän oppiaine, sh3", 
                 language='fi', start_time=one_month_ago, end_time=one_month_ago+datetime.timedelta(hours=1),
                 max_participants=10, creator=olli, teacher=olli, first_learner=petro,
                 second_learner=salla)

troika2 = Troika(phase='active', title=u"Semanttinen verkostoanalyysi", 
                 description=u"Troikan kolmas kierros käynnistyy. Aiheenaan jälleen \
                              verkostoanalyysi. Tällä kertaa käsittelemme sanojen \
                              muodostamia verkostoja (http://en.wikipedia.org/wiki/Semantic_network \
                              http://snacda.wordpress.com/ ): millaisia toistuvia sanojen \
                              välisiä yhteyksiä tekstimassoista löytyy, ja miten niitä \
                              voitaisiin kartoittaa. Esimerkiksi aakkosten välinen verkosto: \
                              http://verkostoanatomia.wordpress.com/2011/03/04/mapping-the-network-of-alphabets/.",
                 country='FI', region='18', area_id=None, campus_id=None, 
                 address=u"Fredrikinkatu 61",
                 address_addendum=u"Filosofian Akatemian tilat, 6 krs", 
                 language='fi', start_time=one_month_away, end_time=one_month_away+datetime.timedelta(hours=1),
                 max_participants=5, creator=olli, teacher=olli, first_learner=lauri,
                 second_learner=timo)
troika2.participants = [arho]

troika3 = Troika(phase='pending', title=u"Luokittelutroikka", 
                 description=u"Onko intohimosi luokitella asioita? Tutkimusaineiston \
                              analysointi on usein aineiston luokittelua erilaisiin \
                              kategorioihin ja näiden kategorioiden tulkitsemista. \
                              Esimerkiksi viestinnän tutkimuksessa luokiteltuja aineistoja \
                              ovat media-aineistot, joissa uutiset ja mediat on luokiteltu \
                              jotakin tiettyä luokittelurunkoa käyttäen numeeriseen muotoon. \
                              Samoin luokittelun lähtökohtana voi olla jokin teksti tai \
                              haastatteluaineisto.",
                 country='FI', region='18', area_id=None, campus_id=None, 
                 address=u"Unioninkatu 37",
                 address_addendum=u"Viestinnän oppiaineen kirjasto", 
                 language='fi',
                 max_participants=8, creator=petro, teacher=petro, first_learner=olli)

db.session.add(troika1)
db.session.add(troika2)
db.session.add(troika3)
db.session.commit()
