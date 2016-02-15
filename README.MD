# typical dockerized deployment

## develop apps on local swarm

### how to run the example
if you haven't, install docker, docker-machine, and make

setup infrastructure vm, which serves as consul master, private docker hub
```shell
make local_infra_create
```
setup docker swarm cluster, 1 master, 2 slave nodes
```shell
make local_swarm_create
```
config local docker client to connect to swarm
```shell
eval "$(docker-machine env --swarm swarm)"
```
build and publish the example app into private docker hub
```shell
cd examples/node_api
make private
```
start example, this step starts a nginx container on swarm master, two nodejs app containers on slave nodes. these containers communicate with each other via an overlay network, only the nginx container exposed port 80 on swarm master. traffics coming in are reversed proxied through this port to one of the two backend node api containers.
```shell
cd ../../
make example_up
```
if everything goes well, you should now be able to access the example via the address produced from previous step, via http://swarm_master_vm_ip:80/

also, when the example app starts, it gets registered automatically into consul running on the infrastructure vm, which you can access via http://infrastructure_vm_ip:8500/ui/#/dc1/services. you should be able to see the example app just deployed listed under the name example-api-80 and in a healthy state.
