FROM node:20-alpine

WORKDIR /app

COPY . .

ENV NODE_ENV=production

RUN chmod +x /app/run
RUN yarn install

ENTRYPOINT [ "/app/run" ]

CMD [ "." ]
