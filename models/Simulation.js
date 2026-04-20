import mongoose from 'mongoose';

const simulationSchema = new mongoose.Schema({
  inputVoltage: { type: Number, required: true },
  targetVoltage: { type: Number, required: true },
  finalOutput: { type: Number, required: true },
  steps: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now }
});

export default mongoose.model('Simulation', simulationSchema);

