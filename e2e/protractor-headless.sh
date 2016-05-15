#!/bin/bash
docker run -i --privileged --rm --net=host -v /dev/shm:/dev/shm -v $(pwd)/src/test:/protractor/test -e DBUS_SESSION_BUS_ADDRESS=/dev/null extendedmind/protractor-headless:latest $@
