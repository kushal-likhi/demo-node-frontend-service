FROM ubuntu:14.04.3

MAINTAINER Kushal Likhi "kushal@innox.io"

RUN locale-gen en_US.UTF-8

ENV DEBIAN_FRONTEND noninteractive
ENV LANG en_US.UTF-8
ENV LANGUAGE en_US:en
ENV LC_ALL en_US.UTF-8
ENV HOME /root

RUN apt-get update \
    && apt-get install -y \
      apt-transport-https \
      wget \
      curl \
      unzip \
      vim


ENV DOCKER_APP_VERSION            1.9.0-0~trusty
ENV CONSUL_APP_VERSION            0.5.2
ENV CONSUL_TEMPLATE_APP_VERSION   0.10.0

# CONSUL
#
RUN mkdir /opt/consul && mkdir /etc/consul.d/
ENV PATH $PATH:/opt/consul
WORKDIR /opt/consul

RUN wget https://dl.bintray.com/mitchellh/consul/${CONSUL_APP_VERSION}_linux_amd64.zip \
    && wget https://dl.bintray.com/mitchellh/consul/${CONSUL_APP_VERSION}_web_ui.zip \
    && wget https://github.com/hashicorp/envconsul/releases/download/v${ENVCONSUL_APP_VERSION}/envconsul_${ENVCONSUL_APP_VERSION}_linux_amd64.tar.gz \
    && unzip ${CONSUL_APP_VERSION}_linux_amd64.zip \
    && unzip ${CONSUL_APP_VERSION}_web_ui.zip \
    && tar zxf envconsul_${ENVCONSUL_APP_VERSION}_linux_amd64.tar.gz \
    && ln -s envconsul_${ENVCONSUL_APP_VERSION}_linux_amd64/envconsul .

# NODE
#
WORKDIR /opt
RUN wget https://nodejs.org/dist/v4.2.2/node-v4.2.2-linux-x64.tar.gz \
    && tar -xf node-v4.2.2-linux-x64.tar.gz \
    && ln -s node-v4.2.2-linux-x64 node

ENV PATH $PATH:/opt/node/bin

# Add project
#
WORKDIR /opt
ADD ./app ./app

EXPOSE 8080

WORKDIR /opt/app
CMD node app.js
