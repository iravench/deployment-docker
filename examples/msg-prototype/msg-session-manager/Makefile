PROJECT           ?= iravench/msg-session-manager
TAG               ?= latest

ifdef REGISTRY
    IMAGE=$(REGISTRY)/$(PROJECT):$(TAG)
  else
    IMAGE=$(PROJECT):$(TAG)
  endif

all:
	@echo "available targets:"
	@echo "  * clean     - remove images follow the name $(PROJECT)"
	@echo "  * build     - build a docker image with the name $(IMAGE) from Dockerfile"
	@echo "  * registry  - build a docker image with the name $(IMAGE) then push it to local private registry"
clean:
	docker images | grep "$(PROJECT)" | grep "$(TAG)" | awk '{print $$3}' | (read id; if [ "$$id" != "" ]; then docker rmi $$id; exit 0; fi)
build: Dockerfile clean
	docker build -t $(IMAGE) .
registry: build
	REGISTRY_ADDR = $(shell docker-machine ip infra):5000
	PRIVATE_IMAGE = $(REGISTRY_ADDR)/$(shell basename $(IMAGE))
	docker tag -f $(IMAGE) $(PRIVATE_IMAGE)
	docker push $(PRIVATE_IMAGE)
	docker rmi -f $(IMAGE)
	docker rmi -f $(PRIVATE_IMAGE)
FORCE:
