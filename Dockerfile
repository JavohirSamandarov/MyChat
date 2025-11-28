# Stage 1 — Build React app
FROM node:20-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# Stage 2 — Export build artifacts
FROM alpine:latest

WORKDIR /app

COPY --from=build /app/dist ./dist

CMD ["sh", "-c", "echo 'React build complete. Copy /app/dist to your Nginx root.' && tail -f /dev/null"]
