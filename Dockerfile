FROM mhart/alpine-node:6.9.1

WORKDIR /src
ADD . .

RUN apk add --no-cache make gcc g++ python git bash
RUN npm install
RUN npm install -g truffle
RUN npm install -g ethereumjs-testrpc
