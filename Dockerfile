FROM node:14
RUN apt-get update && apt-get install -y gettext-base
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
RUN git clone https://github.com/vishnubob/wait-for-it.git
# Substitute all environment placeholder values in *.sql files in initdb.d folder with environment values loaded
# RUN envsubst < ./initdb.d/001_create_database.sql
# RUN envsubst < ./initdb.d/002_create_user.sql
EXPOSE 5000
CMD [ "npm", "run", "start-dev" ]