#!/bin/bash
cp /etc/confd/templates/nginx/nginx.conf /etc/nginx/nginx.conf
sed -i 's/BACKEND_IP/'"$BACKEND_PORT_8081_TCP_ADDR"'/g' /etc/nginx/sites-enabled/*.conf
sed -i 's/COLLECT_IP/'"$COLLECTOR_PORT_1080_TCP_ADDR"'/g' /etc/nginx/sites-enabled/*.conf
sed -i 's/EVALUATE_IP/'"$EVALUATOR_PORT_1081_TCP_ADDR"'/g' /etc/nginx/sites-enabled/*.conf
sed -i 's/SITE_IP/'"$SITE_PORT_3000_TCP_ADDR"'/g' /etc/nginx/sites-enabled/*.conf
sed -i 's/SITE2_IP/'"$SITE2_PORT_3001_TCP_ADDR"'/g' /etc/nginx/sites-enabled/*.conf
service nginx start
