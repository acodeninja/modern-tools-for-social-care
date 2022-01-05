.PHONY: install test build lint deploy

install:
	npm ci
	cd infrastructure && terraform init \
		-backend-config="bucket=$$TF_STATE_BUCKET" \
		-backend-config="key=$$TF_STATE_KEY" \
		-backend-config="region=$$AWS_REGION"

test:
	npm run test

lint:
	@echo "LINTING!"

deploy:
	cd infrastructure && terraform apply -auto-approve

build:
	npm run build
