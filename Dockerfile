FROM nginx:alpine

COPY app/index.html /usr/share/nginx/html/index.html
COPY app/css /usr/share/nginx/html/css
COPY app/js /usr/share/nginx/html/js

EXPOSE 80
