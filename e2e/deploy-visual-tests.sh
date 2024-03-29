#!/bin/bash
cd target/docker-dirs
zip -r vr-test-data.zip vr
cd ../..
perl -i -pe 's{<e2e\.visualReviewDataRevision>\K(\d+)}{$1 + 1}eg' pom.xml
mvn deploy:deploy-file -DgroupId=org.extendedmind.e2e -DartifactId=test-visualreview -Dversion=\${e2e.visualReviewDataRevision} -Dpackaging=zip -DgeneratePom=true -DrepositoryId=extendedmind-releases -Durl=https://nexus.extendedmind.org/reposity/releases -Dfile=target/vr-test-data.zip
