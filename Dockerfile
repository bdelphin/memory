FROM php:8.0-apache
WORKDIR /var/www/html
COPY ./src .
RUN mkdir -p db && chown www-data:www-data ./*
EXPOSE 80
