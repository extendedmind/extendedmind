cd ../core
mvn clean install -DskipTests=true
cd ../cordova
mvn generate-sources
