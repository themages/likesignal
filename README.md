# likesignal

技术栈：JavaScript + Redis + NodeJS + PM2 + Socket.IO + CentOS7

### 一、下载安装依赖

npm install

### 二、本地启用

node index.js

### 三、线上启用

pm2 start server.json --max-memory-restart 400MB

### 四、阿里云启动 Redis
redis-server /etc/redis.conf
