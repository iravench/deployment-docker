#!/bin/bash

INFRA_ADDR=$(docker-machine ip infra)
REGISTRY_ADDR="$INFRA_ADDR:5000"
MONITOR_NAME="monitor"
CURRENT_DIR=$(cd $(dirname $0); pwd)
# create the monitor vm if it doesn't already exist
if ! docker-machine inspect $MONITOR_NAME &> /dev/null; then
  docker-machine create \
    --driver virtualbox \
    --virtualbox-memory 2048 \
    --engine-insecure-registry=$REGISTRY_ADDR \
    $MONITOR_NAME
  MONITOR_ADDR=$(docker-machine ip $MONITOR_NAME)
  # start services
  # TBD: dynamically assign consul address, persist data via data container
  docker $(docker-machine config $MONITOR_NAME) run -d \
    -p 9090:9090 \
    -v $CURRENT_DIR/prometheus.yml:/etc/prometheus/prometheus.yml \
    --restart=always \
    --name prometheus \
    $REGISTRY_ADDR/prometheus
else
  MONITOR_ADDR=$(docker-machine ip $MONITOR_NAME)
  printf "\e[32mThe monitor vm is already running at $MONITOR_ADDR...\e[0m\n"
fi
