CURRENT_DIR=$(shell pwd)
REGISTRY_ADDR=$(shell docker-machine ip infra):5000
SWARM_ADDR=$(shell docker-machine ip swarm)

all:
	@echo "Available targets:"
	@echo "  * local_infra_create   - create local infrastructure vm"
	@echo "  * local_infra_destroy  - destroy local infrastructure vm"
	@echo "  * local_swarm_create   - create local swarm cluster"
	@echo "  * local_swarm_destroy  - destroy local swarm cluster"
	@echo "  * local_swarm_up       - start local swarm cluster"
	@echo "  * local_swarm_down     - stop local swarm cluster"
	@echo "  * example_up           - start example app on local swarm cluster"
	@echo "  * example_down         - stop & remove example app from local swarm cluster"
local_infra_create:
	./swarm/local/buildInfraVM.sh
	./swarm/local/buildMonitorVM.sh
	docker-machine ls
local_infra_destroy:
	docker-machine rm -f monitor
	docker-machine rm -f infra
	docker-machine ls
local_swarm_create:
	./swarm/local/buildSwarmVM.sh master "for=nginx,foo=bar"
	./swarm/local/buildSwarmVM.sh 1 "for=app,bar=foo"
	./swarm/local/buildSwarmVM.sh 2 "for=app,bar=foo"
	docker-machine ls
local_swarm_destroy:
	docker-machine rm -f swarm-2
	docker-machine rm -f swarm-1
	docker-machine rm -f swarm
	docker-machine ls
local_swarm_up:
	docker-machine start swarm
	docker-machine start swarm-1
	docker-machine start swarm-2
	docker-machine ls
local_swarm_down:
	docker-machine stop swarm-2
	docker-machine stop swarm-1
	docker-machine stop swarm
	docker-machine ls
example_up: example_down
	docker network create --driver overlay overlay
	docker run -d -e constraint:for==app --name node_api_01 --net overlay \
	  $(REGISTRY_ADDR)/example_node_api
	docker run -d -e constraint:for==app --name node_api_02 --net overlay \
	  $(REGISTRY_ADDR)/example_node_api
	docker run -d -e constraint:for==nginx --name example_api -p 80:80 --net overlay \
	  -e SERVICE_80_NAME=example-api \
	  -e SERVICE_80_CHECK_HTTP=/api/v1/health \
	  -e SERVICE_80_CHECK_INTERVAL=15s \
	  -e SERVICE_80_TIMEOUT=1s \
	  -v $(CURRENT_DIR)/examples/node_api/nginx.conf:/etc/nginx/nginx.conf:ro \
	  -v $(CURRENT_DIR)/examples/static:/usr/share/nginx/html:ro \
	  $(REGISTRY_ADDR)/nginx
	echo "example is now live on http://$(SWARM_ADDR)"
example_down: FORCE
	docker rm -f example_api || true
	docker rm -f node_api_01 || true
	docker rm -f node_api_02 || true
	docker network rm overlay || true
FORCE:
