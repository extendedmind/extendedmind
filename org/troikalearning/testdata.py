# coding: utf-8
#
#  Copyright (c) 2012 Timo Tiuraniemi
#
#  This file is part of Troika.
#
#  Troika is free software; you can redistribute it and/or modify
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
from troikalearning.backend import db, User, Troika
from passlib.hash import sha256_crypt
import datetime
# Creates tables if they are not there yet
db.create_all()
hash = sha256_crypt.encrypt("test");

# Real people

admin = User(email="admin@troikalearning.org", role='admin', 
             password=hash, preferred_language='en',
             full_name="Troika Administrator", short_name="admin")
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

# Test people

mirkka = User(email="nimi1@gmail.com", role='user',
            password=hash,
            country='FI', region='18', preferred_language='fi',
            full_name="Mirkka Virtanen", short_name="Mirkka", given_names="Mirkka", family_name="Parviainen")
pertti = User(email="nimi2@gmail.com", role='user',
            password=hash,
            country='FI', region='18', preferred_language='fi',
            full_name=u"Pertti Mäkinen", short_name="Pertti", given_names="Pertti", family_name=u"Mäkinen")
alfonso = User(email="nimi3@gmail.com", role='user',
            password=hash,
            country='FI', region='18', preferred_language='fi',
            full_name="Alfonso Gomez", short_name="Alfonso", given_names="Alfonso", family_name="Gomez")
mikaela = User(email="nimi4@gmail.com", role='user',
            password=hash,
            country='FI', region='18', preferred_language='fi',
            full_name="Mikaela Nygren", short_name="Mikaela", given_names="Mikaela", family_name="Nygren")
jari = User(email="nimi5@gmail.com", role='user',
            password=hash,
            country='FI', region='18', preferred_language='fi',
            full_name="Jari Koivu", short_name="Jari", given_names="Jari", family_name="Koivu")
anita = User(email="nim6@gmail.com", role='user',
            password=hash,
            country='FI', region='18', preferred_language='fi',
            full_name=u"Anita Käyräkoski", short_name="Anita", given_names="Anita", family_name=u"Käyräkoski")
bertil = User(email="nim7@gmail.com", role='user',
            password=hash,
            country='FI', region='18', preferred_language='fi',
            full_name="Bertil Lax", short_name="Bertil", given_names="Bertil", family_name="Lax")
antti = User(email="nim8@gmail.com", role='user',
            password=hash,
            country='FI', region='18', preferred_language='fi',
            full_name="Antti Lohi", short_name="Antti", given_names="Antti", family_name="Lohi")
minttu = User(email="nim9@gmail.com", role='user',
            password=hash,
            country='FI', region='18', preferred_language='fi',
            full_name="Minttu Koivisto", short_name="Minttu", given_names="Minttu", family_name="Koivisto")
jukka = User(email="nim10@gmail.com", role='user',
            password=hash,
            country='FI', region='18', preferred_language='fi',
            full_name="Jukka Koivisto", short_name="Jukka", given_names="Jukka", family_name="Koivisto")
essi = User(email="nim11@gmail.com", role='user',
            password=hash,
            country='FI', region='18', preferred_language='fi',
            full_name="Essi Syren", short_name="Essi", given_names="Essi", family_name="Syren")
natasha = User(email="nim12@gmail.com", role='user',
            password=hash,
            country='FI', region='18', preferred_language='fi',
            full_name="Natasha Simonv", short_name="Natasha", given_names="Natasha", family_name="Simonov")
esko = User(email="nim13@gmail.com", role='user',
            password=hash,
            country='FI', region='18', preferred_language='fi',
            full_name="Esko Kiiluv", short_name="Esko", given_names="Esko", family_name="Kiiluv")
laura = User(email="nim14@gmail.com", role='user',
            password=hash,
            country='FI', region='18', preferred_language='fi',
            full_name="Laura Jurvanen", short_name="Laura", given_names="Laura", family_name="Jurvanen")
