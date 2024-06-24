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

// export async function fetchEvents(pageNumber = 1, pageSize = 20) {
//     await connectToDatabase();

//     const skipAmount = (pageNumber - 1) * pageSize;

//     const eventsQuery = Event.find()
//         .sort({ createdAt: "desc" })
//         .skip(skipAmount)
//         .limit(pageSize)
//         .populate({ path: "author", select: "_id name image" })
//         .populate({ path: "community", select: "_id name image" });

//     const totalEventsCount = await Event.countDocuments();

//     const events = await eventsQuery.exec();

//     const isNext = totalEventsCount > skipAmount + events.length;

//     return { events, isNext };
// }

export async function fetchEventById(eventId: string) {
    await connectToDatabase(); // Ensure you have a correct connection to MongoDB

    const event = await Event.findById(eventId)
        .populate({
            path: 'children',
            populate: {
                path: 'author',
                model: 'User',
                select: 'id name image', // Select the fields you need from the user
            },
        })
        .populate('author', 'id name image') // Populate the main event author as well
        .populate({ path: 'community', select: "_id name image" })
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
        throw new Error(`Failed to delete event: ${error.message}`);
    }
}

export async function addCommentToEvent(
    eventId: string,
    commentText: string,
    userId: string,
    path: string,


) {
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