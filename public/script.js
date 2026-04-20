// Power Supply Feedback - Simple Reliable Version (Graph + Needle Working)
const inputSlider = document.getElementById('inputSlider');
const targetSlider = document.getElementById('targetSlider');
const inputVal = document.getElementById('inputVal');
const targetVal = document.getElementById('targetVal');
const startSim = document.getElementById('startSim');
const finalOutput = document.getElementById('finalOutput');
const stepsEl = document.getElementById('steps');
const statusEl = document.getElementById('status');
const resultDetails = document.getElementById('resultDetails');
const historyList = document.getElementById('historyList');
const gaugeCanvas = document.getElementById('voltageGauge');
const gaugeCtx = gaugeCanvas.getContext('2d');
let chart = null;

// Slider sync
inputSlider.oninput = () => inputVal.textContent = inputSlider.value;
targetSlider.oninput = () => targetVal.textContent = targetSlider.value;

// Start button handler
startSim.onclick = async () => {
  startSim.disabled = true;
  startSim.textContent = 'Running...';
  
  const data = {
    inputVoltage: +inputSlider.value,
    targetVoltage: +targetSlider.value
  };
  
  try {
    const res = await fetch('/api/simulate', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(data)
    });
    
    const result = await res.json();
    
    // Update results
    finalOutput.textContent = result.finalOutput.toFixed(1);
    stepsEl.textContent = result.steps;
    statusEl.textContent = result.status;
    
    resultDetails.innerHTML = `
      <strong>${data.inputVoltage}V → ${data.targetVoltage}V</strong><br>
      Final: <strong style="color: #27ae60">${result.finalOutput.toFixed(1)}V</strong>
      (${result.steps} steps)
    `;
    
    // Animate gauge needle
    animateGauge(result.finalOutput, data.targetVoltage);
    
    // Create convergence graph
    createConvergenceGraph(data, result);
    
    loadHistory();
    
  } catch (e) {
    resultDetails.textContent = 'Error - check console';
    console.error(e);
  } finally {
    startSim.disabled = false;
    startSim.textContent = 'Start Simulation';
  }
};

// Simple needle animation
function animateGauge(finalVal, target) {
  let current = 0;
  const duration = 1500;
  const start = Date.now();
  
  function frame() {
    const elapsed = Date.now() - start;
    const progress = Math.min(elapsed / duration, 1);
    current = finalVal * progress * progress; // easeOut quadratic
    
    drawSimpleGauge(current, target);
    
    if (progress < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

// Simple reliable gauge
function drawSimpleGauge(output, target) {
  const w = gaugeCanvas.width, h = gaugeCanvas.height;
  const cx = w/2, cy = h*0.75;
  const r = 110;
  
  gaugeCtx.clearRect(0, 0, w, h);
  
  // Arc background
  gaugeCtx.beginPath();
  gaugeCtx.arc(cx, cy, r, Math.PI*0.7, Math.PI*1.3, false);
  gaugeCtx.lineWidth = 25;
  gaugeCtx.strokeStyle = '#ecf0f1';
  gaugeCtx.shadowColor = '#bdc3c7';
  gaugeCtx.shadowBlur = 15;
  gaugeCtx.stroke();
  
  // Progress arc
  const norm = Math.min(output/300, 1);
  gaugeCtx.beginPath();
  gaugeCtx.arc(cx, cy, r, Math.PI*0.7, Math.PI*0.7 + norm * Math.PI*0.6, false);
  gaugeCtx.lineWidth = 25;
  gaugeCtx.strokeStyle = '#27ae60';
  gaugeCtx.shadowColor = '#27ae60';
  gaugeCtx.shadowBlur = 20;
  gaugeCtx.stroke();
  
  // Target marker
  const targetNorm = Math.min(target/300, 1);
  const tx = cx + Math.cos(Math.PI*0.7 + targetNorm * Math.PI*0.6) * (r + 15);
  const ty = cy + Math.sin(Math.PI*0.7 + targetNorm * Math.PI*0.6) * (r + 15);
  gaugeCtx.beginPath();
  gaugeCtx.arc(tx, ty, 8, 0, Math.PI*2);
  gaugeCtx.fillStyle = '#e74c3c';
  gaugeCtx.shadowColor = '#e74c3c';
  gaugeCtx.shadowBlur = 10;
  gaugeCtx.fill();
  
  // Center text
  gaugeCtx.fillStyle = '#2c3e50';
  gaugeCtx.font = 'bold 48px sans-serif';
  gaugeCtx.textAlign = 'center';
  gaugeCtx.textBaseline = 'middle';
  gaugeCtx.shadowColor = 'rgba(0,0,0,0.3)';
  gaugeCtx.shadowBlur = 8;
  gaugeCtx.fillText(output.toFixed(1), cx, cy - 10);
  
  gaugeCtx.font = 'bold 24px sans-serif';
  gaugeCtx.fillStyle = '#e74c3c';
  gaugeCtx.fillText('Target ' + target.toFixed(0), cx, cy + 40);
}

// Simple reliable graph
function createConvergenceGraph(data, result) {
  const steps = result.steps;
  const path = [];
  let output = 0;
  
  for (let i = 0; i <= steps; i++) {
    path.push(output);
    const error = data.targetVoltage - output;
    output += 0.4 * error;
  }
  
  if (chart) chart.destroy();
  
  chart = new Chart(document.getElementById('simulationChart').getContext('2d'), {
    type: 'line',
    data: {
      labels: Array(steps+1).fill().map((_,i) => i),
      datasets: [{
        label: 'Output Voltage',
        data: path,
        borderColor: '#27ae60',
        backgroundColor: 'rgba(39,174,96,0.2)',
        borderWidth: 3,
        fill: true,
        tension: 0.4
      }, {
        label: 'Target',
        data: Array(steps+1).fill(data.targetVoltage),
        borderColor: '#e74c3c',
        borderDash: [10,5],
        borderWidth: 2,
        fill: false
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: true, position: 'top' }
      },
      scales: {
        y: { beginAtZero: true, title: { display: true, text: 'Voltage (V)' } }
      },
      animation: { duration: 1200 }
    }
  });
}

// Simple history
async function loadHistory() {
  try {
    const res = await fetch('/api/history');
    const data = await res.json();
    historyList.innerHTML = data.slice(0,8).map(d => 
      `<li>${new Date(d.timestamp).toLocaleTimeString()}: ${d.inputVoltage.toFixed(0)}V→${d.targetVoltage.toFixed(0)}V=${d.finalOutput.toFixed(1)}V (${d.steps}s)</li>`
    ).join('') || '<li>No data yet</li>';
  } catch(e) {
    historyList.innerHTML = '<li>Loading...</li>';
  }
}

// Init
loadHistory();
drawSimpleGauge(0, 220);

