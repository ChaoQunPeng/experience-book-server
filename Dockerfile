# Start your image with a node base image
FROM node:18-alpine

COPY / /app

EXPOSE 3000

# COPY nginx/default.conf /etc/nginx/nginx.conf