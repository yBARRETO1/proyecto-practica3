FROM nginx:alpine

COPY dist/frontend-practica3 /usr/share/nginx/html

# Cambiar puerto a 8080
RUN sed -i 's/80/8080/g' /etc/nginx/conf.d/default.conf

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]