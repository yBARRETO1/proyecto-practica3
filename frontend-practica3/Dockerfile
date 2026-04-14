# Etapa 1: build Angular
FROM node:20 AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

# 🔥 instalar angular cli
RUN npm install -g @angular/cli

COPY . .

# 🔥 build correcto
RUN ng build --configuration production

# Etapa 2: nginx
FROM nginx:alpine

COPY --from=build /app/dist/frontend-practica3 /usr/share/nginx/html

RUN sed -i 's/80/8080/g' /etc/nginx/conf.d/default.conf

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]