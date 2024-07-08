SHELL:=/bin/bash

COMMIT_HASH?=$(shell git rev-parse --short HEAD)
COMMIT_BRANCH?="$(shell git rev-parse --abbrev-ref HEAD)"
IMAGE_NAME=gold-price-tracker

.PHONY: build-fe build-be push deploy localrun

build-fe: .
		docker pull public.ecr.aws/docker/library/node:16-buster
		docker build -f frontend/Dockerfile -t $(IMAGE_NAME)-fe:$(COMMIT_HASH) -t $(IMAGE_NAME)-fe:latest frontend

build-be: .
		docker build -f backend/gold_price_service/Dockerfile -t $(IMAGE_NAME)-be:$(COMMIT_HASH) -t $(IMAGE_NAME)-be:latest backend/gold_price_service

push: .
		docker tag $(IMAGE_NAME):latest 263095946180.dkr.ecr.ap-south-1.amazonaws.com/gold-price-tracker:latest
		docker push 263095946180.dkr.ecr.ap-south-1.amazonaws.com/gold-price-tracker-fe:latest
		docker push 263095946180.dkr.ecr.ap-south-1.amazonaws.com/gold-price-tracker-be:latest


deploy: login build push

build: build-fe build-be

localrun:
		docker-compose -f bin/localrun.yaml up

login: 
		aws ecr get-login-password --region ap-south-1 | docker login --username AWS --password-stdin 263095946180.dkr.ecr.ap-south-1.amazonaws.com