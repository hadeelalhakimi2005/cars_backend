const http = require('http');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const PORT = 5000;

const server = http.createServer((req, res) => {
  // تفعيل CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (req.url === '/api/cars' && req.method === 'GET') {
    const sqlFile = path.join(__dirname, 'query.sql');
 const sqlContent = `SET PAGESIZE 0 FEEDBACK OFF HEADING OFF ECHO OFF VERIFY OFF TAB OFF
SELECT CAR_ID || '#' || BRAND || '#' || MODEL || '#' || YEAR || '#' || PLATE_NUMBER || '#' || COLOR || '#' || PRICE_PER_DAY || '#' || STATUS || '#' || NVL(IMAGE_URL, 'none') FROM CARS;
EXIT;
`;


    fs.writeFileSync(sqlFile, sqlContent, 'utf8');

    const command = `"D:\\oracle\\product\\10.2.0\\db_1\\bin\\sqlplus.exe" -s system/oracle123 @"${sqlFile}"`;

    exec(command, (error, stdout, stderr) => {
      if (error) {
        res.writeHead(500);
        return res.end(JSON.stringify({ success: false, error: error.message }));
      }

      const lines = stdout.trim().split(/\r?\n/).filter(line => line.includes('#') && !line.trim().startsWith('SELECT'));
      const cars = lines.map(line => {
        const parts = line.split('#');
        return {
          CAR_ID: parts[0] ? parts[0].trim() : '',
          BRAND: parts[1] ? parts[1].trim() : '',
          MODEL: parts[2] ? parts[2].trim() : '',
          YEAR: parts[3] ? parts[3].trim() : '',
          PLATE_NUMBER: parts[4] ? parts[4].trim() : '',
          COLOR: parts[5] ? parts[5].trim() : '',
          PRICE_PER_DAY: parts[6] ? parts[6].trim() : '',
          STATUS: parts[7] ? parts[7].trim() : '',
          IMAGE_URL: parts[8] ? parts[8].trim() : ''
        };
      });

      res.writeHead(200);
      res.end(JSON.stringify({ success: true, count: cars.length, data: cars }));
    });
  } else {
    res.writeHead(200);
    res.end(JSON.stringify({ message: 'Server is running successfully!' }));
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening permanently on http://localhost:${PORT}`);
});

