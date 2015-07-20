FROM mattstyles/iojs:2.4.0
MAINTAINER Matt Styles <matt@veryfizzyjelly.com>

ENV CONNECT_PORT 5000
ENV CONNECT_PATH /root/.db

RUN /usr/bin/npm install level-connect

WORKDIR /node_modules/level-connect/bin

EXPOSE $CONNECT_PORT

CMD ["node","connect"]
