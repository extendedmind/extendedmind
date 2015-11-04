#!/usr/bin/perl

# Workaround SIGTERM not being handled by bash
$SIG{TERM} = sub {
  die "exiting site...\n"
};
system "/usr/local/bin/node index.js /etc/extendedmind/site/config.js";
