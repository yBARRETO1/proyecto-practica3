# Etapa 1: build Angular
FROM node:18 AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build --configuration production

# Etapa 2: servir con nginx
FROM nginx:alpine

COPY --from=build /app/dist/frontend-practica3 /usr/share/nginx/html

RUN sed -i 's/80/8080/g' /etc/nginx/conf.d/default.conf

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]