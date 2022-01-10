.PHONY: install test build lint deploy

install:
	npm ci
	cd infrastructure && terraform init -backend=false

test:
	npm run test

lint:
	@echo "LINTING!"

deploy:
	cd infrastructure && terraform init \
		-backend-config="bucket=$$TF_STATE_BUCKET" \
		-backend-config="key=$$TF_STATE_KEY" \
		-backend-config="region=$$AWS_REGION"
	cd infrastructure && terraform apply plan.tfplan

plan-deploy:
	cd infrastructure && terraform init \
		-backend-config="bucket=$$TF_STATE_BUCKET" \
		-backend-config="key=$$TF_STATE_KEY" \
		-backend-config="region=$$AWS_REGION"
	cd infrastructure && terraform plan -out plan.tfplan

build:
	npm run build
