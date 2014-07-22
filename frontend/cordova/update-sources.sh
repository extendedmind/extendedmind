cd ../core
mvn -o clean install -DskipTests=true
cd ../cordova
mvn -o generate-resources
# copy sources to iOS
cd app
cordova prepare ios
cd ..
