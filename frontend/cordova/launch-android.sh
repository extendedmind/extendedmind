cd ../core
mvn -o clean install -DskipTests=true
cd ../cordova
mvn -o clean install
cd app
cordova run android --target=4272b012
cd ..
