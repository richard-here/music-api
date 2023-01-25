
# Introduction

This is a dockerized music API created using primarily Node.js and Hapi framework. Libraries and/or modules used are described below.

  

- [@hapi/hapi](https://www.npmjs.com/package/@hapi/hapi): the framework used for the HTTP server

- [joi](https://www.npmjs.com/package/joi): data validation library used to validate request payload

- [PostgreSQL](https://www.postgresql.org/): the relational database system used for persistence

- [@hapi/jwt](https://www.npmjs.com/package/@hapi/jwt): JWT module that is part of hapi's ecosystem used for authentication and authorization

- [amqplib](https://www.npmjs.com/package/amqplib): library used to create the clients for RabbitMQ

- [redis](https://www.npmjs.com/package/redis): Redis client for Node.js to cache frequently fetched data

  

# Setup Instructions

To run the API locally, you must have Docker Engine running in your local machine and create an `.env` file with desired values. You can see the key-value pairs in the .env.example file. Then, from the terminal, simply run the following.
```
docker-compose up --build -d
```

Your server should be running and you should be able to hit the endpoints locally. You can use the endpoint test suites already created in the Postman collection described in the [API Documentation and Testing](#postman) section.

# <a name="postman"></a>API Documentation and Testing

The API documentation for this API can be seen [here](https://documenter.getpostman.com/view/12531688/2s8Z6zzCCL), while the test collection that the documentation is based from can be seen [here](https://www.postman.com/richard-here/workspace/music-api/collection/12531688-eea5294c-096d-4fc6-be32-2f58fe45d4fa?action=share&creator=12531688).