#!/bin/bash
docker run -i --privileged --rm --net=host -v /dev/shm:/dev/shm -v $(pwd)/src/test:/protractor/test -v $(pwd)/target/docker-dirs/backend-emails:/protractor/backend-emails -e DBUS_SESSION_BUS_ADDRESS=/dev/null quay.io/extendedmind/protractor-headless:ph-4.0.14-1 $@
