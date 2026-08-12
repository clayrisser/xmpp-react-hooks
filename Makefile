.POSIX:
export ROOTDIR ?= $(eval ROOTDIR := $(shell git rev-parse --show-toplevel))$(ROOTDIR)
include $(ROOTDIR)/make.mk

.DEFAULT_GOAL := build

ASDF_VERSION ?= v0.18.0

.PHONY: prepare prepare/asdf prepare/cloc
prepare: sudo
	@command -v asdf >/dev/null 2>&1 || $(MAKE) prepare/asdf
	@command -v cloc >/dev/null 2>&1 || $(MAKE) prepare/cloc
	@awk '!/^#/ && NF {print $$1}' .tool-versions | \
		while read t; do asdf plugin add "$$t" 2>/dev/null || true; done
	@rcfile=$$(mktemp); \
		{ asdf install 2>&1; echo $$? >$$rcfile; } | grep --line-buffered -v 'is already installed' || true; \
		rc=$$(cat $$rcfile); rm -f $$rcfile; exit $$rc
	@$(PNPM) install
prepare/asdf:
	@command -v brew >/dev/null 2>&1 && brew install asdf || { \
		o=$$(uname | tr A-Z a-z); a=$$(uname -m | sed 's/x86_64/amd64/;s/aarch64/arm64/'); \
		curl -fsSL "https://github.com/asdf-vm/asdf/releases/download/$(ASDF_VERSION)/asdf-$(ASDF_VERSION)-$$o-$$a.tar.gz" \
			| $(SUDO) tar -xz -C /usr/local/bin asdf; \
	}
prepare/cloc:
	@$(PKG_INSTALL) cloc

.PHONY: configure
configure:
	@for cmd in asdf $(CLOC) node $(PNPM) docker; do \
		command -v $$cmd >/dev/null 2>&1 || { echo "$$cmd is missing, run \`make prepare\`"; exit 1; }; \
	done
	@$(PNPM) install --prefer-offline

.PHONY: build
build: configure
	@$(PNPM) build

.PHONY: typecheck
typecheck: configure
	@$(PNPM) typecheck

.PHONY: test
test: test/unit test/integration

.PHONY: test/unit
test/unit: configure
	@$(PNPM) run test/unit

# Brings its own Prosody up on the shifted ports, then tears it down again
# unless KEEP_STACK is set so a failing run can be poked at.
.PHONY: test/integration
test/integration: configure
	@trap '[ -n "$(KEEP_STACK)" ] || $(MAKE) docker/down' EXIT INT TERM; \
		$(MAKE) docker/up-d && $(PNPM) run test/integration

.PHONY: format
format: configure
	@$(PNPM) format

.PHONY: lint
lint: configure
	@$(PNPM) lint

.PHONY: count
count:
	@$(CLOC) $$($(GIT) ls-files)

.PHONY: docker docker/%
docker: FORCE
	@$(MAKE) -C docker
docker/%: FORCE
	@$(MAKE) -C docker $*

.PHONY: clean
clean:
	@$(PNPM) clean
	@rm -rf $(MAKEDIR)

.PHONY: purge
purge: clean
	@$(GIT) clean -fxd
