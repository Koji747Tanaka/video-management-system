# FROM --platform=linux/amd64 node:18
FROM  node:18
RUN mkdir -p /app

WORKDIR /app

COPY ./express-entrypoint.sh /scripts/express-entrypoint.sh
COPY . /app

RUN chmod +x /scripts/express-entrypoint.sh

ENTRYPOINT ["/scripts/express-entrypoint.sh"]