FROM mhart/alpine-node:latest

MAINTAINER Raven Chen, ravenchen.cn@gmail.com

COPY package.json /app/package.json
RUN cd /app && npm install -g nodemon babel babel-cli bunyan && npm install --production=true
COPY . /app

WORKDIR /app

CMD ["npm", "run", "start"]
