# Docker 使用自定义 DNS 解析

内网环境中，存在通过配置 hosts 来访问域名的情况，而 docker 内部是通过 <b>复制宿主机 /etc/resolv.conf</b> 文件，并且会自动过滤掉 127 开头的 IP 来进行 DNS 解析，所以配置宿主机的 /etc/hosts 并没有作用。

* 环境：CentOS 7
* 解析工具：[CoreDNS](https://coredns.io/)

## CoreDNS

### 安装

```shell
$ wget https://github.com/coredns/coredns/releases/download/v1.7.0/coredns_1.7.0_linux_amd64.tgz
$ tar czvf coredns_1.7.0_linux_amd64.tgz
$ mv ./coredns /usr/bin/coredns
```

### 配置

新建 /etc/coredns/Corefile:

```
.:53 {
  # 绑定 interface ip 如果为 127 开头则无法对外提供服务
  bind 0.0.0.0
  # 先走本机的hosts
  # https://coredns.io/plugins/hosts/
  hosts {
    # 自定义sms.service search.service 的解析
    # 因为解析的域名少我们这里直接用hosts插件即可完成需求
    # 如果有大量自定义域名解析那么建议用file插件使用 符合RFC 1035规范的DNS解析配置文件
    10.6.6.2 sms.service
    10.6.6.3 search.service
    # ttl
    ttl 60
    # 重载hosts配置
    reload 1m
    # 继续执行
    fallthrough
  }
  # file enables serving zone data from an RFC 1035-style master file.
  # https://coredns.io/plugins/file/
  # file service.signed service
  # 最后所有的都转发到系统配置的上游dns服务器去解析
  forward . /etc/resolv.conf
  # 缓存时间ttl
  cache 120
  # 自动加载配置文件的间隔时间
  reload 6s
  # 输出日志
  log
  # 输出错误
  errors
}
```

### 测试

```shell
$ coredns -conf /etc/coredns/Corefile
```

通过另外一个窗口执行：

```shell
$ dig @localhost sms.service
```

如果查看到反馈信息证明解析成功。

### 部署

增加运行账户

```shell
$ useradd coredns -s /sbin/nologin
```

新建 /usr/lib/systemd/system/coredns.service

```
[Unit]
Description=CoreDNS DNS server
Documentation=https://coredns.io
After=network.target

[Service]
PermissionsStartOnly=true
LimitNOFILE=1048576
LimitNPROC=512
CapabilityBoundingSet=CAP_NET_BIND_SERVICE
AmbientCapabilities=CAP_NET_BIND_SERVICE
NoNewPrivileges=true
User=coredns
WorkingDirectory=~
ExecStart=/usr/bin/coredns -conf=/etc/coredns/Corefile
ExecReload=/bin/kill -SIGUSR1 $MAINPID
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

启动

```shell
$ systemctl enable coredns
$ systemctl start coredns
$ systemctl status coredns
```

### 宿主机

修改 /etc/resolv.conf 将 CoreDNS 部署的地址写入 nameserver

### 总结

如果上述操作没有问题，新启动容器的就可以支持自定义的 DNS 解析了
