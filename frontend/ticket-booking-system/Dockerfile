# Frontend Dockerfile
FROM node:18-alpine

# Создаем рабочую директорию
WORKDIR /app

# Копируем package.json и package-lock.json (если есть)
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем исходный код frontend
COPY . .

# Открываем порт
EXPOSE 3000

# Команда запуска по умолчанию
CMD ["npm", "start"]