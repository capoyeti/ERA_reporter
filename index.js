const express = require('express');
const app = express();

function generateRandomData() {
  const randomScore = (min, max) => +(Math.random() * (max - min) + min).toFixed(1);
  
  return {
    engagementScore: randomScore(1, 5),
    communication: randomScore(1, 5),
    learning: randomScore(1, 5),
    opportunity: randomScore(1, 5),
    vulnerability: randomScore(1, 5),
    enablement: randomScore(1, 5),
    reflection: randomScore(1, 5),
    topThemes: [
      { name: 'Improve Communication', value: Math.floor(Math.random() * 20) + 1 },
      { name: 'Grow learnership opps', value: Math.floor(Math.random() * 20) + 1 },
      { name: 'Time for Reflection', value: Math.floor(Math.random() * 20) + 1 },
      { name: 'Lack of Enablement', value: Math.floor(Math.random() * 20) + 1 },
      { name: 'Team Collaboration', value: Math.floor(Math.random() * 20) + 1 }
    ]
  };
}

app.get('/api/data', (req, res) => {
  res.json(generateRandomData());
});

app.use(express.static('public'));

app.listen(3000, () => console.log('Server running on port 3000'));