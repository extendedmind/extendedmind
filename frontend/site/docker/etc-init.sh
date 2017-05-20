#!/bin/sh

# Add a clean exit trap
trap 'echo exiting generate neo4j properties script..; exit' SIGINT SIGQUIT SIGTERM

echo Copying assets from /app/etc-init/etc to /etc
cp -r /app/etc-init/etc / 
