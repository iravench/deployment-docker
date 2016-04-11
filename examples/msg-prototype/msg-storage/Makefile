REDIS_NAME        ?= msg-storage-redis
MYSQL_NAME        ?= msg-storage-mysql

all:
	@echo "available targets:"
	@echo "  * run        - run both redis and mysql servers as docker containers"
	@echo "  * remove     - stop and remove the redis and mysql containers"
	@echo "  * redis_logs - display logs of the redis server container"
	@echo "  * mysql_logs - display logs of the mysql server container"
run:
	docker run -d -p 6379:6379 --name $(REDIS_NAME) \
	  redis:alpine
	docker run -d -p 3306:3306 --name $(MYSQL_NAME) \
	  -e MYSQL_ROOT_PASSWORD=pink5678 \
	  -e MYSQL_DATABASE=bex-msg \
	  -e MYSQL_USER=pink \
	  -e MYSQL_PASSWORD=5678 \
	  mysql:latest
remove:
	docker rm -f $(REDIS_NAME)
	docker rm -f $(MYSQL_NAME)
redis_logs:
	docker logs $(REDIS_NAME)
mysql_logs:
	docker logs $(MYSQL_NAME)
mysql_shell:
	docker exec -it $(MYSQL_NAME) sh
mysql_cli:
	docker run -it --link $(MYSQL_NAME):mysql --rm mysql sh -c \
	  'exec mysql -h"$$MYSQL_PORT_3306_TCP_ADDR" \
	  -P"$$MYSQL_PORT_3306_TCP_PORT" \
	  -D"$$MYSQL_ENV_MYSQL_DATABASE" \
	  -u"$$MYSQL_ENV_MYSQL_USER" \
	  -p"$$MYSQL_ENV_MYSQL_PASSWORD"'
FORCE:
