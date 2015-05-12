cd ../core
mvn -o clean install -DskipTests=true -Ddebug=true
cd ../cordova

if [ -z "$1" ]
  then
    mvn -o generate-resources
  else
    mvn -o generate-resources -Dcordova.urlPrefix=$1
fi

# copy sources to iOS
cd app
cordova prepare ios
cd ..
