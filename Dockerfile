FROM mattstyles/iojs:2.4.0

ENV CONNECT_PORT 5000
ENV CONNECT_PATH /root/.db

RUN /usr/bin/npm install -g level-connect

EXPOSE $CONNECT_PORT

CMD ["/usr/bin/connect"]