camilla = User(email="nim15@gmail.com", role='user',
            password=hash,
            country='FI', region='18', preferred_language='fi',
            full_name="Camilla Ek", short_name="Camilla", given_names="Camilla", family_name="Ek")


db.session.add(admin)
db.session.add(olli)
db.session.add(petro)
db.session.add(salla)
db.session.add(timo)
db.session.add(lauri)
db.session.add(arho)
db.session.add(mirkka)
db.session.add(pertti)
db.session.add(alfonso)
db.session.add(mikaela)
db.session.add(jari)
db.session.add(anita)
db.session.add(bertil)
db.session.add(antti)
db.session.add(minttu)
db.session.add(jukka)
db.session.add(essi)
db.session.add(natasha)
db.session.add(esko)
db.session.add(laura)
db.session.add(camilla)
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
                 max_participants=10, creator=olli, lead=olli, first_learner=petro,
                 second_learner=salla)

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
                 max_participants=8, creator=petro, lead=petro, first_learner=olli, second_learner=salla)

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
                 max_participants=5, creator=olli, lead=olli, first_learner=lauri,
                 second_learner=timo)
troika3.participants = [arho]


# Test Troikas

two_months_ago = datetime.datetime.now() - datetime.timedelta(days=60)
two_months_ago.replace(hour=16, minute=0, second=0, microsecond=0)
one_month_ago = datetime.datetime.now() - datetime.timedelta(days=30)
one_month_ago.replace(hour=16, minute=0, second=0, microsecond=0)
twenty_days_ago = datetime.datetime.now() - datetime.timedelta(days=20)
twenty_days_ago.replace(hour=16, minute=0, second=0, microsecond=0)
ten_days_ago = datetime.datetime.now() - datetime.timedelta(days=10)
ten_days_ago.replace(hour=16, minute=0, second=0, microsecond=0)
one_month_away = datetime.datetime.now() + datetime.timedelta(days=30)
one_month_away.replace(hour=17, minute=0, second=0, microsecond=0)

troika4 = Troika(created=ten_days_ago,
                title=u"Excel kung fu - heinäsirkasta mestariksi",
                description=u"Suurimmalla osalla istuu työpöydällä käyttämätön tehopakkaus: Office-paketin excel. Excel kung fu:ssa opit yksinkertaisia kikkoja ja menetelmiä tiedon ja numeroiden käsittelyyn. Tarvitset koneen ja Office 2007/2010 Excelin. ",
                country='FI', region='18', area_id=None, campus_id=None,
                address=u"Mannerheimintie 22",
                address_addendum=u"Cafe Lasipalatsi",
                language='fi', 
                max_participants=10, creator=alfonso, lead=alfonso, first_learner=antti)

troika5 = Troika(created=one_month_ago, 
                 pended=twenty_days_ago,
                 activated=ten_days_ago, 
                 title=u"Konferenssiposterin tekeminen",
                description=u"Työpajassa käydään läpi posterin tekemisen teoria ja käytäntö. Kukin osallistuja rakentaa pajan aikana tieteellisen posterin omasta tutkimusaiheestaan. Tarvitset mukaan kannettavan tietokoneen, jossa mieluiten PowerPoint tai InDesign, tai vaihtoehtoisesti A2-koon paperin ja tusseja.",
                country='FI', region='18', area_id=None, campus_id=None,
                address=u"Unioninkatu 37",
                address_addendum=u"Viestinnän oppiaineen kirjasto",
                language='fi', 
                start_time=one_month_away + datetime.timedelta(days=1), 
                end_time=one_month_away + datetime.timedelta(days=1, hours=1),
                max_participants=13, creator=salla, lead=salla, first_learner=minttu,
                second_learner=esko)
troika5.participants = [essi,camilla,petro,anita,antti,jukka,laura,jari,arho,petro]

