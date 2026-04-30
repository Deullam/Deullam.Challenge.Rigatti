# Makefile Limpo para o Ambiente de Desenvolvimento Local

# Variável para apontar o arquivo correto
COMPOSE_FILE := docker-compose.yml

.PHONY: start
start: ## Inicia todo o sistema (Banco, Backend e Frontend) em background
	@echo "Subindo os contêineres e construindo as imagens..."
	docker-compose -f $(COMPOSE_FILE) up -d --build
	@echo "Sistema rodando! Acesse o frontend em http://localhost:3000"

.PHONY: stop
stop: ## Para todos os serviços sem apagar nada
	@echo "Parando os serviços..."
	docker-compose -f $(COMPOSE_FILE) stop

.PHONY: down
down: ## Remove os contêineres e redes (mantém o banco de dados salvo)
	@echo "Removendo a infraestrutura do Docker..."
	docker-compose -f $(COMPOSE_FILE) down

.PHONY: logs
logs: ## Mostra os logs do sistema em tempo real (Pressione Ctrl+C para sair)
	docker-compose -f $(COMPOSE_FILE) logs -f

.PHONY: clean
clean: ## PERIGO: Remove os contêineres e APAGA os dados do banco de dados MongoDB
	@echo "Limpando tudo do sistema..."
	docker-compose -f $(COMPOSE_FILE) down -v

.PHONY: help
help: ## Mostra este menu de ajuda
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'NF==2 {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

.PHONY: start-mongo
start-mongo: ## Inicia apenas o banco de dados MongoDB em background
	@echo "Subindo apenas o contêiner do MongoDB..."
	docker-compose -f $(COMPOSE_FILE) up -d mongodb
	@echo "MongoDB está rodando na porta 27017!"

.PHONY: stop-mongo
stop-mongo: ## Para apenas o contêiner do MongoDB
	@echo "Parando o MongoDB..."
	docker-compose -f $(COMPOSE_FILE) stop mongodb

.PHONY: logs-mongo
logs-mongo: ## Mostra os logs apenas do MongoDB em tempo real
	docker-compose -f $(COMPOSE_FILE) logs -f mongodb

	# Documentação: Comando para rodar o script de população (seed) do banco de dados
.PHONY: seed
seed: ## Roda o script de seed para criar o usuário admin e dados iniciais
	@echo "Iniciando a semeadura (seed) do banco de dados..."
	# Documentação: O comando 'docker exec' entra no contêiner 'deullam_challenge_backend'
	# e usa o 'npx ts-node' para rodar o seu arquivo TypeScript diretamente.
	docker exec -it deullam_challenge_backend npx ts-node src/scripts/seed.ts
	@echo "Seed finalizado com sucesso! Verifique o MongoDB Compass."


	# Documentação: Comando para forçar a recriação das imagens Docker
# Ideal para quando o código não atualiza ou quando instalamos novos pacotes (npm install)
.PHONY: rebuild
rebuild: ## Para os contêineres, limpa o cache e constrói tudo novamente
	@echo "Desligando os contêineres atuais..."
	docker-compose down
	@echo "Reconstruindo as imagens com o código mais recente..."
	docker-compose up -d --build
	@echo "Pronto! Contêineres reiniciados e atualizados com sucesso."