# check required environment variables are there

# TODO: This does not work for linux, only Mac!
[ -z "$NODE_PATH" ] && NODE_PATH="/usr/local/lib/node_modules"
if env | grep -q ^NODE_PATH=
then
  echo NODE_PATH is already exported
else
  export NODE_PATH="/usr/local/lib/node_modules"
  echo NODE_PATH was not exported, but now it set to ${NODE_PATH}
fi
