// actions/poll.actions.ts
"use server";

import { revalidatePath } from 'next/cache';
import Poll from '../models/poll.model';
import { connectToDatabase } from '../mongoose';
import mongoose from 'mongoose'; // Import Schema and Types

import Event from '../models/event.model';
import User from '../models/user.model';
import { redirect } from 'next/navigation';

interface CreatePollParams {
    question: string;
    options: string[];
    eventId: string;
    path: string;
}

interface VoteOnPollParams {
    pollId: string;
    optionText: string;
    userId: string;
    path: string;
}

interface Option {
    optionText: string;
    votes: number;
    voters: string[];
}

export async function createPoll({ question, options, eventId, path }: CreatePollParams) {
    try {
        await connectToDatabase(); // Ensure proper MongoDB connection

        // Check if the event with eventId exists
        const event = await Event.findById(eventId);
        if (!event) {
            throw new Error('Event not found');
        }

        // Create poll options array
        const pollOptions = options.map(option => ({ optionText: option }));

        // Create the poll tied to the event
        const createdPoll = await Poll.create({
            question,
            options: pollOptions,
            eventId: event._id,
        });

        // Update event's children array to include the created poll
        await Event.findByIdAndUpdate(event._id, {
            $push: { children: createdPoll._id }, // Assuming 'polls' is the array field for storing poll IDs in Event model
        });

        revalidatePath(path);



    } catch (error: any) {
        throw new Error(`Error creating poll: ${error.message}`);
    }

}

export async function voteOnPoll({ pollId, optionText, userId, path }: VoteOnPollParams) {
    await connectToDatabase();

    try {
        const originalPoll = await Poll.findById(pollId);
        if (!originalPoll) {
            throw new Error("Poll not found");
        }

        const originalUser = await User.findById(userId);
        if (!originalUser) {
            throw new Error("User not found");
        }

        if (originalPoll.voters.includes(userId)) {
            throw new Error("User has already voted on this poll");
        }

        const option = originalPoll.options.find((opt: any) => opt.optionText === optionText);
        if (!option) {
            throw new Error("Option not found in poll");
        }

        option.votes += 1;

        originalPoll.voters.push(userId);

        await originalPoll.save();

        revalidatePath(path);

    } catch (error: any) {
        throw new Error(`Error voting on poll: ${error.message}`);
    }
}

export async function fetchPollById(pollId: string) {
    if (!pollId) {
        throw new Error('Poll ID is undefined');
    }

    try {
        await connectToDatabase();

        const poll = await Poll.findById(pollId).lean();
        if (!poll) {
            throw new Error('Poll not found');
        }

        return JSON.parse(JSON.stringify(poll));
    } catch (error: any) {
        console.error(`Error fetching poll details for ID ${pollId}: ${error.message}`);
        throw new Error('Failed to fetch poll details');
    }
}

export async function fetchEventPoll(eventId: string, pollId: string) {
    await connectToDatabase();

    try {
        // Find the event by ID and populate its children (polls)
        const event = await Event.findById(eventId).populate({
            path: 'children',
            match: { _id: pollId },
        }).exec();

        if (!event) {
            throw new Error('Event not found');
        }

        // Extract the poll from the event's children
        const poll = event.children.find((child: any) => child._id.toString() === pollId);
        if (!poll) {
            throw new Error('Poll not found for this event');
        }

        return poll;
    } catch (error: any) {
        console.error(`Error fetching event poll for eventId ${eventId} and pollId ${pollId}: ${error.message}`);
        throw new Error('Failed to fetch event poll');
    }
}

export const getPollIdByEventId = async (eventId: string): Promise<string> => {
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
        throw new Error('Invalid event ID');
    }

    try {
        const poll = await Poll.findOne({ eventId: new mongoose.Types.ObjectId(eventId) }).select('_id');
        return poll ? poll._id.toString() : null;
    } catch (error) {
        console.error('Error fetching poll ID by event ID:', error);
        throw error;
    }
};

export const hasUserVoted = async (pollId: string, userId: string): Promise<boolean> => {
    if (!pollId || !userId) {
        return false; // Return false when either pollId or userId is falsy
    }

    await connectToDatabase();

    try {
        // Retrieve the poll document from MongoDB
        const poll = await Poll.findById(pollId);
        if (!poll) {
            throw new Error(`Poll not found for id ${pollId}`);
        }

        // Check if the userId is included in the voters array
        const hasVoted = poll.voters.some((voter: any) =>
            voter._id.equals(userId)  // Compare MongoDB ObjectId directly
        );

        return hasVoted;
    } catch (error: any) {
        // Log the specific error message or type of error
        console.error(`Error checking if user has voted for pollId ${pollId}:`, error.message || error);
        throw new Error('Failed to check if user has voted');
    }
};