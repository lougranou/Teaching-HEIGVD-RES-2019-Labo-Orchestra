#!/bin/bash

# Copy the executable jar file in the current directory
scp -r ../../src .

# Build the Docker image locally
docker build --tag orchestra-musician .