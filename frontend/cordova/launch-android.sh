cd ../app
mvn -o clean install -DskipTests=true -Ddebug=true -Ddocker.skip=true
cd ../cordova

if [ -z "$2" ]
  then
    mvn clean install
  else
    mvn clean install -Dcordova.urlPrefix=$2
fi

cd src

if test "$1" == "jp"
then
  ./node/node ./node_modules/.bin/cordova run android --target=1299e503
fi

if test "$1" == "timo"
then
  ./node/node ./node_modules/.bin/cordova run android --target=4272b012
fi

cd ..
