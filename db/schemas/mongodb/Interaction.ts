import { Schema, model, Document } from 'mongoose';

export interface IInteraction extends Document {
  type: 'poll' | 'quiz';
  question: string;
  options: { text: string; votes: number }[];
  correctOption?: number; // for quiz
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  status: 'active' | 'closed';
}

const InteractionSchema = new Schema<IInteraction>(
  {
    type: { type: String, enum: ['poll', 'quiz'], required: true },
    question: { type: String, required: true },
    options: [
      {
        text: { type: String, required: true },
        votes: { type: Number, default: 0 }
      }
    ],
    correctOption: { type: Number },
    createdBy: { type: String, required: true },
    status: { type: String, enum: ['active', 'closed'], default: 'active' }
  },
  { timestamps: true }
);

InteractionSchema.index({ type: 1, status: 1 });

export const Interaction = model<IInteraction>('Interaction', InteractionSchema); 