cd ../backend
mvn docker:build
cd ../e2e
mvn docker:stop docker:start
mvn docker:logs
