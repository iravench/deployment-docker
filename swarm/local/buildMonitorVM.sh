#!/bin/bash

INFRA_ADDR=$(docker-machine ip infra)
REGISTRY_ADDR="$INFRA_ADDR:5000"
CONSUL_ADDR="$INFRA_ADDR:8500"
MONITOR_NAME="monitor"
CURRENT_DIR=$(cd $(dirname $0); pwd)
TEMP_DIR=$CURRENT_DIR/../../.tmp
mkdir -p $TEMP_DIR
# create the monitor vm if it doesn't already exist
if ! docker-machine inspect $MONITOR_NAME &> /dev/null; then
  docker-machine create \
    --driver virtualbox \
    --virtualbox-memory 2048 \
    --engine-insecure-registry=$REGISTRY_ADDR \
    $MONITOR_NAME
  MONITOR_ADDR=$(docker-machine ip $MONITOR_NAME)
  # start services
  printf "\e[32mStart initiating monitor services...\e[0m\n"
  printf "\e[32mInitiating prometheus...\e[0m\n"
  PERF_MONITOR_NAME="cadvisor"
  sed \
    -e "s/- job_name:.*/- job_name: '$PERF_MONITOR_NAME'/g" \
    -e "s/- server:.*/- server: '$CONSUL_ADDR'/g" \
    -e "s/services:.*/services: ['$PERF_MONITOR_NAME']/g" \
    $CURRENT_DIR/prometheus_template.yml > $TEMP_DIR/prometheus.yml
  # TBD: persist data via data container so monitor data could survive monitor vm down time.
  docker $(docker-machine config $MONITOR_NAME) run -d \
    -p 9090:9090 \
    -v $TEMP_DIR/prometheus.yml:/etc/prometheus/prometheus.yml \
    --restart=always \
    --name prometheus \
    $REGISTRY_ADDR/prometheus
else
  MONITOR_ADDR=$(docker-machine ip $MONITOR_NAME)
  printf "\e[32mThe monitor vm is already running at $MONITOR_ADDR...\e[0m\n"
fi
