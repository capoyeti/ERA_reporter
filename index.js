const express = require('express');
const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');
const multer = require('multer');
const bodyParser = require('body-parser');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Add Content Security Policy
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-eval' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline'"
  );
  next();
});

function processCSVData(filePath) {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => {
        const unitScores = {};

        results.forEach(row => {
          if (row['UNIT NAME'] && row['Clover Element'] && row.Score) {
            const unitName = row['UNIT NAME'];
            const element = row['Clover Element'];
            const score = parseFloat(row.Score);

            if (!unitScores[unitName]) {
              unitScores[unitName] = {};
            }
            if (!unitScores[unitName][element]) {
              unitScores[unitName][element] = [];
            }
            unitScores[unitName][element].push(score);
          }
        });

        const averageScores = {};
        for (const unit in unitScores) {
          averageScores[unit] = {};
          for (const element in unitScores[unit]) {
            const scores = unitScores[unit][element];
            const average = scores.reduce((a, b) => a + b, 0) / scores.length;
            averageScores[unit][element] = parseFloat(average.toFixed(2));
          }
        }

        resolve(averageScores);
      })
      .on('error', reject);
  });
}

app.post('/api/upload', upload.single('csv-file'), (req, res) => {
  const csvFile = req.file;
  const textLeft = req.body['text-left'];
  const textRight = req.body['text-right'];

  if (!csvFile) {
    return res.status(400).json({ error: 'CSV file is required.' });
  }

  const filePath = path.join(__dirname, csvFile.path);

  processCSVData(filePath)
    .then(data => {
      res.json({ data, textLeft, textRight });
    })
    .catch(error => {
      console.error('Error processing CSV:', error);
      res.status(500).json({ error: 'Error processing data' });
    });
});

app.use(express.static('public'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
