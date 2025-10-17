FROM node:18

# Cài LibreOffice
RUN apt-get update && apt-get install -y libreoffice && apt-get clean

WORKDIR /app
COPY package.json .
RUN npm install

COPY . .

EXPOSE 3000
CMD ["node", "index.js"]
