SHORT_NAME        ?= broker
PROJECT           ?= iravench/msg-session-$(SHORT_NAME)
TAG               ?= latest

ifdef REGISTRY
    IMAGE=$(REGISTRY)/$(PROJECT):$(TAG)
  else
    IMAGE=$(PROJECT):$(TAG)
  endif

REGISTRY_ADDR = $(shell docker-machine ip infra):5000
PRIVATE_IMAGE = $(REGISTRY_ADDR)/$(shell basename $(IMAGE))

all:
	@echo "available targets:"
	@echo "  * clean     - remove images of name $(PROJECT)"
	@echo "  * build     - build a docker image of the name $(IMAGE) from Dockerfile"
	@echo "  * registry  - build a docker image of the name $(IMAGE) then push it to local private registry"
	@echo "  * run       - run docker image as container of the name $(SHORT_NAME)"
	@echo "  * remove    - stop and remove docker container of the name $(SHORT_NAME)"
clean:
	docker images | grep "$(PROJECT)" | grep "$(TAG)" | awk '{print $$3}' | (read id; if [ "$$id" != "" ]; then docker rmi $$id; exit 0; fi)
build: Dockerfile clean
	npm run compile
	docker build -t $(IMAGE) .
run:
	docker run -d -i -t -p 8080:8080 --name $(SHORT_NAME) $(PROJECT) nodemon
remove:
	docker rm -f $(SHORT_NAME)
registry: build
	docker tag -f $(IMAGE) $(PRIVATE_IMAGE)
	docker push $(PRIVATE_IMAGE)
	docker rmi -f $(IMAGE)
	docker rmi -f $(PRIVATE_IMAGE)
FORCE:
