#!/bin/bash
set -e

TARGET_DIR=`dirname "${TEST_BINARY}"`

for FORMATTED_DIR in $TARGET_DIR/__formatted_*
do
  UNFORMATTED_DIR=`echo $FORMATTED_DIR | sed 's/__formatted_//g'`
  diff -r $UNFORMATTED_DIR $FORMATTED_DIR
done
