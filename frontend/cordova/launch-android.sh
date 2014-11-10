cd ../core
mvn -o clean install -DskipTests=true
cd ../cordova
mvn -o clean install
cd app

if test "$1" == "tuomas"
then
  cordova run android --target=1299e503
else
  cordova run android --target=4272b012
fi

cd ..