troika6 = Troika(created=one_month_ago, 
                 pended=twenty_days_ago,
                 activated=ten_days_ago, 
                 title=u"Viitteiden hallinta Mendeleyn avulla",
                description=u"Troikassa tutustutaan digitaaliseen viitteiden hallintaan. Tieteellinen kirjoittaminen tehdään tietokoneella, ja usein myös lähdekirjallisuus on digitaalisessa muodossa. Siitä huolimatta lähdeviitteet kirjoitetaan ja arkistoidaan usein käsin. Internetistä on kuitenkin saatavilla pitkälle kehittyneitä viitteiden hallinta järjestelmiä, kuten Mendeley tai Zotero, joiden avulla voi lukea artikkeleita ja kirjallisuutta digitaalisessa muodossa, tehdä merkintöjä ja muistiinpanoja, siteerata, ja mikä tärkeintä, tulostaa lähdeluetteloita. Saavu troikkaan kuulemaan, kuinka päivität artikkelin kirjoituksen ja tieteellisiin teksteihin tutustumisen digitaaliseen aikaan! Opettelemme konkreettiisena esimerkkinä Mendeleyn käyttöä. Muista ladata ohjelma koneellesi osoitteesta http://www.mendeley.com/",
                country='FI', region='18', area_id=None, campus_id=None,
                address=u"Snellmaninkatu 14 B",
                address_addendum=u"Valtiotieteellinen tiedekunta, Pesula-rakennus",
                language='fi', 
                start_time=one_month_away + datetime.timedelta(days=2), 
                end_time=one_month_away + datetime.timedelta(days=2, hours=1),
                max_participants=8, creator=petro, lead=petro, first_learner=laura,
                second_learner=jukka)
troika6.participants = [camilla,natasha,bertil,lauri,timo,pertti]

troika7 = Troika(created=one_month_ago, 
                 pended=twenty_days_ago,
                 activated=ten_days_ago,
                 title=u"Kuinka ideoin tehokkaasti? Luovan ajattelun työpaja",
                description=u"Eikö artikkelin kirjoitus edisty? Onko edessäsi tyhjä sivu, eikä päässä yhtään hyvää ideaa? Akateeminen työnteko edellyttää usein luovuutta: uudet tutkimusideat, artikkelin kirjoitus, hyvän luennon suunnittelu, koeasetelman kekseliäisyys, kyselylomakkeen tekeminen jne. ovat kaikki toimenpiteitä, joissa pohjimmiltaan tarvitsemme luovaa ajattelua. Aina kekseliäät ideat eivät kuitenkaan tule liukuhihnalta. Tässä troikassa harjoittelemme muutamaa yksinkertaista luovan ajattelun menetelmää, joiden avulla ideaputki aukeaa kuin vesihana!",
                country='FI', region='18', area_id=None, campus_id=None,
                address=u"Liisankatu 29",
                address_addendum=u"Espresso Edge",
                language='fi',
                start_time=one_month_away + datetime.timedelta(days=3),
                end_time=one_month_away+datetime.timedelta(days=3, hours=1),
                max_participants=5, creator=petro, lead=lauri, first_learner=petro,
                second_learner=salla)

troika8 = Troika(created=one_month_ago, 
                 pended=twenty_days_ago,
                 activated=ten_days_ago,
                 title=u"PowerPoint on kirosana?",
                description=u"Kalvosulkeiset on usein käytetty lempinimi PowerPoint-esityksille. Esityksen tekijästä on saattanut tuntua, että kaikki tarpeellinen ei millään mahdu mukaan, ja tuloksena on kuulijan kannalta puuduttava kalvoshow, jossa esiintyjän oma viestintä ja PowerPoint viestintävälineenä eivät tuo aiheeseen sanottava lisäarvoa - oppimisen tulos olisi ollut sama, jos kuulija olisi lukenut sen suoraan paperilta. Tässä troikassa käymme läpi muutamia yksinkertaisia perusperiaatteita mukaansatempaavien PowerPoint-esitysten tekemiseksi. Samalla esitellään 10 helppoa vinkkiä oman viestinnän elävöittämiseksi.",
                country='FI', region='18', area_id=None, campus_id=None,
                address=u"Aleksanterinkatu 7",
                address_addendum=u"Tiedekulma, kellarin kokoustilat",
                language='fi', 
                start_time=one_month_away + datetime.timedelta(days=4), 
                end_time=one_month_away + datetime.timedelta(days=4, hours=1),
                max_participants=5, creator=petro, lead=petro, first_learner=alfonso,
                second_learner=mikaela)
