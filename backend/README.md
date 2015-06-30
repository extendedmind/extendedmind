Extended Mind - Backend
=======================

Extended Mind - Backend

Docker
-------

* Arch Linux (https://wiki.archlinux.org/index.php/Docker)

    sudo pacman -S docker
    sudo nano /usr/lib/systemd/system/docker.service

* Set host to start listening to a TCP port by adding a docker systemd override:
    sudo systemctl edit unit

```
[Service]
ExecStart=
ExecStart=/usr/bin/docker -d -H tcp://localhost:2375
```

    export DOCKER_HOST=tcp://localhost:2375
    sudo gpasswd -a YOUR_USER_NAME docker

* re-login and enable docker service:

    sudo systemctl start docker.service
    sudo systemctl enable docker.service
    docker info
