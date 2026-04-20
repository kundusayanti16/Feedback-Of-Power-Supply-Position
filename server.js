import express from 'express';
import { createServer } from 'http';
import mongoose from 'mongoose';
import Simulation from '../models/Simulation.js';

const app = express();
const server = createServer(app);

app.use(express.static('public'));
app.use(express.json());

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/powerfeedback')
  .then(() => console.log('✅ MongoDB connected to powerfeedback DB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// API: Discrete simulation endpoint (main feature)
app.post('/api/simulate', async (req, res) => {
  try {
    const { inputVoltage, targetVoltage } = req.body;
    console.log(`Simulation started: ${inputVoltage}V → ${targetVoltage}V`);
    
    // Discrete feedback simulation per specs
    let output = 0; // initial output
    let steps = 0;
    const gain = 0.4;
    const tolerance = 0.1;
    const maxSteps = 1000;
    
    while (Math.abs(targetVoltage - output) > tolerance && steps < maxSteps) {
      await new Promise(resolve => setTimeout(resolve, 500)); // 500ms intervals
      const error = targetVoltage - output;
      const correction = gain * error;
      output += correction;
      steps++;
    }
    
    const finalError = Math.abs(targetVoltage - output);
    const status = finalError < tolerance ? 'Stable' : `Adjusting (error: ${finalError.toFixed(2)}V)`;
    
    // Save to MongoDB
    const simulation = new Simulation({
      inputVoltage,
      targetVoltage,
      finalOutput: output,
      steps
    });
    await simulation.save();
    
    console.log(`Simulation complete: ${output.toFixed(2)}V in ${steps} steps`);
    res.json({ 
      finalOutput: output, 
      steps, 
      status,
      inputVoltage,
      targetVoltage 
    });
  } catch (error) {
    console.error('Simulation error:', error);
    res.status(500).json({ error: 'Simulation failed' });
  }
});

// API: History endpoint
app.get('/api/history', async (req, res) => {
  try {
    const simulations = await Simulation.find()
      .sort({ timestamp: -1 })
      .limit(50)
      .lean();
    res.json(simulations);
  } catch (error) {
    console.error('History error:', error);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 APIs: POST /api/simulate, GET /api/history`);
  console.log(`📁 Static files: http://localhost:${PORT}`);
});

