# check required environment variables are there
: ${ANDROID_HOME:?"Need to set ANDROID_HOME non-empty"}

[ -z "$NODE_PATH" ] && NODE_PATH="/usr/local/lib/node_modules"
if env | grep -q ^NODE_PATH=
then
  echo NODE_PATH is already exported
else
  echo NODE_PATH was not exported, but now it is
  export NODE_PATH
fi

if [ -d "app/platforms/android" ]
then
  echo "Android already prepared, skipping."
else
  # Work in the app directory
  cd app

  # Create needed empty directories
  mkdir -p platforms
  mkdir -p plugins

  # add android platform
  cordova platform add android
fi
