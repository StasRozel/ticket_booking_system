FROM node:18-alpine

WORKDIR /app

COPY package.json /app

RUN npm install

COPY . .

EXPOSE 3001

CMD ["sh", "-c", "npm run migration && npm run start"]