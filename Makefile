SHELL:=/bin/bash

COMMIT_HASH?=$(shell git rev-parse --short HEAD)
COMMIT_BRANCH?=$(shell git rev-parse --abbrev-ref HEAD)
IMAGE_NAME=gold-price-tracker
AWS_REGION=ap-south-1
AWS_ACCOUNT_ID=263095946180

.PHONY: build-fe build-be push deploy localrun update-ecs

build-fe: 
	docker pull public.ecr.aws/docker/library/node:16-buster
	docker buildx build --platform linux/amd64 -f frontend/Dockerfile -t $(AWS_ACCOUNT_ID).dkr.ecr.$(AWS_REGION).amazonaws.com/$(IMAGE_NAME)-frontend:$(COMMIT_HASH) -t $(AWS_ACCOUNT_ID).dkr.ecr.$(AWS_REGION).amazonaws.com/$(IMAGE_NAME)-frontend:latest --push frontend

build-be: 
	docker buildx build --platform linux/amd64 -f backend/gold_price_service/Dockerfile -t $(AWS_ACCOUNT_ID).dkr.ecr.$(AWS_REGION).amazonaws.com/$(IMAGE_NAME)-backend:$(COMMIT_HASH) -t $(AWS_ACCOUNT_ID).dkr.ecr.$(AWS_REGION).amazonaws.com/$(IMAGE_NAME)-backend:latest --push backend/gold_price_service

push: login
	# Images are already pushed in the build step with the correct tags
	echo "Images have already been pushed in the build step."

deploy: login build update-ecs

update-ecs: 
	aws ecs update-service --cluster mjw-prod --service mjw-retail-gold-tracker --force-new-deployment

build: build-fe build-be

localrun:
	docker-compose -f bin/localrun.yaml up

login: 
	aws ecr get-login-password --region $(AWS_REGION) | docker login --username AWS --password-stdin $(AWS_ACCOUNT_ID).dkr.ecr.$(AWS_REGION).amazonaws.com