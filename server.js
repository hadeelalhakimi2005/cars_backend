const http = require('http');
const { Pool } = require('pg');

const PORT = process.env.PORT || 5000;

// الاتصال بقاعدة بيانات PostgreSQL السحابية
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

const server = http.createServer(async (req, res) => {
  // تفعيل CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // مسار جلب السيارات
  if (req.url === '/api/cars' && req.method === 'GET') {
    try {
      const result = await pool.query('SELECT * FROM cars');
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify(result.rows));
    } catch (err) {
      console.error('Database query error:', err);
      res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ error: 'Failed to fetch cars', details: err.message }));
    }
    return;
  }

  // الصفحة الرئيسية للتأكد من عمل السيرفر
  if (req.url === '/' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Cars Backend API is running successfully on Render!');
    return;
  }

  // أي مسار غير معرف
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Route not found' }));
});

server.listen(PORT, () => {
  console.log('Server running on port ' + PORT);
});
