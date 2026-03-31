const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// DNS override for MongoDB Atlas
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

// User Schema
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  role: { type: String, enum: ['admin', 'operator', 'viewer'], required: true },
  createdAt: { type: Date, default: Date.now },
});

// Event Schema
const EventSchema = new mongoose.Schema({
  eventId: { type: String, required: true, unique: true },
  type: { type: String, enum: ['intrusion', 'loitering', 'zone_entry', 'zone_exit'], required: true },
  severity: { type: String, enum: ['critical', 'high', 'medium', 'low'], required: true },
  cameraId: { type: String, required: true },
  zoneId: { type: String, required: true },
  trackId: { type: Number, required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date },
  duration: { type: Number },
  resolved: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

// Zone Schema
const ZoneSchema = new mongoose.Schema({
  zoneId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  cameraId: { type: String, required: true },
  type: { type: String, enum: ['entry', 'restricted', 'monitoring'], required: true },
  coordinates: { type: [[Number]], required: true },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

// Alert Schema
const AlertSchema = new mongoose.Schema({
  alertId: { type: String, required: true, unique: true },
  eventId: { type: String, required: true },
  message: { type: String, required: true },
  severity: { type: String, enum: ['critical', 'high', 'medium', 'low'], required: true },
  type: { type: String, required: true },
  cameraId: { type: String, required: true },
  timestamp: { type: Date, required: true },
  trackId: { type: Number, required: true },
  acknowledged: { type: Boolean, default: false },
  acknowledgedBy: { type: String },
  acknowledgedAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model('User', UserSchema);
const Event = mongoose.model('Event', EventSchema);
const Zone = mongoose.model('Zone', ZoneSchema);
const Alert = mongoose.model('Alert', AlertSchema);

async function connectDB(uri) {
  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      family: 4,
      maxPoolSize: 10,
      minPoolSize: 2,
      retryWrites: true,
    });
    console.log('✅ MongoDB connected successfully');
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err);
    process.exit(1);
  }
}

async function seed() {
  try {
    await connectDB(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Event.deleteMany({}),
      Zone.deleteMany({}),
      Alert.deleteMany({}),
    ]);
    console.log('🗑️ Cleared existing data');

    // Seed users
    const users = [
      { email: 'admin@sass.local', password: 'Admin@123', role: 'admin', firstName: 'Arjun', lastName: 'Sharma' },
      { email: 'operator1@sass.local', password: 'Operator@123', role: 'operator', firstName: 'Priya', lastName: 'Verma' },
      { email: 'operator2@sass.local', password: 'Operator@123', role: 'operator', firstName: 'Ravi', lastName: 'Kumar' },
      { email: 'viewer1@sass.local', password: 'Viewer@123', role: 'viewer', firstName: 'Sneha', lastName: 'Patel' },
      { email: 'viewer2@sass.local', password: 'Viewer@123', role: 'viewer', firstName: 'Amit', lastName: 'Singh' },
    ];

    const hashedUsers = await Promise.all(
      users.map(async (user) => ({
        ...user,
        password: await bcrypt.hash(user.password, 12),
      }))
    );

    const createdUsers = await User.insertMany(hashedUsers);
    const adminUser = createdUsers.find(u => u.email === 'admin@sass.local');
    console.log('👥 Users seeded:', createdUsers.length);

    // Seed zones
    const zones = [
      { zoneId: 'zone-001', name: 'Main Gate', cameraId: 'CAM-01', type: 'entry', coordinates: [[0,0],[640,0],[640,480],[0,480]], active: true },
      { zoneId: 'zone-002', name: 'Server Room', cameraId: 'CAM-02', type: 'restricted', coordinates: [[100,100],[400,100],[400,300],[100,300]], active: true },
      { zoneId: 'zone-003', name: 'Parking Lot', cameraId: 'CAM-03', type: 'monitoring', coordinates: [[0,200],[800,200],[800,600],[0,600]], active: true },
      { zoneId: 'zone-004', name: 'Lobby', cameraId: 'CAM-01', type: 'monitoring', coordinates: [[200,0],[800,0],[800,400],[200,400]], active: true },
    ];

    const createdZones = await Zone.insertMany(zones);
    console.log('📍 Zones seeded:', createdZones.length);

    // Seed events (20 events over last 24 hours)
    const eventTypes = ['intrusion', 'loitering', 'zone_entry', 'zone_exit'];
    const severities = ['critical', 'high', 'medium', 'low'];
    const cameraIds = ['CAM-01', 'CAM-02', 'CAM-03'];
    const events = [];

    for (let i = 0; i < 20; i++) {
      const startTime = new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000);
      const duration = Math.floor(Math.random() * 570) + 30;
      const endTime = new Date(startTime.getTime() + duration * 1000);
      const resolved = startTime < new Date(Date.now() - 2 * 60 * 60 * 1000);

      events.push({
        eventId: `event-${String(i + 1).padStart(3, '0')}`,
        type: eventTypes[Math.floor(Math.random() * eventTypes.length)],
        severity: severities[Math.floor(Math.random() * severities.length)],
        cameraId: cameraIds[Math.floor(Math.random() * cameraIds.length)],
        zoneId: createdZones[Math.floor(Math.random() * createdZones.length)].zoneId,
        trackId: Math.floor(Math.random() * 50) + 1,
        startTime,
        endTime,
        duration,
        resolved,
      });
    }

    const createdEvents = await Event.insertMany(events);
    console.log('📊 Events seeded:', createdEvents.length);

    // Seed alerts (15 alerts, linked to events)
    const alerts = [];
    const highCriticalEvents = createdEvents.filter(e => e.severity === 'critical' || e.severity === 'high');
    
    for (let i = 0; i < Math.min(15, highCriticalEvents.length); i++) {
      const event = highCriticalEvents[i];
      const acknowledged = event.startTime < new Date(Date.now() - 4 * 60 * 60 * 1000);

      alerts.push({
        alertId: `alert-${String(i + 1).padStart(3, '0')}`,
        eventId: event.eventId,
        message: `${event.type.toUpperCase()} detected in ${event.zoneId} - ${event.severity} priority`,
        severity: event.severity,
        type: event.type,
        cameraId: event.cameraId,
        timestamp: event.startTime,
        trackId: event.trackId,
        acknowledged,
        acknowledgedBy: acknowledged ? 'admin@sass.local' : undefined,
        acknowledgedAt: acknowledged ? new Date(event.startTime.getTime() + 30 * 60 * 1000) : undefined,
      });
    }

    const createdAlerts = await Alert.insertMany(alerts);
    console.log('🚨 Alerts seeded:', createdAlerts.length);

    console.log('🌱 Seeding complete!');
    console.log('📊 Summary:');
    console.log(`  Users: ${await User.countDocuments()}`);
    console.log(`  Zones: ${await Zone.countDocuments()}`);
    console.log(`  Events: ${await Event.countDocuments()}`);
    console.log(`  Alerts: ${await Alert.countDocuments()}`);
    
    console.log('\n🔑 LOGIN DETAILS:');
    console.log('==================');
    console.log('Email: admin@sass.local');
    console.log('Password: Admin@123');
    console.log('==================');
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

seed().catch(console.error);
