mvn package -o -f ../frontend/app -DskipTests=true
docker cp ../frontend/app/src/static/em.min.js nginx:/var/www/extendedmind/static/0-SNAPSHOT/
