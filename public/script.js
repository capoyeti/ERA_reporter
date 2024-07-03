console.log('Updated script.js loaded now');

document.getElementById('data-form').addEventListener('submit', async function (e) {
  e.preventDefault();

  const formData = new FormData(this);

  try {
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    });

    const result = await response.json();

    if (response.ok) {
      console.log('Form submission successful:', result);
      displayData(result);
      document.querySelector('.form-container').style.display = 'none';
      document.querySelector('.gauge-title').style.display = 'block';
      document.getElementById('charts-container').style.display = 'flex';
      document.querySelector('.report-section').style.display = 'flex';
    } else {
      console.error('Form submission error:', result);
    }
  } catch (error) {
    console.error('Error fetching data:', error);
  }
});

function getColor(value) {
  if (value <= 25) return '#FF4136'; // Red
  if (value <= 50) return '#FF851B'; // Orange
  if (value <= 75) return '#FFDC00'; // Yellow
  return '#2ECC40'; // Green
}

function getLabel(value) {
  if (value <= 25) return 'Very Low';
  if (value <= 50) return 'Low';
  if (value <= 75) return 'Good';
  return 'Very Good';
}

function calculateOverallAverage(data) {
  const categories = ['Vulnerability', 'Opportunity', 'Learning', 'Communication', 'Enablement', 'Reflection'];
  const unit = Object.keys(data)[0];
  const values = categories.map(category => data[unit][category] || 0);
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function createGaugeChart(canvas, value, label, size = 'small') {
  const fontSize = size === 'large' ? 28 : 22; // Increased font size
  const chartSize = size === 'large' ? 300 : 200;

  console.log(`Creating chart - Label: ${label}, Value: ${value}, Size: ${size}`);

  canvas.width = chartSize;
  canvas.height = chartSize;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    console.error('Failed to get canvas context for:', canvas);
    return;
  }

  // Convert value to percentage
  const percentValue = (value / 3) * 100;

  new Chart(ctx, {
    type: 'doughnut',
    data: {
      datasets: [{
        data: [percentValue, 100 - percentValue],
        backgroundColor: [getColor(percentValue), '#E0E0E0'],
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      circumference: 180,
      rotation: -90,
      cutout: '75%',
      plugins: {
        legend: { display: false },
        tooltip: { enabled: false },
        title: {
          display: true,
          text: getLabel(percentValue),
          position: 'bottom',
          font: {
            size: fontSize * 0.8, // Slightly smaller font for the label
            weight: 'bold'
          },
          padding: {
            top: 10 // Reduced padding above the label
          }
        }
      },
      layout: {
        padding: {
          bottom: 20 // Reduced padding at the bottom
        }
      }
    },
    plugins: [{
      id: 'centerText',
      afterDraw: (chart) => {
        const ctx = chart.ctx;
        const centerX = (chart.chartArea.left + chart.chartArea.right) / 2;
        const bottomY = chart.chartArea.bottom - chart.chartArea.height * 0.2; // Moved up by 20% of chart height
        
        ctx.save();
        ctx.font = `bold ${fontSize}px Arial`;
        ctx.fillStyle = '#000';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText(`${percentValue.toFixed(0)}%`, centerX, bottomY);
        ctx.restore();
      }
    }]
  });

  console.log(`Chart created for ${label} with value ${percentValue.toFixed(0)}%`);
}

function displayData(result) {
  const { data, textLeft, textRight } = result;
  const container = document.getElementById('charts-container');
  const summaryGauge = document.getElementById('summary-gauge');

  container.innerHTML = '';
  summaryGauge.innerHTML = '';

  if (Object.keys(data).length === 0) {
    console.log('No data received. Displaying error message.');
    container.innerHTML = '<p>No data available. Please check the server logs.</p>';
    return;
  }

  const unit = Object.keys(data)[0];
  console.log('Unit:', unit);

  console.log('Creating overall average gauge chart...');
  const overallAverage = calculateOverallAverage(data);
  console.log('Overall average:', overallAverage);
  const overallGaugeWrapper = document.createElement('div');
  overallGaugeWrapper.style.width = '400px';
  overallGaugeWrapper.style.height = '400px';
  const overallGaugeCanvas = document.createElement('canvas');
  overallGaugeWrapper.appendChild(overallGaugeCanvas);
  summaryGauge.appendChild(overallGaugeWrapper);
  createGaugeChart(overallGaugeCanvas, overallAverage, 'Average Sentiment Score', 'large');

  console.log('Creating individual gauge charts...');
  const elements = ['Communication', 'Learning', 'Opportunity', 'Vulnerability', 'Enablement', 'Reflection'];
  elements.forEach(element => {
    console.log(`Creating gauge for ${element}`);
    const gaugeContainer = document.createElement('div');
    gaugeContainer.className = 'gauge-container';

    const gaugeTitle = document.createElement('h3');
    gaugeTitle.className = 'gauge-title';
    gaugeTitle.textContent = element;

    const gaugeWrapper = document.createElement('div');
    gaugeWrapper.className = 'gauge';
    gaugeWrapper.style.width = '200px';
    gaugeWrapper.style.height = '200px';

    const gaugeCanvas = document.createElement('canvas');
    
    gaugeWrapper.appendChild(gaugeCanvas);
    gaugeContainer.appendChild(gaugeTitle);
    gaugeContainer.appendChild(gaugeWrapper);
    container.appendChild(gaugeContainer);

    const value = data[unit][element] || 0;
    console.log(`Value for ${element}:`, value);
    createGaugeChart(gaugeCanvas, value, element);
  });

  console.log('All charts created successfully.');

  console.log('Setting text fields...');
  document.getElementById('report-left').querySelector('p').textContent = textLeft;
  document.getElementById('report-right').querySelector('p').textContent = textRight;
}

console.log('Script loaded. Waiting for form submission...');