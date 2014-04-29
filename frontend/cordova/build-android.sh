# check required environment variables are there
: ${ANDROID_HOME:?"Need to set ANDROID_HOME non-empty"}
: ${NODE_PATH:?"Need to set NODE_PATH non-empty"}

[ -z "$NODE_PATH" ] && NODE_PATH="/usr/local/lib/node_modules"

if env | grep -q ^NODE_PATH=
then
  echo NODE_PATH is already exported
else
  echo NODE_PATH was not exported, but now it is
  export NODE_PATH
fi

# new dir
cd app

# run phonegap command locally
cordova build android

# make new build using ant release configuration
cd platforms/android
ant release
