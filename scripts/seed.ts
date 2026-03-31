import mongoose from 'mongoose';
import dns from 'dns';
import bcrypt from 'bcryptjs';
import { connectDB } from '../shared/config/db.js';

// Override DNS for MongoDB Atlas
dns.setServers(['8.8.8.8', '8.8.4.4']);

// Mock schemas for seeding (in real implementation, import from actual models)
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  role: { type: String, enum: ['admin', 'operator', 'viewer'], required: true },
  createdAt: { type: Date, default: Date.now },
});

const ZoneSchema = new mongoose.Schema({
  zoneId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  cameraId: { type: String, required: true },
  type: { type: String, enum: ['entry', 'restricted', 'monitoring'], required: true },
  coordinates: { type: [[Number]], required: true },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

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

const ConversationSchema = new mongoose.Schema({
  conversationId: { type: String, required: true, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  messages: [{
    role: { type: String, enum: ['user', 'assistant'], required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, required: true },
    meta: {
      eventsAnalyzed: Number,
      timeRange: String,
    },
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const User = mongoose.model('User', UserSchema);
const Zone = mongoose.model('Zone', ZoneSchema);
const Event = mongoose.model('Event', EventSchema);
const Alert = mongoose.model('Alert', AlertSchema);
const Conversation = mongoose.model('Conversation', ConversationSchema);

async function seed() {
  try {
    await connectDB(process.env.MONGODB_URI!);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Event.deleteMany({}),
      Zone.deleteMany({}),
      Alert.deleteMany({}),
      Conversation.deleteMany({}),
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

    // Seed events (50 events over last 24 hours)
    const eventTypes = ['intrusion', 'loitering', 'zone_entry', 'zone_exit'];
    const severities = ['critical', 'high', 'medium', 'low'];
    const cameraIds = ['CAM-01', 'CAM-02', 'CAM-03'];
    const events = [];

    for (let i = 0; i < 50; i++) {
      const startTime = new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000); // Random time in last 24 hours
      const duration = Math.floor(Math.random() * 570) + 30; // 30-600 seconds
      const endTime = new Date(startTime.getTime() + duration * 1000);
      const resolved = startTime < new Date(Date.now() - 2 * 60 * 60 * 1000); // Resolved if older than 2 hours

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

    // Seed alerts (30 alerts, linked to events)
    const alerts = [];
    const highCriticalEvents = createdEvents.filter(e => e.severity === 'critical' || e.severity === 'high');
    
    for (let i = 0; i < Math.min(30, highCriticalEvents.length); i++) {
      const event = highCriticalEvents[i];
      const acknowledged = event.startTime < new Date(Date.now() - 4 * 60 * 60 * 1000); // Acknowledged if older than 4 hours

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

    // Seed conversations (2 conversations for admin user)
    const conversations = [
      {
        conversationId: 'conv-001',
        userId: adminUser!._id,
        messages: [
          {
            role: 'user',
            content: 'Last 30 minutes mein kya hua?',
            timestamp: new Date(Date.now() - 60 * 60 * 1000),
          },
          {
            role: 'assistant',
            content: '3 events detected: 1 intrusion at Server Room, 1 loitering at Main Gate, 1 zone entry at Lobby. 1 critical alert triggered.',
            timestamp: new Date(Date.now() - 60 * 60 * 1000 + 1000),
            meta: { eventsAnalyzed: 3, timeRange: 'Last 30 minutes' },
          },
        ],
      },
      {
        conversationId: 'conv-002',
        userId: adminUser!._id,
        messages: [
          {
            role: 'user',
            content: 'Generate shift report for today',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          },
          {
            role: 'assistant',
            content: '## Shift Report - Today\n\n**Summary:** 12 events detected, 2 critical alerts\n\n**Top Events:**\n- Intrusion at Server Room (Critical)\n- Loitering at Main Gate (High)\n\n**Recommendations:** Increase patrol frequency at Server Room',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000 + 2000),
            meta: { eventsAnalyzed: 12, timeRange: 'Today' },
          },
        ],
      },
    ];

    await Conversation.insertMany(conversations);
    console.log('💬 Conversations seeded:', conversations.length);

    console.log('🌱 Seeding complete!');
    console.log('📊 Summary:');
    console.log(`  Users: ${await User.countDocuments()}`);
    console.log(`  Zones: ${await Zone.countDocuments()}`);
    console.log(`  Events: ${await Event.countDocuments()}`);
    console.log(`  Alerts: ${await Alert.countDocuments()}`);
    console.log(`  Conversations: ${await Conversation.countDocuments()}`);
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

seed().catch(console.error);
