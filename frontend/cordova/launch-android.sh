cd ../core
mvn clean install -DskipTests=true
cd ../cordova
mvn clean install
cd app
cordova run android --target=4272b012
cd ..

