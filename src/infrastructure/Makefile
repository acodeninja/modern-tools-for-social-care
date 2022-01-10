.PHONY: install test build lint deploy

install:
	terraform init -backend=false

test:
	@echo "test"

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
	terraform plan -out plan.tfplan

build:
	@echo "build"
