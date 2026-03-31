import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface IConversation extends Document {
  conversationId: string;
  userId: string;
  messages: IMessage[];
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>({
  role: { type: String, enum: ['system', 'user', 'assistant'], required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
}, { _id: false });

const ConversationSchema = new Schema<IConversation>({
  conversationId: { type: String, required: true, unique: true },
  userId: { type: String, required: true, index: true },
  messages: { type: [MessageSchema], default: [] }
}, {
  timestamps: true
});

// TTL 7 days (7 * 24 * 60 * 60 = 604800 seconds)
ConversationSchema.index({ updatedAt: 1 }, { expireAfterSeconds: 604800 });

export const Conversation = mongoose.model<IConversation>('Conversation', ConversationSchema);
