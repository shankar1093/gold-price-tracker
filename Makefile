dev-up: ## Start all development services with hot reloading
	docker-compose -f docker-compose.dev.yaml --env-file .env.development up -d

dev-build: ## Build all development services
	docker-compose -f docker-compose.dev.yaml --env-file .env.development build

dev-down: ## Stop all development services
	docker-compose -f docker-compose.dev.yaml down

dev-restart: ## Restart all development services
	docker-compose -f docker-compose.dev.yaml --env-file .env.development restart

dev-logs: ## Show logs for all development services
	docker-compose -f docker-compose.dev.yaml logs -f

dev-logs-python: ## Show logs for Python backend
	docker-compose -f docker-compose.dev.yaml logs -f python-backend

dev-logs-rust: ## Show logs for Rust backend
	docker-compose -f docker-compose.dev.yaml logs -f rust_backend

dev-logs-frontend: ## Show logs for frontend
	docker-compose -f docker-compose.dev.yaml logs -f frontend

dev-shell-python: ## Open shell in Python backend container
	docker-compose -f docker-compose.dev.yaml exec python-backend bash

dev-shell-rust: ## Open shell in Rust backend container
	docker-compose -f docker-compose.dev.yaml exec rust_backend bash

dev-shell-db: ## Open PostgreSQL shell
	docker-compose -f docker-compose.dev.yaml exec db psql -U rate_service -d mjw

dev-db-reset: ## Reset the development database
	docker-compose -f docker-compose.dev.yaml down db
	docker volume rm $(docker volume ls -q | grep postgres_data_dev) || true
	docker-compose -f docker-compose.dev.yaml up -d db

dev-migrate: ## Run Django migrations in development
	docker-compose -f docker-compose.dev.yaml exec python-backend python manage.py migrate

dev-makemigrations: ## Create Django migrations in development
	docker-compose -f docker-compose.dev.yaml exec python-backend python manage.py makemigrations

dev-createsuperuser: ## Create Django superuser in development
	docker-compose -f docker-compose.dev.yaml exec python-backend python manage.py createsuperuser

dev-test-python: ## Run Python tests in development
	docker-compose -f docker-compose.dev.yaml exec python-backend python manage.py test

dev-test-rust: ## Run Rust tests in development
	docker-compose -f docker-compose.dev.yaml exec rust_backend cargo test

dev-install-python: ## Install Python dependencies in development
	docker-compose -f docker-compose.dev.yaml exec python-backend pip install -r requirements.txt

dev-install-frontend: ## Install frontend dependencies in development
	docker-compose -f docker-compose.dev.yaml exec frontend npm install

dev-clean: ## Clean up development environment completely
	docker-compose -f docker-compose.dev.yaml down -v
	docker system prune -fSHELL:=/bin/bash

COMMIT_HASH?=$(shell git rev-parse --short HEAD)
COMMIT_BRANCH?=$(shell git rev-parse --abbrev-ref HEAD)
IMAGE_NAME=gold-price-tracker
AWS_REGION=ap-south-1
AWS_ACCOUNT_ID=263095946180

.PHONY: help build-fe build-rust-be build-python-be build-postgres push deploy localrun update-ecs login build
.PHONY: dev-up dev-down dev-build dev-logs dev-shell-python dev-shell-rust dev-db-reset dev-migrate

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Production Targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-20s %s\n", $1, $2}' $(MAKEFILE_LIST) | grep -E "(build|deploy|push|login|update)"
	@echo ''
	@echo 'Development Targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-20s %s\n", $1, $2}' $(MAKEFILE_LIST) | grep "dev-"
	@echo ''
	@echo 'Other Targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-20s %s\n", $1, $2}' $(MAKEFILE_LIST) | grep -v -E "(build|deploy|push|login|update|dev-)"

# ==================== PRODUCTION TARGETS ====================


build-fe: ## Build and push frontend image to ECR
	docker pull public.ecr.aws/docker/library/node:16-buster
	docker buildx build --no-cache --platform linux/amd64 -f frontend/Dockerfile -t $(AWS_ACCOUNT_ID).dkr.ecr.$(AWS_REGION).amazonaws.com/$(IMAGE_NAME)-frontend:$(COMMIT_HASH) -t $(AWS_ACCOUNT_ID).dkr.ecr.$(AWS_REGION).amazonaws.com/$(IMAGE_NAME)-frontend:latest --push frontend

build-rust-be: ## Build and push Rust backend image to ECR
	docker buildx build --platform linux/amd64 -f backend/gold_price_service/Dockerfile -t $(AWS_ACCOUNT_ID).dkr.ecr.$(AWS_REGION).amazonaws.com/$(IMAGE_NAME)-rust-backend:$(COMMIT_HASH) -t $(AWS_ACCOUNT_ID).dkr.ecr.$(AWS_REGION).amazonaws.com/$(IMAGE_NAME)-rust-backend:latest --push backend/gold_price_service

build-python-be: ## Build and push Python backend image to ECR
	docker buildx build --platform linux/amd64 -f backend/mjw_services/Dockerfile -t $(AWS_ACCOUNT_ID).dkr.ecr.$(AWS_REGION).amazonaws.com/$(IMAGE_NAME)-python-backend:$(COMMIT_HASH) -t $(AWS_ACCOUNT_ID).dkr.ecr.$(AWS_REGION).amazonaws.com/$(IMAGE_NAME)-python-backend:latest --push backend/mjw_services

build-postgres: ## Build and push PostgreSQL image to ECR
	docker buildx build --platform linux/amd64 -f db/Dockerfile -t $(AWS_ACCOUNT_ID).dkr.ecr.$(AWS_REGION).amazonaws.com/$(IMAGE_NAME)-postgres:$(COMMIT_HASH) -t $(AWS_ACCOUNT_ID).dkr.ecr.$(AWS_REGION).amazonaws.com/$(IMAGE_NAME)-postgres:latest --push db

build: build-fe build-rust-be build-python-be ## Build all services

push: login ## Push images to ECR (already done in build step)
	# Images are already pushed in the build step with the correct tags
	echo "Images have already been pushed in the build step."

deploy: login build update-ecs ## Full deployment: login, build, and update ECS

update-ecs: ## Update ECS service with new deployment
	aws ecs update-service --cluster mjw-prod --service mjw-retail-apps-ec2 --force-new-deployment

login: ## Login to AWS ECR
	aws ecr get-login-password --region $(AWS_REGION) | docker login --username AWS --password-stdin $(AWS_ACCOUNT_ID).dkr.ecr.$(AWS_REGION).amazonaws.com

localrun: ## Run the existing localrun setup
	docker-compose -f bin/localrun.yaml up

# ==================== DEVELOPMENT TARGETS ====================