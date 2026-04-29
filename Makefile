# /**
#  * @author Deullam Justi
#  * @copyright Copyright (c) 2026 Deullam Justi - Todos os direitos reservados.
#  * @description Makefile para automação e inicialização do ecossistema SaaS Multi-tenant.
#  */

# --- Variáveis de Configuração ---
BACKEND_PORT ?= 3001
MONGO_CONTAINER_NAME := deullam_challenge_mongodb
MONGO_IMAGE := mongo:7
MONGO_PORT := 27017
MONGO_DB_NAME := deullam_challenge
BACKEND_ENV := backend/.env

# --- Variáveis de Cores (Estilo CLI) ---
GREEN  := $(shell tput -Txterm setaf 2 2>/dev/null || echo "")
YELLOW := $(shell tput -Txterm setaf 3 2>/dev/null || echo "")
RED    := $(shell tput -Txterm setaf 1 2>/dev/null || echo "")
RESET  := $(shell tput -Txterm sgr0 2>/dev/null || echo "")

# --- Comandos Base ---

define BACKEND_ENV_CONTENT
PORT=$(BACKEND_PORT)
MONGODB_URI=mongodb://root:root@localhost:$(MONGO_PORT)/$(MONGO_DB_NAME)?authSource=admin
JWT_SECRET=changeme-dev-secret
GEMINI_API_KEY=insira_sua_chave_aqui
NODE_ENV=development
endef
export BACKEND_ENV_CONTENT

.PHONY: help
help: ## Mostra este menu de ajuda.
	@echo "$(YELLOW)=== Comandos de Inicialização do Sistema ===$(RESET)"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'NF==2 {printf "$(GREEN)%-20s$(RESET) %s\n", $$1, $$2}' ORS='\n' | sed -e 's/## / /'

.PHONY: init-env
init-env: ## Cria o arquivo .env do backend caso ele não exista.
	@if [ ! -f "$(BACKEND_ENV)" ]; then \
		echo "$$BACKEND_ENV_CONTENT" > "$(BACKEND_ENV)"; \
		echo "$(GREEN)✔ Arquivo $(BACKEND_ENV) gerado com sucesso.$(RESET)"; \
	else \
		echo "$(YELLOW)ℹ O arquivo $(BACKEND_ENV) já existe. Ignorando criação.$(RESET)"; \
	fi

.PHONY: start-mongo
start-mongo: ## Inicia apenas o contêiner do MongoDB usando Volumes Nomeados seguros.
	@echo "$(GREEN)▶ Verificando e iniciando o MongoDB...$(RESET)"
	@if [ -n "$$(docker ps -q -f name=$(MONGO_CONTAINER_NAME))" ]; then \
		echo "$(YELLOW)ℹ Contêiner $(MONGO_CONTAINER_NAME) já está em execução.$(RESET)"; \
	else \
		docker start $(MONGO_CONTAINER_NAME) 2>/dev/null || \
		docker run -d --name $(MONGO_CONTAINER_NAME) -p $(MONGO_PORT):27017 -e MONGO_INITDB_ROOT_USERNAME=root -e MONGO_INITDB_ROOT_PASSWORD=root -v deullam_mongo_data:/data/db $(MONGO_IMAGE); \
		echo "$(GREEN)✔ MongoDB iniciado na porta $(MONGO_PORT).$(RESET)"; \
	fi

.PHONY: stop-mongo
stop-mongo: ## Para o contêiner do MongoDB.
	@echo "$(RED)⏹ Parando o MongoDB...$(RESET)"
	@docker stop $(MONGO_CONTAINER_NAME) > /dev/null 2>&1 || echo "$(YELLOW)ℹ Contêiner não encontrado ou já parado.$(RESET)"

.PHONY: start-backend
start-backend: init-env start-mongo ## Inicia apenas o backend em modo dev.
	@echo "$(GREEN)▶ Iniciando o Backend NestJS...$(RESET)"
	@cd backend && npm install && npm run start:dev

.PHONY: start-frontend
start-frontend: ## Inicia apenas o frontend em modo dev.
	@echo "$(GREEN)▶ Iniciando o Frontend Vite...$(RESET)"
	@cd frontend && npm install && npm run dev

# --- Comandos Docker Compose (A Alternativa Mais Segura para Windows) ---

.PHONY: docker-up
docker-up: init-env ## Sobe toda a infraestrutura (Mongo, API, Front) via Docker Compose.
	@echo "$(GREEN)▶ Subindo containers via Docker Compose...$(RESET)"
	@docker-compose up -d --build

.PHONY: docker-down
docker-down: ## Derruba toda a infraestrutura do Docker Compose.
	@echo "$(RED)⏹ Derrubando containers...$(RESET)"
	@docker-compose down