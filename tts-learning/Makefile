.PHONY: help build run stop clean logs shell test

# Colors for output
BLUE := \033[0;34m
GREEN := \033[0;32m
YELLOW := \033[0;33m
NC := \033[0m # No Color

# Paths
DOCKER_SCRIPTS := docs/docker/scripts

help: ## Hiển thị help
	@echo "$(BLUE)TTS Learning - Docker Commands$(NC)"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "$(GREEN)%-15s$(NC) %s\n", $$1, $$2}'

build: ## Build Docker image
	@echo "$(YELLOW)Building Docker image...$(NC)"
	docker build -t tts-learning:latest .

build-no-cache: ## Build Docker image without cache
	@echo "$(YELLOW)Building Docker image (no cache)...$(NC)"
	docker build --no-cache -t tts-learning:latest .

run: ## Chạy container
	@echo "$(YELLOW)Starting containers...$(NC)"
	docker-compose up -d
	@echo "$(GREEN)✓ Application running at http://localhost:3000$(NC)"

run-dev: ## Chạy với JSON server (development)
	@echo "$(YELLOW)Starting containers with JSON server...$(NC)"
	docker-compose --profile dev up -d
	@echo "$(GREEN)✓ Application: http://localhost:3000$(NC)"
	@echo "$(GREEN)✓ JSON Server: http://localhost:3001$(NC)"

stop: ## Dừng containers
	@echo "$(YELLOW)Stopping containers...$(NC)"
	docker-compose down

restart: stop run ## Restart containers

logs: ## Xem logs
	docker-compose logs -f tts-learning-frontend

logs-all: ## Xem tất cả logs
	docker-compose logs -f

shell: ## Vào shell của container
	docker exec -it tts-learning-app sh

clean: ## Xóa containers, images, và volumes
	@echo "$(YELLOW)Cleaning up...$(NC)"
	docker-compose down -v
	docker rmi tts-learning:latest || true
	@echo "$(GREEN)✓ Cleanup complete$(NC)"

prune: ## Xóa tất cả unused Docker resources
	@echo "$(YELLOW)Pruning Docker system...$(NC)"
	docker system prune -af --volumes
	@echo "$(GREEN)✓ Prune complete$(NC)"

health: ## Kiểm tra health của container
	@echo "$(YELLOW)Checking container health...$(NC)"
	@docker inspect --format='{{.State.Health.Status}}' tts-learning-app || echo "Container not running"

ps: ## Hiển thị running containers
	docker-compose ps

stats: ## Hiển thị resource usage
	docker stats tts-learning-app --no-stream

test-build: ## Test build locally
	@echo "$(YELLOW)Testing build...$(NC)"
	yarn build
	@echo "$(GREEN)✓ Build successful$(NC)"
