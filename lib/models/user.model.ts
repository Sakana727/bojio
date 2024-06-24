import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    id: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    image: String,
    bio: String,
    posts: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Post'
        }
    ],
    onboarded: {
        type: 'boolean', default: false
    },
    communities: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Community'
    }],
    events: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event'
    }]
})

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;