FROM node:20-alpine
WORKDIR /app
RUN apk add --no-cache openssl
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build
RUN ls dist/main.js && echo "dist/main.js OK"
EXPOSE 3000
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]
