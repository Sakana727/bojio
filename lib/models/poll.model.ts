import mongoose, { Document } from 'mongoose';

export interface PollDocument extends Document {
    question: string;
    options: { optionText: string; votes: number }[];
    voters: mongoose.Types.ObjectId[];
    eventId: mongoose.Types.ObjectId;
    createdAt: Date;
}

const optionSchema = new mongoose.Schema({
    optionText: {
        type: String,
        required: true,
    },
    votes: {
        type: Number,
        default: 0,
    },
});

const pollSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true,
    },
    options: [optionSchema],
    voters: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
    eventId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Poll = mongoose.models.Poll || mongoose.model<PollDocument>('Poll', pollSchema);

export default Poll;
