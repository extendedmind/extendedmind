#!/bin/bash
sed -i 's/BACKEND_IP/'"$BACKEND_PORT_8081_TCP_ADDR"'/g' /etc/nginx/sites-enabled/nginx.extendedmind.conf
#sed -i 's/COLLECT_IP/'"$COLLECT_PORT_1080_TCP_ADDR"'/g' /etc/nginx/sites-enabled/nginx.extendedmind.conf
#sed -i 's/EVALUATE_IP/'"$EVALUATE_PORT_1081_TCP_ADDR"'/g' /etc/nginx/sites-enabled/nginx.extendedmind.conf
service nginx start
