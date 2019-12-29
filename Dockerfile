FROM node:12.14.0-alpine3.11

WORKDIR /srv
COPY modbus-stack modbus-stack

WORKDIR /srv/modbus-stack
RUN npm install --only=prod

WORKDIR /srv
COPY package*.json ./
RUN npm install --only=prod
COPY *.js ./
COPY public_html public_html

EXPOSE 8888
CMD ["node", "app.js"]
