FROM mhart/alpine-node:6.9.1

WORKDIR /src
ADD . .

RUN apk add --no-cache make gcc g++ python git bash
RUN sudo -E apt-add-repository -y "ppa:ubuntu-toolchain-r/test"
RUN sudo -E apt-get -yq update &>> ~/apt-get-update.log
RUN sudo -E apt-get -yq --no-install-suggests --no-install-recommends --force-yes install g++-4.8
RUN export CXX=g++-4.8
RUN npm install
RUN npm install -g truffle
RUN npm install -g ethereumjs-testrpc
