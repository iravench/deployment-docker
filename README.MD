# a typical dockerized deployment setup

## diagram
![infrastructure diagram](/infrastructure-dev-diagram.png?raw=true "Infrastructure diagram")

## services
### registry
a private docker hub, providing easy access to a handful of useful images. you can also store your internal docker build artifacts here.
### consul
a key-value store, providing service registration, discovery, DNS lookup, etc.
### registrator
a running container, which monitors other containers' life-cycle events, combined with a predefined set of meta data, provides auto service registration and query.
### prometheus
a visualization hub of system performance, it is configured to collect various metrics from cAdvisor via http endpoint.
### cAdvisor
a tool for collecting containers or machine level performance metrics, serving as data feed for prometheus.
### ELK log stack
ElasticSearch, Logstash and Kibana, for collecting, filtering and visualizing log outputs gathered via logspout.

## common workflow
depending on the size and complexity of your application, it could further be subdivided into smaller applications. each of this small applications are composed of small, inter-connected components, and expose a set of services for other applications to consume.

in this particular dockerized infrastructure setup, you're encouraged to develop each of these components one at a time and deployed them as containers. related containers can be grouped by a docker overlay network, therefore internal communications are hidden and protected; containers which do expose public services do so by publishing ports on their living host, which ports immediately get picked up by registrator and subsequently appear at consul as publicly query-able services, either via http query or DNS lookup.

these self contained applications should be optimized as basic blocks for building scalable systems. whenever necessary, new machines can be boot up and join the swarm, new application instances could be deployed, get registered for auto discovery via consul, to address specific computing or load handling requirements.
also, log output via stdout and stderr get auto picked up, you can search and monitor them via ELK stack.

### how run provided example app
if you haven't, install docker, docker-machine.

build infrastructure, which provides service discovery, private docker registry, monitoring...
```shell
make local_infra_create
```
setup docker swarm cluster, the example employs a 1 master, 2 slave setup
```shell
make local_swarm_create
```
config docker client, which connects it to above newly created swarm cluster
```shell
eval "$(docker-machine env --swarm swarm)"
```
build and publish example to private docker registry
```shell
cd examples/node_api
make private
```
run the example, this step creates a nginx container on swarm master, two nodejs app containers on slave nodes. these containers communicate with each other via an overlay network. only the nginx container exposed port 80 on the swarm master host machine. traffics coming in from port 80 are reversed proxied to one of the two backend node app for further processing.
```shell
cd ../../
make example_up
```
if everything goes well, you should be able to access the example via an address produced from previous step, something like http://swarm_master:80/

also, when the example app starts, it gets automatically registered to consul, which you can access via http://infrastructure:8500/ui/#/dc1/services. you should be able to see the example app just deployed listed under the name example-api-80 and in a healthy state.
