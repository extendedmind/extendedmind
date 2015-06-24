#!/usr/bin/perl

# Workaround SIGTERM not being handled by bash
$SIG{TERM} = sub {
  die "exiting nginx perl...\n"
};
system "/bin/sh -c /usr/src/nginx/nginx-run.sh";
