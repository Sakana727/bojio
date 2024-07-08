import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    date: {
        type: Date,
    },
    location: {
        type: String,
    },
    image: {
        type: String,
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    community: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Community",
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    parentId: {
        type: String,
    },
    children: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Event",
        },
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Poll'
        },
    ],
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
});

const Event = mongoose.models.Event || mongoose.model("Event", eventSchema);

export default Event;
