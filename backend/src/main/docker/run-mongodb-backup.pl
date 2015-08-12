#!/usr/bin/perl

$param1 = '';
$param2 = '';

if ($numArgs > 0){
  $param1 = $ARGV[0];
}
if ($numArgs > 1){
  $param2 = $ARGV[1];
}

# Workaround SIGTERM not being handled by bash
$SIG{TERM} = sub {
  die "exiting mongodb backup...\n"
};
print "executing command: " . "/bin/sh -c '/usr/src/extendedmind/mongodb-backup.sh " . $param1 . " " . $param2 . "'\n";
system "/bin/sh -c '/usr/src/extendedmind/mongodb-backup.sh " . $param1 . " " . $param2 . "'";;