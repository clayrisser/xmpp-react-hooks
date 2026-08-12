.POSIX:
ROOTDIR ?= $(eval ROOTDIR := $(shell git rev-parse --show-toplevel))$(ROOTDIR)
include $(ROOTDIR)/make.mk

.DEFAULT_GOAL := up-d

COMPOSE_ARGS ?= -f $(ROOTDIR)/docker/compose.yaml

.PHONY: build build/%
build: FORCE
	@$(COMPOSE) $(COMPOSE_ARGS) build
build/%: FORCE
	@$(COMPOSE) $(COMPOSE_ARGS) build $*

.PHONY: up up/%
up: FORCE
	@$(COMPOSE) $(COMPOSE_ARGS) up
up/%: FORCE
	@$(COMPOSE) $(COMPOSE_ARGS) up $*

.PHONY: up-d up-d/%
up-d: FORCE
	@$(COMPOSE) $(COMPOSE_ARGS) up -d --wait
up-d/%: FORCE
	@$(COMPOSE) $(COMPOSE_ARGS) up -d --wait $*

.PHONY: down
down: FORCE
	@$(COMPOSE) $(COMPOSE_ARGS) down --volumes --remove-orphans

.PHONY: logs logs/%
logs: FORCE
	@$(COMPOSE) $(COMPOSE_ARGS) logs -f
logs/%: FORCE
	@$(COMPOSE) $(COMPOSE_ARGS) logs -f $*

.PHONY: ps
ps: FORCE
	@$(COMPOSE) $(COMPOSE_ARGS) ps
