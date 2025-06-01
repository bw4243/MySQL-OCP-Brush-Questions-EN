const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;
const DATA_DIR = path.join(__dirname, 'userdata');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR);
}

app.use(bodyParser.json());
app.use(express.static(__dirname));

function getFilePath(url) {
  return path.join(DATA_DIR, 'userdata_' + encodeURIComponent(url) + '.json');
}

// 读取数据
app.get('/api/userdata', (req, res) => {
  const { key, url } = req.query;
  if (!key || !url) return res.status(400).json({ error: 'key and url required' });
  const file = getFilePath(url);
  if (!fs.existsSync(file)) return res.json(null);
  const data = JSON.parse(fs.readFileSync(file, 'utf-8'));
  res.json(data[key] || null);
});

// 保存数据
app.post('/api/userdata', (req, res) => {
  const { key, value, url } = req.body;
  if (!key || typeof value === 'undefined' || !url) return res.status(400).json({ error: 'key, value, url required' });
  const file = getFilePath(url);
  let data = {};
  if (fs.existsSync(file)) {
    data = JSON.parse(fs.readFileSync(file, 'utf-8'));
  }
  data[key] = value;
  fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf-8');
  res.json({ success: true });
});

// 清空数据
app.post('/api/userdata/clear', (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'url required' });
  const file = getFilePath(url);
  if (fs.existsSync(file)) fs.unlinkSync(file);
  res.json({ success: true });
});

// 让根路径自动返回 index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
}); 