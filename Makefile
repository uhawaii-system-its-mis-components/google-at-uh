yellow = \033[1;33m
green = \033[01;32m
blue = \033[01;34m
lblue = \033[00;34m
cyan = \033[00;36m
white = \033[1;37m
red = \033[1;31m
default = \033[0m

DOCKER_TOOLS_VERSION=18.05.08
stackName=google-at-uh

shell:
	@echo
	@echo "$(yellow)google-at-uh$(default)"
	@echo
	@echo "Start the server with:"
	@echo "$(green)polymer serve --hostname 0.0.0.0$(default)"
	@echo "Then request $(blue)http://localhost/$(default)"
	@echo
	@docker-compose run --service-ports --rm polymer-cli sh

deploy:
	@echo
	@echo "$(yellow)google-at-uh$(default)"
	@echo
	@echo "URL: $(blue)http://localhost/google-at-uh/$(default)"
	@echo
	docker-compose config | docker stack deploy -c - $(stackName)
	@docker run --rm -it --userns host \
			-v /var/run/docker.sock:/var/run/docker.sock \
			registry.pvt.hawaii.edu/docker-tools:$(DOCKER_TOOLS_VERSION) \
			node node-scripts/stack-health.js $(stackName) 20 1

undeploy:
	@echo
	@echo "$(yellow)google-at-uh$(default)"
	@echo
	docker stack rm $(stackName)
	docker run --rm -it --userns host \
		-v /var/run/docker.sock:/var/run/docker.sock \
		registry.pvt.hawaii.edu/docker-tools:$(DOCKER_TOOLS_VERSION) \
		node node-scripts/stack-wait.js $(stackName)

redeploy: undeploy deploy
