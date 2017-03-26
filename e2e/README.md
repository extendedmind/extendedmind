# Extended Mind End-to-End tests

## Docker configuration

On OSX using VirtualBox, you need to forward the localhost port 8008 and 7000 to the VirtualBox Docker guest "default" ports 8008 and 7000 repectively for tests to succeed. On the VirtualBox console, right click on the "default" container, select "settings..." then "Port forwarding" and press plus to create host 127.0.0.1:8008 port forwarding to guest port 8008, and a second rule for 127.0.0.1:7000 to guest port 7000.

## Piwik test database creation

First: copying of /etc/piwik/config.ini.php to /var/www/piwik/config was disabled in piwik-docker by building a temporary new extendedmind/piwik:latest container. Then accessing localhost:8008/analytics/index.php begins Piwik installation from scratch.

After successfully finishing the installation, create a piwik user:

```
docker run -it --link mariadb:mysql --rm mariadb:10.1 sh -c 'exec mysql -h"$MYSQL_PORT_3306_TCP_ADDR" -P"$MYSQL_PORT_3306_TCP_PORT" -uroot -p"$MYSQL_ENV_MYSQL_ROOT_PASSWORD"'
```

and execute:

```
CREATE DATABASE piwik;
CREATE USER 'piwik'@'%' IDENTIFIED BY 'piwikpwd';
GRANT ALL PRIVILEGES ON piwik.* TO 'piwik'@'%';
FLUSH PRIVILEGES;
```

Then take a backup script of the database with:

```
docker run -it --link mariadb:mysql --rm mariadb:10.1 sh -c 'exec mysqldump -h"$MYSQL_PORT_3306_TCP_ADDR" -P"$MYSQL_PORT_3306_TCP_PORT" -uroot -p"$MYSQL_ENV_MYSQL_ROOT_PASSWORD" --databases piwik' > create_piwik_database.sql
```

After that, pack /var/lib/mysql database directory inside the mariadb container and copy it to the local directory with:

```
docker cp mariadb:/var/lib/test-mariadb.tar.gz .
```

Then unpack and zip the backup script and the database and upload it to the Nexus directory with:

```
mvn deploy:deploy-file -DgroupId=org.piwik -DartifactId=test-mariadb-10.1.13 -Dversion=2.16.1 -Dpackaging=zip -DgeneratePom=true -DrepositoryId=extendedmind-releases -Durl=https://nexus.extendedmind.org/repository/releases -Dfile=extendedmind-mariadb-test-database.zip
```

Finally replace the EXTENDEDMIND_DB_PIWIKSALT value in pom.xml by getting it from the config file with:

```
docker exec -it nginx cat /var/www/piwik/config/config.ini.php
```
