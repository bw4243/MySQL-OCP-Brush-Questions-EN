const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0'; // 明确指定监听所有网络接口
const DATA_DIR = path.join(__dirname, 'userdata');

// 确保数据目录存在
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// 中间件
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

function getFilePath(url) {
  return path.join(DATA_DIR, 'userdata_' + encodeURIComponent(url) + '.json');
}

// 读取数据
app.get('/api/userdata', (req, res) => {
  try {
    const { key, url } = req.query;
    if (!key || !url) {
      return res.status(400).json({ error: 'key and url required' });
    }
    const file = getFilePath(url);
    if (!fs.existsSync(file)) {
      return res.json(null);
    }
    const data = JSON.parse(fs.readFileSync(file, 'utf-8'));
    res.json(data[key] || null);
  } catch (error) {
    console.error('Error reading userdata:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 保存数据
app.post('/api/userdata', (req, res) => {
  try {
    const { key, value, url } = req.body;
    if (!key || typeof value === 'undefined' || !url) {
      return res.status(400).json({ error: 'key, value, url required' });
    }
    const file = getFilePath(url);
    let data = {};
    if (fs.existsSync(file)) {
      data = JSON.parse(fs.readFileSync(file, 'utf-8'));
    }
    data[key] = value;
    fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf-8');
    res.json({ success: true });
  } catch (error) {
    console.error('Error saving userdata:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 清空数据
app.post('/api/userdata/clear', (req, res) => {
  try {
    const { url } = req.query;
    if (!url) {
      return res.status(400).json({ error: 'url required' });
    }
    const file = getFilePath(url);
    if (fs.existsSync(file)) {
      fs.unlinkSync(file);
    }
    res.json({ success: true });
  } catch (error) {
    console.error('Error clearing userdata:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 让根路径自动返回 index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// 错误处理
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// 启动服务器
const server = app.listen(PORT, HOST, () => {
  console.log(`✅ Server running at http://${HOST === '0.0.0.0' ? 'localhost' : HOST}:${PORT}`);
  console.log('📝 Press Ctrl+C to stop the server');
  console.log('🌐 Server is accessible from any IP address');
  if (HOST === '0.0.0.0') {
    console.log('🔗 Local access: http://localhost:' + PORT);
    console.log('🔗 Network access: http://[your-server-ip]:' + PORT);
  }
});

// 处理端口占用错误
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use. Please try a different port.`);
    console.log('💡 You can set a different port using: PORT=8081 node server.js');
  } else if (err.code === 'EACCES') {
    console.error(`❌ Permission denied to bind to port ${PORT}.`);
    console.log('💡 Try using a port number above 1024, like: PORT=8081 node server.js');
  } else {
    console.error('❌ Server error:', err);
  }
  process.exit(1);
});

// 优雅关闭
process.on('SIGINT', () => {
  console.log('\n🛑 Received SIGINT. Graceful shutdown...');
  server.close(() => {
    console.log('✅ Server closed.');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Received SIGTERM. Graceful shutdown...');
  server.close(() => {
    console.log('✅ Server closed.');
    process.exit(0);
  });
});