# Introduction
This is a music API created for learning purposes using primarily Node.js and Hapi framework. Libraries and/or modules used are described below.

 - [@hapi/hapi](https://www.npmjs.com/package/@hapi/hapi): the framework used for the HTTP server
 - [joi](https://www.npmjs.com/package/joi): data validation library used to validate request payload
 - [PostgreSQL](https://www.postgresql.org/): the relational database system used for persistence
 - [@hapi/jwt](https://www.npmjs.com/package/@hapi/jwt): JWT module that is part of hapi's ecosystem used for authentication and authorization
 - [amqplib](https://www.npmjs.com/package/amqplib): library used to create the clients for RabbitMQ
 - [redis](https://www.npmjs.com/package/redis): Redis client for Node.js to cache frequently fetched data

# Setup Instructions
To run the API locally, these services must be running in the local machine.

 - RabbitMQ
 - Redis
 - PostgreSQL

Afterwards, create an `.env` file with the following configurations.
```
# server config
HOST=localhost
PORT=5000

#db config
PGUSER={YOUR_PGUSER}
PGHOST=localhost
PGPASSWORD={YOUR_PASSWORD}
PGDATABASE=musicapi
PGPORT=5432

#token config
ACCESS_TOKEN_KEY={YOUR_ACCESS_TOKEN_KEY}
REFRESH_TOKEN_KEY={YOUR_REFRESH_TOKEN_KEY}
ACCESS_TOKEN_AGE=1800

#rabbitmq config
RABBITMQ_SERVER=amqp://localhost

#redis config
REDIS_SERVER=localhost
```

`YOUR_PGUSER` and `YOUR_PASSWORD` can be configured freely, but be sure to create the `musicapi` database in your PostgreSQL service and creating a user with all the required privileges in the `musicapi` database.

`YOUR_ACCESS_TOKEN_KEY` and `YOUR_REFRESH_TOKEN_KEY` should be generated using some tool, then pasted to the `.env` file.

Then, run the following.
```
npm install
npm run migrate
npm run start-dev
```

Your server should be running and you should be able to hit the endpoints locally.

 # API Documentation and Testing
The API documentation for this API can be seen [here](https://documenter.getpostman.com/view/12531688/2s8Z6zzCCL), while the test collection that the documentation is based from can be seen [here](https://www.postman.com/richard-here/workspace/music-api/collection/12531688-eea5294c-096d-4fc6-be32-2f58fe45d4fa?action=share&creator=12531688).
