.PHONY: install test build lint deploy

install:
	terraform init \
		-backend-config="bucket=$$TF_STATE_BUCKET" \
		-backend-config="key=$$TF_STATE_KEY" \
		-backend-config="region=$$AWS_DEFAULT_REGION"

test:
	@echo "test"

lint:
	tflint --init
	tflint -f compact --module

deploy:
	@echo "DEPLOY!"

build:
	@echo "build"
