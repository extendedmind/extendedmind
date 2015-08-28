#!/usr/bin/perl
use POSIX ":sys_wait_h";

$numArgs = $#ARGV + 1;

$param1 = '';
$param2 = '';
$param3 = '';

if ($numArgs > 0){
  $param1 = $ARGV[0];
}
if ($numArgs > 1){
  $param2 = $ARGV[1];
}
if ($numArgs > 2){
  $param3 = $ARGV[2];
}

# Workaround SIGTERM not being handled by bash
$SIG{TERM} = sub {
  die "exiting sync folder...\n"
};
$SIG{CHLD} = \&REAPER;
sub REAPER {
  my $stiff;
  while (($stiff = waitpid(-1, &WNOHANG)) > 0) {}
  $SIG{CHLD} = \&REAPER;
}
print "executing command: " . "/bin/sh -c '/usr/src/extendedmind/sync-folder.sh " . $param1 . " " . $param2 . " " . $param3 . "'\n";
system "/bin/sh -c '/usr/src/extendedmind/sync-folder.sh " . $param1 . " " . $param2 . " " . $param3 . "'";