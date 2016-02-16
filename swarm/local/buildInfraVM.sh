#!/bin/bash

# create the infra vm if it doesn't already exist
if ! docker-machine inspect infra &> /dev/null; then
  docker-machine create --driver virtualbox --virtualbox-memory 2048 infra
  INFRA_ADDR=$(docker-machine ip infra)
  REGISTRY_ADDR="$INFRA_ADDR:5000"
  #TBD config a secure registry
  docker-machine ssh infra "echo $'EXTRA_ARGS=\"--insecure-registry '$REGISTRY_ADDR'\"' | sudo tee -a /var/lib/boot2docker/profile && sudo /etc/init.d/docker restart"
  sleep 5
  # start services
  docker $(docker-machine config infra) run -d \
    -p 5000:5000 \
    --restart=always \
    --name registry \
    --hostname registry \
    registry:2
  docker $(docker-machine config infra) run -d \
    -p $INFRA_ADDR:8300:8300 \
    -p $INFRA_ADDR:8301:8301 \
    -p $INFRA_ADDR:8301:8301/udp \
    -p $INFRA_ADDR:8302:8302 \
    -p $INFRA_ADDR:8302:8302/udp \
    -p $INFRA_ADDR:8400:8400 \
    -p $INFRA_ADDR:8500:8500 \
    -p 172.17.0.1:53:53 -p 172.17.0.1:53:53/udp \
    --restart=always \
    --name consul \
    --hostname consul \
    gliderlabs/consul-server -server -advertise $INFRA_ADDR -bootstrap-expect 1
else
  INFRA_ADDR=$(docker-machine ip infra)
  REGISTRY_ADDR="$INFRA_ADDR:5000"
  printf "\e[32mThe infrastructure vm is already running at $INFRA_ADDR...\e[0m\n"
fi

# init registry with pre-defined set of images for private use
eval $(docker-machine env infra)

REGISTRY_ADDR=$(docker-machine ip infra):5000
PRESET_IMAGES="gliderlabs/consul-server, swarm:latest, gliderlabs/registrator, sirile/minilogbox, sirile/kibanabox, node:slim, nginx"
PRESET_IMAGES="$PRESET_IMAGES, gliderlabs/logspout, prom/prometheus, google/cadvisor"

process_images() {
  local public_image_name=$1
  printf "\e[32mStart processing image \e[33m$public_image_name\e[32m...\e[0m\n"
  docker pull $public_image_name
  local private_image_name="$REGISTRY_ADDR/$(basename $public_image_name | cut -d':' -f 1)"
  docker tag $public_image_name $private_image_name
  docker push $private_image_name
}

IFS=', ' read -r -a array <<< $PRESET_IMAGES
for image_name in "${array[@]}"
do
  process_images $image_name
done
