FROM node:20-alpine AS builder

WORKDIR /app

RUN apk add --no-cache docker-cli

COPY package*.json ./
RUN npm install

COPY . ./
RUN npm run build

FROM node:20-alpine AS runner

WORKDIR /app

RUN apk add --no-cache docker-cli

COPY package*.json ./
RUN npm install --omit=dev

COPY --from=builder /app/build ./build

ENV PORT=3000
EXPOSE 3000

CMD ["node","build/index.js"]