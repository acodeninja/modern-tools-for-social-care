.PHONY: install test build lint deploy

install:
	npm ci

test:
	npm run test

lint:
	@echo "LINTING!"

deploy:
	terraform apply -auto-approve

build:
	npm run build
