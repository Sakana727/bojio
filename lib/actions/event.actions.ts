"use server";

import { revalidatePath } from "next/cache";

import Community from "../models/community.model";
import User from "../models/user.model";
import Event from "../models/event.model";

import { connectToDatabase } from "../mongoose";
import mongoose from "mongoose";

interface Params {
    title: string;
    description: string;
    date: string;
    location: string;
    image: string;
    author: string;
    communityId: string;
    path: string;
}

interface Participant {
    id: string;
    username: string;
    name: string;
    image: string;
    bio: string;
}

interface UpdateParams {
    eventId: string;
    title?: string;
    description?: string;
    date?: string;
    location?: string;
    image?: string;
    author?: string;
    communityId?: string;
    path: string;
}


export async function createEvent({ title, description, date, location, image, author, communityId, path }: Params) {
    try {
        connectToDatabase();

        const authorIdObject = await User.findOne({ id: author }, { _id: 1 });
        if (!authorIdObject) {
            throw new Error(`Author with id ${author} not found`);
        }

        let communityIdObject = null;
        if (communityId) {
            communityIdObject = await Community.findOne({ id: communityId }, { _id: 1 });
            if (!communityIdObject) {
                throw new Error(`Community with id ${communityId} not found`);
            }
        }

        const createdEvent = await Event.create({
            title,
            description,
            date,
            location,
            image,
            author: authorIdObject._id,
            community: communityIdObject ? communityIdObject._id : null,
        });

        // Update author's events array
        await User.findByIdAndUpdate(authorIdObject._id, {
            $push: { events: createdEvent._id },
        });

        // Update community's events array if communityId is provided
        if (communityIdObject) {
            await Community.findByIdAndUpdate(communityIdObject._id, {
                $push: { events: createdEvent._id },
            });
        }

        revalidatePath(path); // Adjust according to your application logic

    } catch (error: any) {
        throw new Error(`Error creating event: ${error.message}`);
    }
}

export async function fetchEventById(eventId: string) {
    await connectToDatabase(); // Ensure you have a correct connection to MongoDB

    const event = await Event.findById(eventId)
        .populate({
            path: 'children',
            populate: [{
                path: 'author',
                model: 'User',
                select: 'id name image', // Select the fields you need from the user
            },
                // {
                //     path: 'poll', // Assuming there's a poll field in the children that references the Poll model
                //     model: Poll,
                // }
            ],
        })
        .populate('author', 'id name image') // Populate the main event author as well
        .populate({ path: 'community', select: "_id name image" })
        // .populate({
        //     path: 'participants',
        //     model: 'User',
        //     select: 'id name image', // Select the fields you need from the participants
        // })
        .populate('participants')
        .exec();

    return event;
}

export async function fetchAllChildEvents(eventId: string): Promise<any[]> {
    const childEvents = await Event.find({ parentId: eventId });

    const descendantEvents = [];
    for (const childEvent of childEvents) {
        const descendants = await fetchAllChildEvents(childEvent._id.toString());
        descendantEvents.push(childEvent, ...descendants);
    }

    return descendantEvents;
}

export async function deleteEvent(id: string, path: string): Promise<void> {
    try {
        await connectToDatabase();

        const mainEvent = await Event.findById(id).populate("author community");

        if (!mainEvent) {
            throw new Error("Event not found");
        }

        const descendantEvents = await fetchAllChildEvents(id);

        const descendantEventIds = [
            id,
            ...descendantEvents.map((event) => event._id.toString()),
        ];

        const uniqueAuthorIds = new Set(
            [
                ...descendantEvents.map((event) => event.author?._id?.toString()),
                mainEvent.author?._id?.toString(),
            ].filter((id) => id !== undefined)
        );

        const uniqueCommunityIds = new Set(
            [
                ...descendantEvents.map((event) => event.community?._id?.toString()),
                mainEvent.community?._id?.toString(),
            ].filter((id) => id !== undefined)
        );

        await Event.deleteMany({ _id: { $in: descendantEventIds } });

        await User.updateMany(
            { _id: { $in: Array.from(uniqueAuthorIds) } },
            { $pull: { events: { $in: descendantEventIds } } }
        );

        await Community.updateMany(
            { _id: { $in: Array.from(uniqueCommunityIds) } },
            { $pull: { events: { $in: descendantEventIds } } }
        );

        revalidatePath(path);
    } catch (error: any) {
        console.error(`Failed to delete event: ${error.message}`);
        throw new Error(`Failed to delete event: ${error.message}`);
    }
}