troika8.participants = [jari,anita]

troika9 = Troika(created=one_month_ago, 
                 pended=twenty_days_ago,
                 activated=ten_days_ago,
                 title=u"Jumittaako? Tule taukojumppa-Troikkaan",
                description=u"Jumittaako niska? Tekeekö mieli jatkuvasti venytellä tuolin selkänojaa vasten? Takkuaako ajatus? Taukojumppa saattaa auttaa. Taukojumppa on helppo tapa pitää pieni tauko päivittäisestä päätteellä istumisesta. Samalla kohtaat työtovereitasi, kohennat terveyttäsi ja lisäät omaa työtehoasi! Taukojumppa-Troikassa käymme läpi tärkeimmät perusliikkeet siten, että kuka tahansa osallistujista voi toimia vetäjänä seuraavalla kerralla!",
                country='FI', region='18', area_id=None, campus_id=None,
                address=u"Unioninkatu 37",
                address_addendum=u"Valtiotieteellisen tiedekunnan piha. Huom. sateen sattuessa kokoonnumme tiedekunnan käytävällä.",
                language='fi', 
                start_time=one_month_away + datetime.timedelta(days=5), 
                end_time=one_month_away + datetime.timedelta(days=5, hours=1),
                max_participants=20, creator=petro, lead=camilla, first_learner=petro,
                second_learner=mirkka)
troika9.participants = [arho,jari,anita,bertil,antti,minttu,jukka,essi,natasha,esko,lauri,timo,salla]

troika10 = Troika(created=one_month_ago, 
                 pended=twenty_days_ago,
                 activated=ten_days_ago,
                  title=u"Ensiapua kertaajille",
                description=u"Verestä ensiaputaitojasi. Lyhyt päivitys jo ensiapukurssin vuosia sitten käyneille: miten elvytysohjeet ovat muuttuneet jne. Huom.! Ei virallinen SPR:n kurssi, vaikka kouluttajalla onkin pätevyys! Toteutuu, jos saadaan 15 täyteen",
                country='FI', region='18', area_id=None, campus_id=None,
                address=u"Ratakatu 6",
                address_addendum=u"Norssin lukio, luokka 214",
                language='fi', 
                start_time=one_month_away + datetime.timedelta(days=6), 
                end_time=one_month_away+datetime.timedelta(days=6, hours=1),
                max_participants=15, creator=mirkka, lead=mirkka, first_learner=laura,
                second_learner=camilla)
troika10.participants = [esko,natasha,essi,jukka,antti,bertil,anita,jari,mikaela,petro]


troika11= Troika(created=one_month_ago, 
                 pended=ten_days_ago,
                 title=u"Verkostoanalyysi sosiaalisessa mediassa",
                description=u"Verkostoanalyysin toteuttaminen sosiaalisessa mediassa. Käymme lävitse ohjeet, mitä tietoa voi Facebookista ja Twitteristä hakea sekä miten tiedosta tehdään verkosto. Verkostoanalyysin alkeet tulee olla hallinnassa. Läppäri mukaan.",
                country='FI', region='18', area_id=None, campus_id=None,
                language='fi', 
                start_time=one_month_away + datetime.timedelta(days=7), 
                end_time=one_month_away+datetime.timedelta(days=7, hours=1),
                max_participants=6, creator=petro, lead=olli, first_learner=petro, second_learner=camilla)

