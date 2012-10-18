# coding: utf-8
from troikagame.backend import db, User, Troika
from passlib.hash import sha256_crypt
import datetime
# Creates tables if they are not there yet
db.create_all()
hash = sha256_crypt.encrypt("test313");

olli = User(email="verkostoanatomia@gmail.com", role='admin', 
             password=hash,
             country='FI', region='18', preferred_language='fi',
             full_name="Olli Parviainen", short_name="Olli", given_names="Olli", family_name="Parviainen")
petro = User(email="petro.poutanen@helsinki.fi", role='admin', 
             password=hash,
             country='FI', region='18', preferred_language='fi',
             full_name="Petro Poutanen", short_name="Petro", given_names="Petro", family_name="Poutanen")
salla = User(email="salla.laaksonen@iki.fi", role='admin', 
             password=hash,
             country='FI', region='18', preferred_language='fi',
             full_name="Salla Laaksonen", short_name="Salla", given_names="Salla", family_name="Laaksonen")
timo = User(email="timo.tiuraniemi@iki.fi", role='admin', 
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
kalle = User(email="kalle.siira@helsinki.fi", role='user',
             password=hash,
             country='FI', region='18', preferred_language='fi',
             full_name="Kalle Siira", short_name="Kalle", given_names="Kalle", family_name="Siira")
riina = User(email="riina.hyyppa@gmail.com", role='user',
             password=hash,
             country='FI', region='18', preferred_language='fi',
             full_name=u"Riina Hyyppä", short_name="Riina", given_names="Riina", family_name="Hyyppä")
minttu = User(email="minttu.mt.tikka@helsinki.fi", role='user',
             password=hash,
             country='FI', region='18', preferred_language='fi',
             full_name=u"Minttu Tikka", short_name="Minttu", given_names="Minttu", family_name="Tikka")
johannes = User(email="johannes@scoopinion.com", role='user',
             password=hash,
             country='FI', region='18', preferred_language='fi',
             full_name="Johannes Koponen", short_name="Johannes", given_names="Johannes", family_name="Koponen")
veikko = User(email="veikko.eranti@helsinki.fi", role='user',
             password=hash,
             country='FI', region='18', preferred_language='fi',
             full_name=u"Veikko Eranti", short_name="Veikko", given_names="Veikko", family_name="Eranti")
maarit = User(email="maarit.pedak@helsinki.fi", role='user',
             password=hash,
             country='FI', region='18', preferred_language='fi',
             full_name=u"Maarit Pedak", short_name="Maarit", given_names="Maarit", family_name="Pedak")
markus = User(email="markus.ojala@helsinki.fi", role='user',
             password=hash,
             country='FI', region='18', preferred_language='fi',
             full_name=u"Markus Ojala", short_name="Markus", given_names="Markus", family_name="Ojala")

db.session.add(olli)
db.session.add(petro)
db.session.add(salla)
db.session.add(timo)
db.session.add(lauri)
db.session.add(arho)
db.session.add(kalle)
db.session.add(riina)
db.session.add(minttu)
db.session.add(johannes)
db.session.add(veikko)
db.session.add(maarit)
db.session.add(markus)
db.session.commit()

# Real Troikas

troika1 = Troika(created=datetime.datetime(2012, 5, 20, 14, 15, 0), 
                 activated=datetime.datetime(2012, 5, 20, 14, 15, 0),
                 title=u"How to visualize data with network analysis?", 
                 description=u"Olli Parviainen talks about data visualization using network analysis.",
                 country='FI', region='18', area_id=None, campus_id=None, 
                 address=u"Unioninkatu 37",
                 address_addendum=u"Viestinnän oppiaine, sh3", 
                 language='fi', 
                 start_time=datetime.datetime(2012, 5, 24, 14, 15, 0), 
                 end_time=datetime.datetime(2012, 5, 24, 15, 45, 0),
                 max_participants=10, creator=olli, teacher=olli, first_learner=petro,
                 second_learner=salla)
troika1.participants = [kalle, riina, minttu, johannes]

troika2 = Troika(created=datetime.datetime(2012, 6, 3, 15, 15, 0), 
                 activated=datetime.datetime(2012, 6, 3, 15, 15, 0),
                 title=u"Luokittelutroikka", 
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
                 start_time=datetime.datetime(2012, 6, 13, 15, 15, 0), 
                 end_time=datetime.datetime(2012, 6, 13, 16, 45, 0),
                 max_participants=8, creator=petro, teacher=petro, first_learner=olli, second_learner=salla)
troika2.participants = [veikko, maarit, markus]

troika3 = Troika(created=datetime.datetime(2012, 7, 4, 17, 15, 0), 
                 activated=datetime.datetime(2012, 7, 4, 17, 15, 0), 
                 title=u"Semanttinen verkostoanalyysi", 
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
                 language='fi', 
                 start_time=datetime.datetime(2012, 8, 14, 17, 15, 0), 
                 end_time=datetime.datetime(2012, 8, 14, 18, 45, 0),
                 max_participants=5, creator=olli, teacher=olli, first_learner=lauri,
                 second_learner=timo)
troika3.participants = [arho]

db.session.add(troika1)
db.session.add(troika2)
db.session.add(troika3)
db.session.commit()
