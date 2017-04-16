cd ../app
mvn -o clean install -DskipTests=true -Ddebug=true -Ddocker.skip=true
cd ../cordova

if [ -z "$1" ]
  then
    mvn -o generate-resources
  else
    mvn -o process-resources -Dextendedmind.host=$1
fi

# copy sources to iOS
cd src
./node/node ./node_modules/.bin/cordova prepare ios
cd ..
