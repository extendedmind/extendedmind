#!/usr/bin/perl
use POSIX ":sys_wait_h";

$numArgs = $#ARGV + 1;

if ($numArgs < 1){
  die "usage: run-backend-script.pl [backup/restore] ([param1] [param2] [param3])\n";
}
$scriptType = $ARGV[0];
$param1 = '';
$param2 = '';
$param3 = '';

if ($numArgs > 1){
  $param1 = $ARGV[1];
}
if ($numArgs > 2){
  $param2 = $ARGV[2];
}
if ($numArgs > 3){
  $param3 = $ARGV[3];
}

# Workaround for SIGTERM not being handled by bash
$SIG{TERM} = sub {
  die "exiting backend script " . $scriptType . "...\n";
};
$SIG{CHLD} = \&REAPER;
sub REAPER {
  my $stiff;
  while (($stiff = waitpid(-1, &WNOHANG)) > 0) {}
  $SIG{CHLD} = \&REAPER;
}
print "executing command: " . "/bin/sh -c '/usr/src/extendedmind/backend-" . $scriptType . ".sh " . $param1 . " " . $param2 . " " . $param3 . "'\n";
system "/bin/sh -c '/usr/src/extendedmind/backend-" . $scriptType . ".sh " . $param1 . " " . $param2 . " " . $param3 . "'";
