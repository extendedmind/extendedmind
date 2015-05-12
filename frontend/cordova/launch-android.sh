cd ../core
mvn -o clean install -DskipTests=true
cd ../cordova

if [ -z "$2" ]
  then
    mvn -o clean install
  else
    mvn -o clean install -Dcordova.urlPrefix=$2 
fi

cd app

if test "$1" == "jp"
then
  cordova run android --target=1299e503
fi

if test "$1" == "timo"
then
  cordova run android --target=4272b012
fi

cd ..