troika12 = Troika(created=ten_days_ago,
                  title=u"Leikit 1900-luvulla: opi tekemällä",
                description=u"Mitä isoäitisi leikki pienenä? Käymme lyhyesti läpi leikkien historian eri vuosikymmeninä ja lopuksi käytännön kokeilua! Verkkarit mukaan, sadekelin sattuessa myös kumisaappaat!",
                country='FI', region='18', area_id=None, campus_id=None,
                address=u"Helsinginkatu 23",
                address_addendum=u"Brahen kenttä",
                language='fi',
                max_participants=7, creator=natasha, lead=natasha, first_learner=bertil)

troika13 = Troika(created=one_month_ago, 
                 pended=ten_days_ago,
                title=u"Pitching - esitä ideasi nopeasti ja houkuttelevasti",
                description=u"Opi kertomaan ideastasi - oli se sitten tutkimussuunnitelma tai liikeidea - nopeasti ja houkuttelevasti. Tapaamisen aikana kommentteja antaa kokenut pitchaaja ja sijoittajaenkeli Bertil Lax. Tavoitteena oppia vakuuttamaan kuulija luopumaan rahastaan tai ajastaan 30 sekunnin puheen jälkeen. Oma idea mukaan..",
                country='FI', region='18', area_id=None, campus_id=None,
                address=u"Betonimiehenkuja 3, Espoo",
                address_addendum=u"Aalto Venture Garage",
                language='fi',
                max_participants=15, creator=pertti, lead=bertil, first_learner=pertti, second_learner=antti)

troika14 = Troika(created=ten_days_ago,
                  title=u"Opetusportfolion rakentaminen",
                description=u"Tässä troikassa opit rakentamaan yliopistouralla yhä tarpeellisemmaksi käyvän opetusportfolion. Mikä on paras tapa esittää opettamiseen liittyvää osaamistasi? Millä eri tekniikoilla portfolioita voi toteuttaa? Voit tulla paikalle ihan vain kuuntelemaan, tai ottaa oman kannettavan, jolloin voit samalla työstää portfoliotasi.",
                country='FI', region='18', area_id=None, campus_id=None,
                language='fi',
                max_participants=5, creator=salla, lead=minttu, first_learner=salla)

troika15 = Troika(created=two_months_ago, 
                 pended=one_month_ago,
                 activated=twenty_days_ago,
                  title=u"Massaluentojen elävöittäminen",
                description=u"Tuntuuko sinusta, että opiskelijasi eivät jaksa kuunnella sinua? Tässä troikassa käymme läpi liudan erilaisia keinoja, joilla massaluentoja voi elävöittää ja helposti muuttaa inteaktiivisemmiksi. Sovellamme menetelmiä eri tyyppisissä harjoituksissa.",
                country='FI', region='18', area_id=None, campus_id=None,
                address=u"Uninonkatu 37",
                address_addendum=u"Seminaarihuone 2",
                language='fi', 
                start_time=ten_days_ago, 
                end_time=ten_days_ago + datetime.timedelta(hours=1),
                max_participants=100, creator=salla, lead=salla, first_learner=lauri,
                second_learner=bertil)
troika15.participants = [antti]

troika16 = Troika(created=two_months_ago, 
                 pended=one_month_ago,
                 activated=twenty_days_ago,
                  title=u"Suomen kansan oudot tanssit",
                description=u"Työpajassa käymme läpi vanhoja suomalaisia kansantansseja ja -leikkejä, jotka virallisista arkistoista on sensuroitu - syystä tai toisesta. Tule siis oppimaan mm. “Tupsunjuureen” -tanssi sekä “Kuollut ryssä” -leikki! Mukaan vaatteet, joissa mukava liikkua ja pehmeät tossut.",
                country='FI', region='18', area_id=None, campus_id=None,
                address=u"Fabianinkatu 26",
                address_addendum=u"Yliopistoliikunta hallintorakennus",
                language='fi', 
                start_time=ten_days_ago + datetime.timedelta(days=1), 
                end_time=ten_days_ago + datetime.timedelta(days=1, hours=1),
                max_participants=8, creator=salla, lead=essi, first_learner=salla,
                second_learner=jukka)
