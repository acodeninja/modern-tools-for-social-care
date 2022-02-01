.PHONY: build-command
build-command:
	@cd src/framework/command && npm run build

.PHONY: init
init:
	@npm install
	@cd src/framework/service && npm install
	@cd src/framework/internals && npm install
