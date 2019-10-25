# 前端静态资源容器部署

容器在中后台项目的部署中非常流行，前端打包后的静态资源能不能也部署到容器里面呢？答案当然是可以，可以根据以下步骤完成一个基础镜像配置。

项目名称：react-app
打包后文件夹名称：build

## Docker 安装

参考 [Docker Hub](https://docs.docker.com/) 的相关教程。

## 编辑 Dockerfile 文件

首先在根目录创建 Dockerfile 文件。

打包好的静态资源我们选择 nginx 进行代理，所以我们需要依赖于 nginx 的基础镜像进行配置：

```js
FROM nginx:latest
```

接下来，我们将静态资源放到根目录的 data 下面：

```js
RUN mkdir /data
ADD ./build/ /data/
```

下面，在根目录创建 nginx 配置文件 nginx.conf：

```js
user  nginx;
worker_processes  1;

error_log  /var/log/nginx/error.log warn;
pid        /var/run/nginx.pid;


events {
    worker_connections  1024;
}


http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    log_format  main  '$remote_addr - $remote_user [$time_local] "$request" '
                      '$status $body_bytes_sent "$http_referer" '
                      '"$http_user_agent" "$http_x_forwarded_for"';

    access_log  /var/log/nginx/access.log  main;

    sendfile        on;
    #tcp_nopush     on;

    keepalive_timeout  65;

    #gzip  on;

    include /etc/nginx/conf.d/*.conf;

    server {
        listen 80 default_server;
        server_name _;

        location  / {
          root /data/;
          index index.html;
          try_files /index.html $uri;
        }

        # location  ~ /api/  {
        #   proxy_connect_timeout 2s;
        #   proxy_read_timeout 600s;
        #   proxy_send_timeout 600s;
        #   proxy_pass http://gateway:8080;
        #   proxy_set_header        Host    $host:80;
        #   proxy_set_header        X-Real-IP       $remote_addr;
        #   proxy_set_header        X-Forwarded-For $proxy_add_x_forwarded_for;
        #   client_max_body_size    1000m;
        # }
    }
}
```

将 nginx 配置添加到容器里，需要增加：

```js
ADD nginx.conf /etc/nginx/
```

这样就完成了需要发布的基础镜像，完整的 Dockerfile 配置如下：

```js
FROM nginx:latest
RUN mkdir /data
ADD ./build/ /data/
ADD nginx.conf /etc/nginx/
EXPOSE 80
```

EXPOSE 80 是将镜像的 80 端口暴露出来，这样我们可以通过访问镜像的 80 端口来测试打包后的静态资源。

## 镜像打包

在项目根目录执行：

```shell
$ docker build --rm -t react-app:0.0.1 .
```

这时候我们可以通过执行 docker images 看到打包之后的 react-app 0.0.1 镜像。

如果没什么问题，接下来执行：

```shell
$ docker run --name="react-app" -d -p 8080:80 react-app:0.0.1
```

启动成功之后，可以通过 docker ps 查看当前运行的容器状态列表。

通过 -p 命令进行了端口转发，所以，最后直接访问 [localhost:8080](http://localhost:8080) 就可以了。

## Docker 命令参考来源

[菜鸟教程 Docker 命令大全](https://www.runoob.com/docker/docker-command-manual.html)
