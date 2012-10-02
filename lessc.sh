#!/bin/bash

for f in css/*.less
do
  echo "Processing LESS file - $f"
  /usr/local/bin/lessc $f > ${f%.less}.css  
done
