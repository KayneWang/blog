# 持续集成方案

持续集成（CI）现在是开发过程中提高效率必不可少的，我们以前端的角度出发，配置一套通用的持续集成方案。经过本文你可以学习到：

- drone 的基础用法
- 前端静态资源 Dockerfile 优化
- caddy 简单使用

该文章只介绍了 drone 的简单使用，更多的配置还请大家参考官方文档，感兴趣的也可以一起沟通交流。

## Drone

Drone 是一个部署简单，功能强大并且上手简单的持续集成工具，使用 Drone 需要部署两部分：server 和 runner，我们下面以 docker 部署方式详细介绍如何使用 drone，当然 Drone 还提供很多其他的部署方式，可以参考[官方文档](https://docs.drone.io/)

### Server

这里我们的代码托管仓库使用的是 gogs，其他平台都差不太多，主要配置都是相同的。值得注意的是，我们需要代码仓库<b>开启 webhook</b> 功能。

准备一台虚拟机，并且保证拥有 docker 环境，执行：

```shell
$ docker pull drone/drone:1
```

新建 run_drone_server.sh 并运行

> 注意：我们的 server 部署通过宿主机 7099 端口访问，所以 DRONE_SERVER_HOST 为 7099 后缀

```shell
#/bin/sh

docker run \
  --volume=/var/lib/drone:/data \
  --env=DRONE_AGENTS_ENABLED=true \
  --env=DRONE_GOGS_SERVER={{http://gogs地址}} \
  --env=DRONE_RPC_SECRET={{rpc 通信密钥，后续 runner 注册需要与该密钥保持一致，例如：super-duper-secret}} \
  --env=DRONE_SERVER_HOST={{该 server 部署地址，例如：x.x.x.x:7099}} \
  --env=DRONE_SERVER_PROTO=http \
  --publish=7099:80 \
  --publish=443:443 \
  --restart=always \
  --detach=true \
  --name=drone \
  drone/drone:1
```

### Runner

准备一台虚拟机，并且保证有 docker 环境，执行：

```shell
$ docker pull drone/drone-runner-docker:1
```

新建 run_drone_runner.sh，并执行

```shell
#/bin/sh

docker run -d \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -e DRONE_RPC_PROTO=http \
  -e DRONE_RPC_HOST={{server 地址，例如：x.x.x.x:7099}} \
  -e DRONE_RPC_SECRET=super-duper-secret \
  -e DRONE_RUNNER_CAPACITY=2 \
  -e DRONE_RUNNER_NAME=${HOSTNAME} \
  -p 7100:3000 \
  --restart always \
  --name runner \
  drone/drone-runner-docker:1
```

### .drone.yml

在项目根目录新建 .drone.yml 文件：

> 注意：该配置通过打 tag 的方式进行构建，构建过程中可以通过 server 部署的地址去查看状态，例如：x.x.x.x:7099

```
kind: pipeline
type: docker
name: default

clone:
  depth: 1

steps:
- name: publish
  image: plugins/docker
  pull: if-not-exists
  settings:
    username: xxxxxx
    password: xxxxxx
    repo: xxxxxx/test.ci
    tags: ${DRONE_TAG}
    prune: true

trigger:
  ref:
  - refs/tags/*
```

### 代码推送

```shell
$ git tag 0.0.1
$ git push origin 0.0.1
```

顺利的话，我们就可以通过访问 x.x.x.x:7099 查看当前构建状态了。

## Dockerfile 优化

往期 blog([前端静态资源容器部署](https://github.com/KayneWang/blog/blob/master/article/deploy.md)) 有使用 ngnix 打包镜像的文章，感兴趣的可以去了解一下，当然也可以直接通过本文使用优化后的打包方案。

使用该博客提供的 [caddy_linux]() 程序或者下载 [caddy](https://github.com/caddyserver/caddy/releases)，在根目录新建 Caddyfile：

> 注意：该配置前端打包后资源在 build 文件夹下面

```
:80 {
    log stdout

    header / {
        -Server
    }

    rewrite {
        to /
    }

    root ./build
}

:80/hs {
    status 200 /

    header / {
        -Server
    }
}

:80/static/ {
    root ./build/static

    gzip
    header / {
        Cache-Control "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0"
        -Server
    }
}
```

修改根目录 Dockerfile：

> 注意：scratch 镜像是提供 linux 基础功能的最小镜像，能够显著减少打包后的镜像体积

```
FROM node:alpine3.10 as builder
WORKDIR /app
COPY . /app
RUN yarn install
RUN yarn build

FROM scratch as production

COPY --from=builder /app/build/ /data/build/
COPY --from=builder /app/Caddyfile /data
COPY --from=builder /app/caddy_linux /data

WORKDIR /data

EXPOSE 80
ENTRYPOINT [ "/data/caddy_linux" ]
```