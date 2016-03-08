# a local dockerized deployment setup to mimic the multi-host scenario

## a diagram showing the main access points
![infrastructure diagram](/infrastructure-dev-diagram.png?raw=true "Infrastructure diagram")

## services provided by the infrastructure
### docker image registry
a private docker hub, providing easy access to a handful of useful images. you can also store your internal docker build artifacts here.
### consul
a key-value store, providing service registration, discovery, DNS lookup, etc.
### registrator
a running container, which monitors other containers' life-cycle events, combined with a predefined set of meta data, provides auto service registration.
### prometheus
a visualization hub for monitoring node performance, it is configured to collect various performance metrics from cAdvisor via http endpoints.
### cAdvisor
a tool for collecting containers and machine level performance metrics, serving as data feed for prometheus and performance monitor for individual box.
### ELK log stack
ElasticSearch, Logstash and Kibana, for collecting, filtering and visualizing log outputs gathered via logspout.

## a common workflow
if you're developing an application, even one consist of multiple components and involving some complex topology, you can still pretty much get away with with one docker vm, and using docker-compose to ease the workflow maybe. this setup is intended to provide a multi-host environment so you can deploy multiple apps to and experiment with, so you can learn how your application interact with others and the environment.

depending on the size and complexity of your application, it could be further divided into smaller applications. each of this application then again is composed of smaller, inter-connected components, and may expose some services for others to consume.

in light of such, you're encouraged to develop each of these components one at a time with what should be and what should not be exposed in mind, and deployed them as containers. inter-related containers can be grouped together and connect with each other through a specific docker overlay network, therefore hiding internal communications; containers which do provide services do so by exposing ports on their host machine. these ports get immediately picked up by registrator and subsequently published by consul as query-able services, either through http or DNS lookup.

for some inter-connected components you might want to use bridge networking when deploy for better communication throughput, which means they should be deployed on the same machine, which can be achieved via labels and constraints.

this type of self contained application could be optimized as a basic block for building scalable systems. whenever necessary, new machines can be boot up and join the swarm, new application instances can be deployed, registered and available through auto discovery provided by consul.

also, containers log output via stdout and stderr gets auto picked up by logspout, you can then search and filter them via the ELK stack.

### how to run the provided example
if you haven't, install docker, and docker-machine.

create infrastructure, which provides service discovery, private docker registry, and a monitor box...
```shell
make local_infra_create
```
setup docker swarm cluster, this specific makefile employs a 1 swarm master, 2 slave node setup
```shell
make local_swarm_create
```
connect docker client to the swarm
```shell
eval "$(docker-machine env --swarm swarm)"
```
build and push example app to the private registry
```shell
cd examples/node_api
make private
```
now you can run the example, this step creates a nginx container on the swarm master, two nodejs app containers on the two slave nodes. these containers communicate with each other via an overlay network. only the nginx container exposed port 80 on the swarm master host. traffics coming in from this port 80 are reversed proxied to one of the two backend node apps for further processing.
```shell
cd ../../
make example_up
```
if everything goes well, you should be able to access the example via an address produced from the previous step, something like http://swarm_master_ip

also, when the example app starts, it gets automatically registered to consul, which you can access via http://infrastructure_ip:8500/ui/#/dc1/services. you should be able to see the example app listed under the name example-api-80 and in a healthy state.
