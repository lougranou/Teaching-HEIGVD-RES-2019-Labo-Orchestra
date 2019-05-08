#!/bin/bash

# Copy the executable jar file in the current directory
scp -r ../../src/ .

echo "copy successful !"

# Build the Docker image locally
docker build --tag orchestra-auditor .