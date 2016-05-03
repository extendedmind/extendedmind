#!/bin/bash
docker run -i --privileged --rm --net=host -v /dev/shm:/dev/shm -v $(pwd):/protractor -e DBUS_SESSION_BUS_ADDRESS=/dev/null webnicer/protractor-headless $@
