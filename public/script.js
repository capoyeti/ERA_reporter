async function fetchData() {
  const response = await fetch('/api/data');
  return await response.json();
}

function createGaugeChart(ctx, value, max, label) {
  return new Chart(ctx, {
    type: 'doughnut',
    data: {
      datasets: [{
        data: [value, max - value],
        backgroundColor: [getColor(value), '#E0E0E0']
      }]
    },
    options: {
      circumference: 180,
      rotation: -90,
      cutout: '80%',
      plugins: {
        legend: { display: false },
        tooltip: { enabled: false }
      },
      title: {
        display: true,
        text: `${label}: ${value}`
      }
    }
  });
}

function getColor(value) {
  if (value <= 1) return '#FF4136';
  if (value <= 2) return '#FF851B';
  if (value <= 3) return '#FFDC00';
  if (value <= 4) return '#2ECC40';
  return '#0074D9';
}

function getRating(value) {
  if (value <= 1) return 'Very Low';
  if (value <= 2) return 'Low';
  if (value <= 3) return 'Good';
  if (value <= 4) return 'Very Good';
  return 'Excellent';
}

function createBarChart(ctx, data) {
  return new Chart(ctx, {
    type: 'bar',
    data: {
      labels: data.map(item => item.name),
      datasets: [{
        data: data.map(item => item.value),
        backgroundColor: '#36A2EB'
      }]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true
        }
      },
      plugins: {
        legend: { display: false }
      }
    }
  });
}

async function initCharts() {
  const data = await fetchData();
  
  createGaugeChart(
    document.getElementById('engagementScore').getContext('2d'),
    data.engagementScore,
    5,
    'Engagement Score'
  );

  const metrics = ['communication', 'learning', 'opportunity', 'vulnerability', 'enablement', 'reflection'];
  metrics.forEach(metric => {
    createGaugeChart(
      document.getElementById(`${metric}Chart`).getContext('2d'),
      data[metric],
      5,
      `${metric.charAt(0).toUpperCase() + metric.slice(1)} (${getRating(data[metric])})`
    );
  });

  createBarChart(
    document.getElementById('topThemes').getContext('2d'),
    data.topThemes
  );
}

initCharts();