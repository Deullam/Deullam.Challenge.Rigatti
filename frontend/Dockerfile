# Usa um ambiente Node.js LTS leve
FROM node:20-alpine

# Define a pasta de trabalho
WORKDIR /app

# Copia o gerenciador de pacotes
COPY package*.json ./

# Instala as dependências
RUN npm install

# Copia o restante do código
COPY . .

# Expõe a porta 3000
EXPOSE 3000

# Inicia o Vite. O parâmetro --host garante que o Vite aceite acessos de fora do contêiner
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "3000"]