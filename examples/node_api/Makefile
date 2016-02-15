PROJECT           ?= iravench/example_node_api
TAG               ?= latest

ifdef REGISTRY
    IMAGE=$(REGISTRY)/$(PROJECT):$(TAG)
  else
    IMAGE=$(PROJECT):$(TAG)
  endif

REGISTRY_ADDR  = $(shell docker-machine ip infra):5000
PRIVATE_IMAGE  = $(REGISTRY_ADDR)/$(shell basename $(IMAGE))

all:
	@echo "Available targets:"
	@echo "  * clean     - remove images follow the name $(PROJECT)"
	@echo "  * build     - build an image named $(IMAGE) from Dockerfile"
	@echo "  * private   - build and push the built image as $(PRIVATE_IMAGE) to local private registry"
clean:
	docker images | grep "$(PROJECT)" | grep "$(TAG)" | awk '{print $$3}' | (read id; if [ "$$id" != "" ]; then docker rmi $$id; exit 0; fi)
build: Dockerfile clean
	docker build -t $(IMAGE) .
private: build
	docker tag -f $(IMAGE) $(PRIVATE_IMAGE)
	docker push $(PRIVATE_IMAGE)
	docker rmi -f $(IMAGE)
	docker rmi -f $(PRIVATE_IMAGE)
FORCE:
