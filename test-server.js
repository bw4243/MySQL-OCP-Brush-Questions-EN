// 简单的测试服务器
console.log('🚀 Starting test server...');

try {
  const express = require('express');
  console.log('✅ Express loaded successfully');
  
  const app = express();
  console.log('✅ Express app created');
  
  const PORT = 3000;
  
  app.get('/', (req, res) => {
    res.send('<h1>Test Server is Running!</h1><p>If you see this, the server is working correctly.</p>');
  });
  
  console.log('✅ Route defined');
  
  const server = app.listen(PORT, () => {
    console.log('✅ Server started successfully!');
    console.log(`🌐 Server running at http://localhost:${PORT}`);
    console.log('📝 Press Ctrl+C to stop');
  });
  
  server.on('error', (err) => {
    console.error('❌ Server error:', err);
  });
  
  process.on('uncaughtException', (err) => {
    console.error('❌ Uncaught Exception:', err);
    process.exit(1);
  });
  
  process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection:', reason);
    process.exit(1);
  });
  
} catch (error) {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
}
