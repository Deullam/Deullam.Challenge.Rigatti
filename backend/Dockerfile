# Usa um ambiente Node.js LTS leve
FROM node:20-alpine

# Define a pasta de trabalho dentro do contêiner
WORKDIR /app

# Copia os arquivos de configuração de pacotes primeiro (melhora o cache do Docker)
COPY package*.json ./

# Instala as dependências
RUN npm install

# Copia todo o resto do código da sua máquina para o contêiner
COPY . .

# Expõe a porta que o NestJS vai usar
EXPOSE 3001

# Inicia o servidor em modo de desenvolvimento com hot-reload
CMD ["npm", "run", "start:dev"]