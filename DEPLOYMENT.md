# 部署指南

## 服务器部署说明

### 1. 网络访问配置

当前服务器配置为监听所有网络接口（`0.0.0.0`），这意味着：
- ✅ 可以从任意 IP 地址访问
- ✅ 支持局域网和公网访问
- ✅ 适合服务器部署

### 2. 部署步骤

#### 2.1 上传文件到服务器
```bash
# 将项目文件上传到服务器
scp -r ./* user@your-server-ip:/path/to/your/app/
```

#### 2.2 安装依赖
```bash
cd /path/to/your/app/
npm install
```

#### 2.3 配置防火墙
```bash
# Ubuntu/Debian
sudo ufw allow 3000

# CentOS/RHEL
sudo firewall-cmd --permanent --add-port=3000/tcp
sudo firewall-cmd --reload
```

#### 2.4 启动服务
```bash
# 开发环境
node server.js

# 生产环境（推荐使用 PM2）
npm install -g pm2
pm2 start server.js --name "mysql-ocp"
pm2 startup
pm2 save
```

### 3. 环境变量配置

可以通过环境变量自定义配置：

```bash
# 自定义端口
PORT=8080 node server.js

# 自定义监听地址（如果只想本机访问）
HOST=127.0.0.1 PORT=3000 node server.js

# 生产环境配置
NODE_ENV=production PORT=80 node server.js
```

### 4. 云服务器配置

#### 4.1 阿里云/腾讯云
1. 登录控制台
2. 找到安全组设置
3. 添加入站规则：
   - 协议：TCP
   - 端口：3000（或您设置的端口）
   - 源地址：0.0.0.0/0（允许所有IP）

#### 4.2 AWS EC2
1. 进入 EC2 控制台
2. 选择安全组
3. 编辑入站规则
4. 添加自定义 TCP 规则，端口 3000

### 5. 反向代理配置（可选）

#### 5.1 使用 Nginx
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

#### 5.2 使用 Apache
```apache
<VirtualHost *:80>
    ServerName your-domain.com
    ProxyPreserveHost On
    ProxyPass / http://localhost:3000/
    ProxyPassReverse / http://localhost:3000/
</VirtualHost>
```

### 6. HTTPS 配置（推荐）

使用 Let's Encrypt 免费证书：
```bash
# 安装 certbot
sudo apt install certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d your-domain.com
```

### 7. 访问测试

部署完成后，可以通过以下方式访问：
- 本地访问：`http://localhost:3000`
- 局域网访问：`http://[服务器内网IP]:3000`
- 公网访问：`http://[服务器公网IP]:3000`
- 域名访问：`http://your-domain.com`（如果配置了域名）

### 8. 常见问题

#### 8.1 无法访问
- 检查防火墙设置
- 检查云服务器安全组
- 确认服务是否正常运行：`ps aux | grep node`

#### 8.2 端口被占用
```bash
# 查看端口占用
netstat -tulpn | grep :3000

# 或使用其他端口
PORT=8080 node server.js
```

#### 8.3 权限问题
```bash
# 如果使用 80 端口需要 root 权限
sudo PORT=80 node server.js

# 或者使用非特权端口 + 反向代理
```

### 9. 监控和日志

#### 9.1 使用 PM2 监控
```bash
pm2 status
pm2 logs mysql-ocp
pm2 monit
```

#### 9.2 日志文件
应用日志会输出到控制台，建议使用 PM2 或重定向到文件：
```bash
node server.js > app.log 2>&1 &
```

### 10. 安全建议

1. **使用 HTTPS**：保护数据传输
2. **定期更新**：保持依赖包最新
3. **访问控制**：如果不需要公网访问，限制 IP 范围
4. **备份数据**：定期备份 `userdata` 目录
5. **监控日志**：关注异常访问和错误日志