troika16.participants = [bertil,petro,lauri,timo,arho]

troika17 = Troika(created=two_months_ago, 
                 pended=one_month_ago,
                 activated=twenty_days_ago,
                title=u"Abstraktin kirjoittaminen",
                description=u"Abstrakti on tieteellisen työn ultimaalisin markkinointikeino, jonka avulla hankit pääsyn konferensseihin ja teemanumeroihin. Tule troikaan oppimaan abstraktin kirjoittamisen salat ja toimiva perusmalli. Käymme läpi teoriaa ja käytäntöä ja harjoittelemme oman työn esittämistä eri mittaisina abstrakteina. Oma tietokone mukaan.",
                country='FI', region='18', area_id=None, campus_id=None,
                address=u"Unioninkatu 37",
                address_addendum=u"Seminaarihuone 3",
                language='fi', 
                start_time=ten_days_ago + datetime.timedelta(days=2),
                end_time=ten_days_ago + datetime.timedelta(days=2, hours=1),
                max_participants=5, creator=salla, lead=salla, first_learner=jari,
                second_learner=jukka)

troika18 = Troika(created=two_months_ago, 
                 pended=one_month_ago,
                 activated=twenty_days_ago,
                  title=u"Työskelentelyn tehostaminen ajanhallintaohjelmien avulla",
                description=u"Troikassa perehdytään erilaisiin ajanahallintatyökaluihin ja -ohjelmiin, joiden avulla omaa työskentelyä voi tehostaa. Esittelyssä esimerkiksi Pomodoro -tekniikka sekä GTD-menetelmä. Voit myös esitellä tilaisuudessa lyhyesti oman, hyväksi kokemasti menetelmän.",
                country='FI', region='18', area_id=None, campus_id=None,
                address=u"Fredrikinkatu 66",
                address_addendum=u"Mukava toimisto",
                language='fi', 
                start_time=ten_days_ago + datetime.timedelta(days=3),
                end_time=ten_days_ago + datetime.timedelta(days=3, hours=1),
                max_participants=6, creator=bertil, lead=bertil, first_learner=jari,
                second_learner=essi)
troika18.participants = [arho]

troika19 = Troika(created=one_month_ago, 
                 pended=twenty_days_ago,
                 activated=ten_days_ago,
                  title=u"Päälläseisontatyöpaja",
                description=u"Päälläseisonta on erinomainen tapa tehostaa ajattelua, sillä se lisää verenkiertoa aivoissa. Jo viiden minuutin sessio työpäivän keskellä parantaa työtehoasi huomattavasti. Tule siis oppimaan perusniksit päälläseisontaa turvallisessa troika-työpajassa, jotta voit aloittaa omatoimisen harjoittelun.",
                country='FI', region='18', area_id=None, campus_id=None,
                address=u"Siltavuorenpenger 1D",
                address_addendum=u"Yliopistoliikunnan tatami",
                language='fi', 
                start_time=one_month_away + datetime.timedelta(days=4),
                end_time=one_month_away + datetime.timedelta(days=4, hours=1),
                max_participants=5, creator=lauri, lead=salla, first_learner=jukka,
                second_learner=antti)

db.session.add(troika1)
db.session.add(troika2)
db.session.add(troika3)
db.session.add(troika4)
db.session.add(troika5)
db.session.add(troika6)
db.session.add(troika7)
db.session.add(troika8)
db.session.add(troika9)
db.session.add(troika10)
db.session.add(troika11)
db.session.add(troika12)
db.session.add(troika13)
db.session.add(troika14)
db.session.add(troika15)
db.session.add(troika16)
db.session.add(troika17)
db.session.add(troika18)
db.session.add(troika19)
db.session.commit()
