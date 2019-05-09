#!/bin/bash

# Copy the executable jar files in the current directory
if scp -r ../../src/ .
then echo "copy successful !"
fi

# Build the Docker image locally
if docker build --tag orchestra-musician .
then echo "docker image built successfully !"
fi
