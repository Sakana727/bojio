"use server"

import { revalidatePath } from "next/cache";
import User from "../models/user.model";
import { connectToDatabase } from "../mongoose"
import Post from "../models/post.model";
import { FilterQuery, model, SortOrder } from "mongoose";
import Community from "../models/community.model";

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
}:
  {
    userId: string
    searchString?: string
    pageNumber?: number
    pageSize?: number
    sortBy?: SortOrder
  }

) {

  try {
    connectToDatabase()

    const skipAmount = (pageNumber - 1) * pageSize;

    const regex = new RegExp(searchString, "i")

    const query: FilterQuery<typeof User> = {
      id: { $ne: userId }
    }

    if (searchString.trim() !== "") {
      query.$or = [
        { username: { $regex: regex } },
        { name: { $regex: regex } },
      ]
    }

    const sortOptions = { createdAt: sortBy }

    const usersQuery = User.find(query)
      .sort(sortOptions)
      .skip(skipAmount)
      .limit(pageSize)


    const totalUsersCount = await User.countDocuments(query)
    const users = await usersQuery.exec()
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

    return replies;

  } catch (error: any) {
    throw new Error(`Failed to fetch activity: ${error.message}`);
  }
}