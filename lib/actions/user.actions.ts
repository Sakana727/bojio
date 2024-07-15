"use server"

import { revalidatePath } from "next/cache";
import User from "../models/user.model";
import { connectToDatabase } from "../mongoose"
import Post from "../models/post.model";
import { FilterQuery, model, SortOrder } from "mongoose";
import Community from "../models/community.model";
import Event from "../models/event.model";
interface Params {
  userId: string,
  username: string,
  name: string,
  bio: string,
  image: string,
  path: string,
}

export async function updateUser({
  userId,
  bio,
  name,
  path,
  username,
  image,
}: Params): Promise<void> {
  try {
    connectToDatabase();

    await User.findOneAndUpdate(
      { id: userId },
      {
        username: username.toLowerCase(),
        name,
        bio,
        image,
        onboarded: true,
      },
      { upsert: true }
    );

    if (path === "/profile/edit") {
      revalidatePath(path);
    }
  } catch (error: any) {
    //   throw new Error(`Failed to create/update user: ${error.message}`);
    console.error(error.message);
  }
}

export async function fetchUser(userId: string) {
  try {
    connectToDatabase();
    return await User.findOne({ id: userId })
      .populate({
        path: 'communities',
        model: Community
      });
  } catch (error: any) {
    throw new Error(`Failed to fetch user: ${error.message}`);
  }
}

export async function fetchUserPosts(userId: string) {
  try {
    connectToDatabase()

    const posts = await User.findOne({ id: userId })
      .populate({
        path: 'posts',
        model: Post,
        populate: [
          {
            path: "community",
            model: Community,
            select: "name id image _id",
          },
          {
            path: 'children',
            model: Post,
            populate: {
              path: 'author',
              model: User,
              select: 'name image id'
            }
          }
        ]
      })
    return posts
  } catch (error: any) {
    throw new Error(`Failed to fetch user posts: ${error.message}`);
  }

}

export async function fetchUsers({
  userId,
  searchString = "",
  pageNumber = 1,
  pageSize = 20,
  sortBy = "desc"
}: {
  userId: string,
  searchString?: string,
  pageNumber?: number,
  pageSize?: number,
  sortBy?: SortOrder
}) {
  try {
    await connectToDatabase(); // Ensure proper database connection

    const skipAmount = (pageNumber - 1) * pageSize;
    const regex = new RegExp(searchString, "i");

    let query: any = { id: { $ne: userId } };

    if (searchString.trim() !== "") {
      query.$or = [
        { username: { $regex: regex } },
        { name: { $regex: regex } }
      ];
    }

    const sortOptions = { createdAt: sortBy };

    const usersQuery = User.find(query)
      .sort(sortOptions)
      .skip(skipAmount)
      .limit(pageSize);

    const [users, totalUsersCount] = await Promise.all([
      usersQuery.exec(),
      User.countDocuments(query)
    ]);

    const isNext = totalUsersCount > skipAmount + users.length;

    return { users, isNext };
  } catch (error: any) {
    throw new Error(`Failed to fetch users: ${error.message}`);
  }
}

export async function getActivity(userId: string) {
  try {
    connectToDatabase()

    const userPosts = await Post.find({ author: userId })

    const childPostIds = userPosts.reduce((acc, userPost) => {
      return acc.concat(userPost.children)
    }, [])

    const replies = await Post.find({
      _id: { $in: childPostIds },
      author: { $ne: userId }
    }).populate({
      path: 'author',
      model: User,
      select: 'name image _id'
    })
      .lean(); // Convert to plain JavaScript objects

    return replies.map((reply) => ({
      ...reply,
      type: "comment",
    }));

  } catch (error: any) {
    throw new Error(`Failed to fetch activity: ${error.message}`);
  }
}

export async function fetchUserEvents(userId: string) {
  try {
    await connectToDatabase();

    const userEvents = await User.findOne({ id: userId }).populate({
      path: "events",
      model: Event,
      populate: {
        path: "community",
        model: Community,
        select: "name id image",
      },
    });

    return userEvents;
  } catch (error) {
    console.error("Error fetching user events:", error);
    throw error;
  }
}

export async function getEventActivity(userId: string) {
  try {
    await connectToDatabase(); // Ensure you have a correct connection to MongoDB

    const userEvents = await Event.find({ author: userId });

    const childEventIds = userEvents.reduce((acc, userEvent) => {
      return acc.concat(userEvent.children);
    }, []);

    const replies = await Event.find({
      _id: { $in: childEventIds },
      author: { $ne: userId },
    }).populate({
      path: 'author',
      model: User,
      select: 'name image _id',
    });

    const activityWithTypes = replies.map((reply) => ({
      ...reply.toObject(),
      type: 'event',
    }));

    return activityWithTypes;
  } catch (error: any) {
    throw new Error(`Failed to fetch event activity: ${error.message}`);
  }
}