export async function addCommentToEvent(eventId: string, commentText: string, userId: string, path: string,) {
    await connectToDatabase(); // Ensure you have a correct connection to MongoDB

    try {
        const originalEvent = await Event.findById(eventId);

        if (!originalEvent) {
            throw new Error("Event not found");
        }

        // Create the comment object
        const CommentEvent = new Event({
            title: commentText,
            author: userId,
            parentId: eventId,

        });

        const savedCommentEvent = await CommentEvent.save();

        // Push the comment into the `comments` array
        originalEvent.children.push(savedCommentEvent._id);

        // Save the updated event document
        await originalEvent.save();

        // Assuming `revalidatePath` is a function to trigger revalidation
        revalidatePath(path);
    } catch (error: any) {
        throw new Error(`Error adding comment to event: ${error.message}`);
    }
}

export const fetchCommunityMembership = async (communityId: string, userId: string) => {
    await connectToDatabase();

    const community = await Community.findById(communityId).populate('members');

    if (!community) return false;

    return community.members.some((member: any) => member._id.toString() === userId);
};

export async function addParticipantToEvent(eventId: string, userId: string, path: string) {
    try {
        await connectToDatabase(); // Ensure database connection is established

        const originalEvent = await Event.findById(eventId);
        if (!originalEvent) {
            throw new Error('Event not found');
        }

        const participant = await User.findOne({ id: userId });
        if (!participant) {
            throw new Error('User not found');
        }

        // Check if user is already a participant
        if (originalEvent.participants.some((p: string) => p.toString() === participant._id.toString())) {
            throw new Error('User is already a participant in this event');
        }

        // Add userId to participants array
        originalEvent.participants.push(participant._id); // Ensure userId is correct

        // Save the updated event
        await originalEvent.save();

        // Revalidate path if needed
        revalidatePath(path);

    } catch (error: any) {
        console.error(`Failed to add participant to event: ${error.message}`);
        throw new Error(`Failed to add participant to event: ${error.message}`);
    }
}

export async function fetchParticipants(eventId: string): Promise<Participant[]> {
    try {
        await connectToDatabase(); // Ensure database connection is established

        const event = await Event.findById(eventId).populate('participants');
        if (!event) {
            throw new Error('Event not found');
        }

        return event.participants.map((participant: typeof User & Participant) => ({
            id: participant.id,
            username: participant.username,
            name: participant.name,
            image: participant.image,
            bio: participant.bio,
        }));
    } catch (error: any) {
        console.error(`Failed to fetch participants: ${error.message}`);
        throw new Error(`Failed to fetch participants: ${error.message}`);
    }
}

export async function updateEvent({
    eventId,
    title,
    description,
    date,
    location,
    image,
    author,
    communityId,
    path,
}: UpdateParams) {
    try {
        console.log("Connecting to the database...");
        await connectToDatabase();

        const updateData: any = {};

        if (title) updateData.title = title;
        if (description) updateData.description = description;
        if (date) updateData.date = date;
        if (location) updateData.location = location;
        if (image) updateData.image = image;

        console.log("Update data prepared:", updateData);

        // Handle author update if provided
        if (author) {
            const authorIdObject = await User.findOne({ id: author }, { _id: 1 });
            if (!authorIdObject) {
                throw new Error(`Author with id ${author} not found`);
            }
            updateData.author = authorIdObject._id;
        }

        // Handle community update if provided
        if (communityId) {
            const communityIdObject = await Community.findOne(
                { id: communityId },
                { _id: 1 }
            );
            if (!communityIdObject) {
                throw new Error(`Community with id ${communityId} not found`);
            }
            updateData.community = communityIdObject._id;
        }

        console.log("Final update data:", updateData);

        const updatedEvent = await Event.findByIdAndUpdate(eventId, updateData, {
            new: true,
        });

        if (!updatedEvent) {
            throw new Error(`Event with id ${eventId} not found`);
        }

        console.log("Event updated successfully:", updatedEvent);

        // Revalidate path if needed
        revalidatePath(path);

    } catch (error: any) {
        console.error("Error updating event:", error);
        throw new Error(`Error updating event: ${error.message}`);
    }
}