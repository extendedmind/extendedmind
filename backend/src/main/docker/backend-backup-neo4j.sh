#!/bin/bash

# Copyright (c) 2002-2013 "Neo Technology,"
# Network Engine for Objects in Lund AB [http://neotechnology.com]
#
# This file is part of Neo4j.
#
# Neo4j is free software: you can redistribute it and/or modify
# it under the terms of the GNU Affero General Public License as
# published by the Free Software Foundation, either version 3 of the
# License, or (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU Affero General Public License for more details.
#
# You should have received a copy of the GNU Affero General Public License
# along with this program. If not, see <http://www.gnu.org/licenses/>.

#Remember where we started from so that working dir is set correctly
RUN_FROM=`pwd`

BACKUP_SCRIPT="$0"

cd "`dirname "$BACKUP_SCRIPT"`"
BACKUP_SCRIPT=`basename "$BACKUP_SCRIPT"`

while [ -L "$BACKUP_SCRIPT" ]
do
  BACKUP_SCRIPT=$( readlink $BACKUP_SCRIPT )
  cd "`dirname "$BACKUP_SCRIPT"`"
  BACKUP_SCRIPT="`basename "$BACKUP_SCRIPT"`"
done

BASEDIR=`cd "$( dirname $BACKUP_SCRIPT )"/.. && dirs -l +0`

# OS specific support.  $var _must_ be set to either true or false.
cygwin=false;
darwin=false;
case "`uname`" in
  CYGWIN*) cygwin=true ;;
  Darwin*) darwin=true
           if [ -z "$JAVA_VERSION" ] ; then
             JAVA_VERSION="CurrentJDK"
           else
             echo "Using Java version: $JAVA_VERSION"
           fi
           if [ -z "$JAVA_HOME" ] ; then
             JAVA_HOME=`/usr/libexec/java_home -v 1.7`
           fi
           ;;
esac

if [ -z "$JAVA_HOME" ] ; then
  if [ -r /etc/gentoo-release ] ; then
    JAVA_HOME=`java-config --jre-home`
  fi
fi

# For Cygwin, ensure paths are in UNIX format before anything is touched
if $cygwin ; then
  [ -n "$JAVA_HOME" ] && JAVA_HOME=`cygpath --unix "$JAVA_HOME"`
  [ -n "$CLASSPATH" ] && CLASSPATH=`cygpath --path --unix "$CLASSPATH"`
fi

# If a specific java binary isn't specified search for the standard 'java' binary
if [ -z "$JAVACMD" ] ; then
  if [ -n "$JAVA_HOME"  ] ; then
    if [ -x "$JAVA_HOME/jre/sh/java" ] ; then
      # IBM's JDK on AIX uses strange locations for the executables
      JAVACMD="$JAVA_HOME/jre/sh/java"
    else
      JAVACMD="$JAVA_HOME/bin/java"
    fi
  else
    JAVACMD=`which java`
  fi
fi

if [ ! -x "$JAVACMD" ] ; then
  echo "Error: JAVA_HOME is not defined correctly."
  echo "  We cannot execute $JAVACMD"
  exit 1
fi

if [ -z "$REPO" ]
then
  REPO="$BASEDIR"/lib
fi

LIBRARY_JARS=""
for jar in "$REPO"/*.jar
do
  LIBRARY_JARS="$LIBRARY_JARS":$jar
done
for jar in "$BASEDIR"/system/lib/*.jar
do
  LIBRARY_JARS="$LIBRARY_JARS":$jar
done
# echo $LIBRARY_JARS

CLASSPATH=$CLASSPATH_PREFIX${LIBRARY_JARS}

EXTRA_JVM_ARGUMENTS=""

# For Cygwin, switch paths to Windows format before running java
if $cygwin; then
  [ -n "$CLASSPATH" ] && CLASSPATH=`cygpath --path --windows "$CLASSPATH"`
  [ -n "$JAVA_HOME" ] && JAVA_HOME=`cygpath --path --windows "$JAVA_HOME"`
  [ -n "$HOME" ] && HOME=`cygpath --path --windows "$HOME"`
  [ -n "$BASEDIR" ] && BASEDIR=`cygpath --path --windows "$BASEDIR"`
  [ -n "$REPO" ] && REPO=`cygpath --path --windows "$REPO"`
fi

# Return to working dir
cd "$RUN_FROM"

# The configuration file for log4j below is bogus; there is no other way
# the configurator class option will be respected. 

exec "$JAVACMD" $JAVA_OPTS \
  $EXTRA_JVM_ARGUMENTS \
  -classpath "$CLASSPATH" \
  -Dapp.name="neo4j-backup" \
  -Dapp.pid="$$" \
  -Dapp.repo="$REPO" \
  -Dbasedir="$BASEDIR" \
  -Dlog4j.configuration=. \
  -Dlog4j.configuratorClass=org.neo4j.kernel.ha.backup.BackupLoggerConfigurator \
  org.neo4j.backup.BackupTool \
  "$@"
