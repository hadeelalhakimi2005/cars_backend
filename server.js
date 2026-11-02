const http = require('http');
const { Pool } = require('pg');

const PORT = process.env.PORT || 5000;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// إنشاء الجدول وإضافة البيانات تلقائياً عند تشغيل السيرفر
async function initializeDatabase() {
  const initQuery = 
    CREATE TABLE IF NOT EXISTS cars (
      car_id SERIAL PRIMARY KEY,
      brand VARCHAR(50),
      model VARCHAR(50),
      year INT,
      plate_number VARCHAR(20),
      color VARCHAR(30),
      price_per_day NUMERIC(10, 2),
      status VARCHAR(20) DEFAULT 'available'
    );

    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM cars) THEN
        INSERT INTO cars (brand, model, year, plate_number, color, price_per_day, status)
        VALUES 
        ('Toyota', 'Camry', 2022, '1234-ABC', 'White', 45.00, 'available'),
        ('Hyundai', 'Elantra', 2021, '5678-XYZ', 'Silver', 35.00, 'available');
      END IF;
    END $$;
  ;

  try {
    await pool.query(initQuery);
    console.log('Database initialized successfully: cars table is ready.');
  } catch (err) {
    console.error('Error initializing database:', err);
  }
}

initializeDatabase();

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

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

  if (req.url === '/' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Cars Backend API is running successfully on Render!');
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Route not found' }));
});

server.listen(PORT, () => {
  console.log('Server running on port ' + PORT);
});
