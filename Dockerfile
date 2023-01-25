FROM node:14
RUN apt-get update && apt-get install -y gettext-base
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5000
CMD [ "npm", "run", "start-dev" ]