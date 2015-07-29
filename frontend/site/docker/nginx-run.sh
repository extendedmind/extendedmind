#!/bin/bash
cp /etc/confd/templates/nginx/nginx.conf /etc/nginx/nginx.conf
sed -i 's/BACKEND_IP/'"$BACKEND_PORT_8081_TCP_ADDR"'/g' /etc/nginx/sites-enabled/nginx.extendedmind.conf
sed -i 's/COLLECT_IP/'"$COLLECTOR_PORT_1080_TCP_ADDR"'/g' /etc/nginx/sites-enabled/nginx.extendedmind.conf
sed -i 's/EVALUATE_IP/'"$EVALUATOR_PORT_1081_TCP_ADDR"'/g' /etc/nginx/sites-enabled/nginx.extendedmind.conf
service nginx start
