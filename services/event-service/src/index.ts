import express from 'express';
import mongoose from 'mongoose';
import dns from 'dns';

// DNS override for MongoDB Atlas
dns.setServers(['8.8.8.8', '8.8.4.4']);

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(express.json());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'event-service', timestamp: new Date().toISOString() });
});

// Event routes
app.get('/api/events', async (req, res) => {
  try {
    // Mock data for now
    const events = [
      {
        eventId: 'event-001',
        type: 'intrusion',
        severity: 'critical',
        cameraId: 'CAM-01',
        zoneId: 'zone-001',
        trackId: 1,
        startTime: new Date(),
        resolved: false
      }
    ];
    res.json({ success: true, data: events });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/events/stats', async (req, res) => {
  try {
    // Mock stats
    const stats = {
      total: 20,
      critical: 3,
      cameras: 3,
      tracked: 12
    };
    res.json({ success: true, data: stats });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// MongoDB connection
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI!, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      family: 4,
    });
    console.log('✅ Event Service - MongoDB connected');
  } catch (error) {
    console.error('❌ Event Service - MongoDB connection failed:', error);
  }
}

// Start server
async function startServer() {
  await connectDB();
  
  app.listen(PORT, () => {
    console.log(`🚀 Event Service running on port ${PORT}`);
  });
}

startServer().catch(console.error);
