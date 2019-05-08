#!/bin/bash

# Copy the executable jar files in the current directory
scp -r ../../src/
echo "copy successful !"

# Build the Docker image locally
docker build --tag orchestra-auditor .

echo "docker image built successfully !"

# the executable jar files in the current directory 
rm -rf ../../src/

echo "cleaning directory done"