SHELL:=/bin/bash

COMMIT_HASH?=$(shell git rev-parse --short HEAD)
COMMIT_BRANCH?="$(shell git rev-parse --abbrev-ref HEAD)"
IMAGE_NAME=gold-price-tracker

.PHONY: build-fe build-be push deploy localrun

build-fe: .
		docker pull public.ecr.aws/docker/library/node:16-buster
		docker build -f frontend/Dockerfile -t $(IMAGE_NAME)-frontend:$(COMMIT_HASH) -t $(IMAGE_NAME)-frontend:latest frontend

build-be: .
		docker build -f backend/gold_price_service/Dockerfile -t $(IMAGE_NAME)-backend:$(COMMIT_HASH) -t $(IMAGE_NAME)-backend:latest backend/gold_price_service

push: .
		docker tag $(IMAGE_NAME)-frontend:latest 263095946180.dkr.ecr.ap-south-1.amazonaws.com/$(IMAGE_NAME)-frontend:latest
		docker tag $(IMAGE_NAME)-backend:latest 263095946180.dkr.ecr.ap-south-1.amazonaws.com/$(IMAGE_NAME)-backend:latest
		docker push 263095946180.dkr.ecr.ap-south-1.amazonaws.com/$(IMAGE_NAME)-frontend:latest
		docker push 263095946180.dkr.ecr.ap-south-1.amazonaws.com/$(IMAGE_NAME)-backend:latest

deploy: login build push

build: build-fe build-be

localrun:
		docker-compose -f bin/localrun.yaml up

login: 
		aws ecr get-login-password --region ap-south-1 | docker login --username AWS --password-stdin 263095946180.dkr.ecr.ap-south-1.amazonaws.com