.PHONY: install test build lint deploy

install:
	npm ci
	terraform init -backend=false

test:
	npm run test

lint:
	tflint --init
	tflint -f compact --module

deploy:
	terraform init \
		-backend-config="bucket=$$TF_STATE_BUCKET" \
		-backend-config="key=$$TF_STATE_KEY" \
		-backend-config="region=$$AWS_REGION"
	terraform apply plan.tfplan

plan-deploy:
	terraform init \
		-backend-config="bucket=$$TF_STATE_BUCKET" \
		-backend-config="key=$$TF_STATE_KEY" \
		-backend-config="region=$$AWS_REGION"
	terraform plan \
		-var-file ../../../environments/config.tfvars \
		-var-file "../../../environments/$$DEPLOY_TARGET/config.tfvars" \
		-out plan.tfplan

build:
	npm run build
