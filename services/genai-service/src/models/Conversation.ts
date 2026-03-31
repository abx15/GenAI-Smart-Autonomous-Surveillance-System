import mongoose, { Schema } from 'mongoose';

const ConversationSchema = new Schema({
  conversationId: { type: String, default: () => crypto.randomUUID(), unique: true },
  userId: { type: String, required: true },
  messages: [{
    role: { type: String, enum: ['user', 'assistant'], required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
  }],
}, {
  timestamps: true,
});

ConversationSchema.index({ userId: 1 });
ConversationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 604800 }); // 7 days TTL

export const Conversation = mongoose.model('Conversation', ConversationSchema);
