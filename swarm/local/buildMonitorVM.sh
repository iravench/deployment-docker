#!/bin/bash

INFRA_ADDR=$(docker-machine ip infra)
REGISTRY_ADDR="$INFRA_ADDR:5000"
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
  printf "\e[32mStarting consul agent...\e[0m\n"
  docker $(docker-machine config $MONITOR_NAME) run -d \
    -p $MONITOR_ADDR:8300:8300 \
    -p $MONITOR_ADDR:8301:8301 \
    -p $MONITOR_ADDR:8301:8301/udp \
    -p $MONITOR_ADDR:8302:8302 \
    -p $MONITOR_ADDR:8302:8302/udp \
    -p $MONITOR_ADDR:8400:8400 \
    -p $MONITOR_ADDR:8500:8500 \
    -p 172.17.0.1:8500:8500 \
    -p 172.17.0.1:53:8600 \
    -p 172.17.0.1:53:8600/udp \
    --restart=always \
    --name $MONITOR_NAME-consul \
    --hostname $MONITOR_NAME-consul \
    $REGISTRY_ADDR/consul-agent -advertise $MONITOR_ADDR -client 0.0.0.0 -join $INFRA_ADDR
  CONSUL_ADDR="172.17.0.1:8500"

  printf "\e[32mStarting registrator...\e[0m\n"
  docker $(docker-machine config $MONITOR_NAME) run -d \
    --name=$MONITOR_NAME-registrator \
    --hostname=$MONITOR_NAME-registrator \
    --restart=always \
    --volume=/var/run/docker.sock:/tmp/docker.sock \
    $REGISTRY_ADDR/registrator -ip $MONITOR_ADDR -cleanup consul://$CONSUL_ADDR

  printf "\e[32mInitiating prometheus...\e[0m\n"
  PERF_MONITOR_NAME="cadvisor"
  ELASTICSEARCH_ADDR="http://172.17.0.1:9200"
  sed \
    -e "s/- job_name:.*/- job_name: '$PERF_MONITOR_NAME'/g" \
    -e "s/- server:.*/- server: '$CONSUL_ADDR'/g" \
    -e "s/services:.*/services: ['$PERF_MONITOR_NAME']/g" \
    $CURRENT_DIR/prometheus_template.yml > $TEMP_DIR/prometheus.yml
  # TBD: persist data via data volume container so monitor data could survive monitor vm down time.
  docker $(docker-machine config $MONITOR_NAME) run -d \
    -p 9090:9090 \
    -v $TEMP_DIR/prometheus.yml:/etc/prometheus/prometheus.yml \
    --restart=always \
    --name prometheus \
    --hostname prometheus \
    $REGISTRY_ADDR/prometheus

  printf "\e[32mInitiating logbox...\e[0m\n"
  docker $(docker-machine config $MONITOR_NAME) run -d \
    -p 9080:5000/udp \
    -p 172.17.0.1:9200:9200 \
    --restart=always \
    --name logbox \
    --hostname logbox \
    $REGISTRY_ADDR/minilogbox
  docker $(docker-machine config $MONITOR_NAME) run -d \
    -p 9060:5601 \
    --restart=always \
    --name kibanabox \
    --hostname kibanabox \
    $REGISTRY_ADDR/kibanabox $ELASTICSEARCH_ADDR
else
  MONITOR_ADDR=$(docker-machine ip $MONITOR_NAME)
  printf "\e[32mThe monitor vm is already running at $MONITOR_ADDR...\e[0m\n"
fi
