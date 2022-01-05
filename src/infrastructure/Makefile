.PHONY: install test build lint deploy

install:
	terraform init \
		-backend-config="bucket=$$TF_STATE_BUCKET" \
		-backend-config="key=$$TF_STATE_KEY" \
		-backend-config="region=$$AWS_REGION"

test:
	@echo "test"

lint:
	tflint --init
	tflint -f compact --module

deploy:
	 TF_VAR_environment=$$ENVIRONMENT TF_VAR_system=$$SYSTEM terraform apply -auto-approve

build:
	@echo "build"
