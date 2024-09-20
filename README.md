# Portfolio backend

![](https://media.giphy.com/media/l0HlPBrpFSdVq5WPC/giphy.gif?cid=790b76114rtbtkwbijr4wt3fq6l67cgfu72nsz83clyjneje&ep=v1_gifs_search&rid=giphy.gif&ct=g)

backend server for portfolio website

## Quickstart

options on making things ready

- standalone (node.js)

  1. make a `.env` file and fill out the required variables
  1. run build (only if you wish to run the production/ build version)
  1. run start [script](#scripts)

- docker
  1. [fill](./docker-compose.yaml) the environment variables needed
  1. run build [script](#scripts)
  1. run `docker compose up -d`

## Features

- [cache](./src/modules/cache/)
  - endpoints optimized by cache
  - uses redis under the hood
- [auth](./src/modules/auth/)
  - generate api key
    - modular access
  - revoke api key
- [emails](./src/modules/emails/)
  - send email using SMTP
- [files](./src/modules/files/)
  - [factory](./src/modules/files/filesStoreFactory.ts)
    - upload & delete
    - custom files store
  - CRUD operation
- [projects](./src/modules/projects/)
  - CRUD operation
- [testimonials](./src/modules/testimonials/)
  - generate testimonial key
    - strategy to prevent spams
  - CRUD operation

## Scripts

| Script     | Description                                 |
| ---------- | ------------------------------------------- |
| build      | build project                               |
| test       | run test files                              |
| start      | start (must build first)                    |
| start:dev  | start on development mode (nodemon + swc)   |
| start:prod | start on production mode (must build first) |
| format     | format codes (prettier)                     |
| lint       | lint codes (eslint)                         |

## Extras

- [frontend repository](https://github.com/jmrl23/portfolio)

## References

- [fastify-template](https://github.com/jmrl23/fastify-template)
- [cache-manager](https://www.npmjs.com/package/cache-manager)
- [Uniform Resource Identifier](https://en.wikipedia.org/wiki/Uniform_Resource_Identifier)
- [google app passwords](https://myaccount.google.com/apppasswords)
- [prisma](https://www.prisma.io/)
- [swagger](https://swagger.io/)
