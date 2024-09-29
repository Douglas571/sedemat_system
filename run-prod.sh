#!/bin/bash

# Bring up services with production settings
docker-compose -f docker-compose.yaml -f docker-compose.prod.yaml up
