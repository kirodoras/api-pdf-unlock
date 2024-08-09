# Usar a imagem base do Ubuntu
FROM ubuntu:20.04

# Instalar qpdf e curl
RUN apt-get update && \
    apt-get install -y qpdf curl

# Adicionar o repositório Node.js e instalar Node.js
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs

# Definir o diretório de trabalho
WORKDIR /app

# Copiar o package.json e package-lock.json (se existir) para o diretório de trabalho
COPY package*.json ./

# Instalar as dependências do Node.js
RUN npm install

# Copiar o restante do código da aplicação
COPY . .

# Expor a porta que o aplicativo usa
EXPOSE 3000

# Comando para iniciar a aplicação
CMD ["npm", "start"]
