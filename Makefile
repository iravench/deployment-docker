CURRENT_DIR=$(shell pwd)
REGISTRY_ADDR=$(shell docker-machine ip infra):5000
SWARM_ADDR=$(shell docker-machine ip swarm)
SWARM_1_ADDR=$(shell docker-machine ip swarm-1)
SWARM_2_ADDR=$(shell docker-machine ip swarm-2)
MSG_INIT_SQL=$(shell cat $(CURRENT_DIR)/examples/msg-prototype/msg-storage/init.sql)
MYSQL_DATABASE=bex-msg
MYSQL_USER=pink
MYSQL_PASSWORD=5678

all:
	@echo "Available targets:"
	@echo "  * local_infra_create   - create local infrastructure"
	@echo "  * local_infra_destroy  - destroy local infrastructure"
	@echo "  * local_infra_up       - start local infrastructure"
	@echo "  * local_infra_down     - stop local infrastructure"
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
local_infra_up:
	docker-machine start infra
	docker-machine start monitor
	docker-machine ls
local_infra_down:
	docker-machine stop monitor
	docker-machine stop infra
	docker-machine ls
local_infra_destroy:
	docker-machine rm -f monitor
	docker-machine rm -f infra
	docker-machine ls
local_swarm_create:
	./swarm/local/buildSwarmVM.sh master "for=nginx,foo=bar,broker=1,storage=1"
	./swarm/local/buildSwarmVM.sh 1 "for=app,bar=foo,manager=1"
	./swarm/local/buildSwarmVM.sh 2 "for=app,bar=foo,manager=2"
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
msg_mysql_cli:
	docker run -it --net msg-overlay --rm mysql sh -c \
	  'exec mysql \
	  -h"$(SWARM_ADDR)" \
	  -P"3306" \
	  -D"$(MYSQL_DATABASE)" \
	  -u"$(MYSQL_USER)" \
	  -p"$(MYSQL_PASSWORD)"'
msg_up: msg_down
	docker network create --driver overlay msg-overlay
	docker run -d -e constraint:storage==1 --name msg-storage -p 3306:3306 --net msg-overlay \
	  -e MYSQL_ROOT_PASSWORD=pink5678 \
	  -e MYSQL_DATABASE=$(MYSQL_DATABASE) \
	  -e MYSQL_USER=$(MYSQL_USER) \
	  -e MYSQL_PASSWORD=$(MYSQL_PASSWORD) \
	  mysql:latest
	docker run -it --net msg-overlay --rm mysql sh -c \
	  'exec mysql \
	  -h"$(SWARM_ADDR)" \
	  -P"3306" \
	  -D"$(MYSQL_DATABASE)" \
	  -u"$(MYSQL_USER)" \
	  -p"$(MYSQL_PASSWORD)" \
	  -e"$(MSG_INIT_SQL)"'
	docker run -d -e constraint:broker==1 --name msg-session-broker -p 80:8080 --net msg-overlay \
	  -e MYSQL_IP=$(SWARM_ADDR) \
	  $(REGISTRY_ADDR)/msg-session-broker
	docker run -d -e constraint:manager==1 --name msg-session-manager-1 -p 80:9090 --net msg-overlay \
	  -e MYSQL_IP=$(SWARM_ADDR) \
	  -e FM_ID=fm-1 \
	  -e FM_IP=$(SWARM_1_ADDR) \
	  -e FM_PORT=80 \
	  $(REGISTRY_ADDR)/msg-session-manager
	docker run -d -e constraint:manager==2 --name msg-session-manager-2 -p 80:9090 --net msg-overlay \
	  -e MYSQL_IP=$(SWARM_ADDR) \
	  -e FM_ID=fm-2 \
	  -e FM_IP=$(SWARM_2_ADDR) \
	  -e FM_PORT=80 \
	  $(REGISTRY_ADDR)/msg-session-manager
msg_down: FORCE
	docker kill --signal=SIGINT msg-session-broker || true
	docker kill --signal=SIGINT msg-session-manager-1 || true
	docker kill --signal=SIGINT msg-session-manager-2 || true
	docker rm msg-session-broker || true
	docker rm msg-session-manager-1 || true
	docker rm msg-session-manager-2 || true
	docker rm -f msg-storage || true
	docker network rm msg-overlay || true
FORCE:
