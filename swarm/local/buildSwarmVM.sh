#!/bin/bash

[ $# -lt 1 ] || [ $1 == "-h" ] && { echo "Usage: $0 [-h] <id, master/other unique names> [labels, foo=bar,zoo=mar...]"; exit 1; }

# parse docker engine labels
if [ $1 == "master" ]; then
  LABELS="--engine-label type=master"
else
  LABELS="--engine-label type=normal"
fi

if [ "$2" ]; then
  IFS=', ' read -r -a array <<< $2
  for element in "${array[@]}"
  do
    LABELS="$LABELS --engine-label $element"
  done
fi

MASTER_NAME="swarm"
INFRA_ADDR=$(docker-machine ip infra)
REGISTRY_ADDR="$INFRA_ADDR:5000"
CONSUL_ADDR="$INFRA_ADDR:8500"
if [ $1 == "master" ]; then
  SWARM_NODE_NAME=$MASTER_NAME
  if ! docker-machine inspect $SWARM_NODE_NAME &> /dev/null; then
    printf "\e[32mCreating swarm master named \e[33m'$SWARM_NODE_NAME' \e[32mlocally...\e[0m\n"
    docker-machine create \
      --driver virtualbox \
      --swarm --swarm-master \
      --swarm-discovery consul://$CONSUL_ADDR \
      --swarm-image $REGISTRY_ADDR/swarm \
      --engine-opt="cluster-store=consul://$CONSUL_ADDR" \
      --engine-opt="cluster-advertise=eth1:2376" \
      --engine-opt="dns=172.17.0.1" \
      --engine-insecure-registry=$REGISTRY_ADDR \
      $LABELS \
      $SWARM_NODE_NAME
    SWARM_NODE_ADDR=$(docker-machine ip $SWARM_NODE_NAME)
  else
    printf "\e[32m$SWARM_NODE_NAME is already running \e[0m\n"
    exit 1
  fi
else
  SWARM_NODE_NAME="swarm-$1"
  if ! docker-machine inspect $SWARM_NODE_NAME &> /dev/null; then
    printf "\e[32mCreating swarm node named \e[33m'$SWARM_NODE_NAME' \e[32mlocally...\e[0m\n"
    docker-machine create \
      --driver virtualbox \
      --swarm \
      --swarm-discovery consul://$CONSUL_ADDR \
      --swarm-image $REGISTRY_ADDR/swarm \
      --engine-opt="cluster-store=consul://$CONSUL_ADDR" \
      --engine-opt="cluster-advertise=eth1:2376" \
      --engine-opt="dns=172.17.0.1" \
      --engine-insecure-registry=$REGISTRY_ADDR \
      $LABELS \
      $SWARM_NODE_NAME
    SWARM_NODE_ADDR=$(docker-machine ip $SWARM_NODE_NAME)
  else
    printf "\e[32m$SWARM_NODE_NAME is already running \e[0m\n"
    exit 1
  fi
fi

printf "\e[32mStarting consul agent...\e[0m\n"
docker $(docker-machine config $SWARM_NODE_NAME) run -d \
  -p $SWARM_NODE_ADDR:8300:8300 \
  -p $SWARM_NODE_ADDR:8301:8301 \
  -p $SWARM_NODE_ADDR:8301:8301/udp \
  -p $SWARM_NODE_ADDR:8302:8302 \
  -p $SWARM_NODE_ADDR:8302:8302/udp \
  -p $SWARM_NODE_ADDR:8400:8400 \
  -p $SWARM_NODE_ADDR:8500:8500 \
  -p 172.17.0.1:53:53 -p 172.17.0.1:53:53/udp \
  --restart=always \
  --name $SWARM_NODE_NAME-consul \
  --hostname $SWARM_NODE_NAME-consul \
  $REGISTRY_ADDR/consul -advertise $SWARM_NODE_ADDR -join $INFRA_ADDR

# by applying the -ip option, we force registrator to use host external ip when registering services
# this is because we only want register containers which expose ports on the host
# for those not exposing any but considered parts of an application, could gain access to each other through overlay networking
printf "\e[32mStarting registrator...\e[0m\n"
docker $(docker-machine config $SWARM_NODE_NAME) run -d \
  --name=$SWARM_NODE_NAME-registrator \
  --restart=always \
  --volume=/var/run/docker.sock:/tmp/docker.sock \
  $REGISTRY_ADDR/registrator -ip $SWARM_NODE_ADDR consul://$CONSUL_ADDR