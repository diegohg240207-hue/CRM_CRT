FROM node:20-alpine
WORKDIR /app
RUN apk add --no-cache openssl
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build
RUN ls dist/main.js && echo "dist/main.js OK"
COPY start.sh ./start.sh
RUN chmod +x start.sh
EXPOSE 3000
CMD ["./start.sh"]
