#!/usr/bin/perl

# Workaround SIGTERM not being handled by bash
$SIG{TERM} = sub {
  die "exiting backend backup perl...\n"
};
system "/bin/sh -c /usr/src/extendedmind/backend-backup.sh";
