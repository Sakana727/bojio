"use server";

import { revalidatePath } from "next/cache";
import Post from "../models/post.model";
import User from "../models/user.model";

import { connectToDatabase } from "../mongoose";
import path from "path";
import { model } from "mongoose";
import Community from "../models/community.model";

interface Params {
  text: string;
  author: string;
  communityId: string | null;
  path: string;
}
export async function createPost({ text, author, communityId, path }: Params) {
  try {
    connectToDatabase();

    const communityIdObject = await Community.findOne(
      { id: communityId },
      { _id: 1 }
    );

    const createdPost = await Post.create({
      text,
      author,
      community: communityIdObject,
    });

    await User.findByIdAndUpdate(author, {
      $push: { posts: createdPost._id },
    });


    if (communityIdObject) {
      await Community.findByIdAndUpdate(communityIdObject, {
        $push: { posts: createdPost._id },
      });
    }

    revalidatePath(path);

  } catch (error: any) {
    throw new Error(`Error creating post: ${error.message}`);
  }
}

export async function fetchPosts(pageNumber = 1, pageSize = 20) {
  connectToDatabase();

  const skipAmount = (pageNumber - 1) * pageSize;

  const postsQuery = Post.find({ parentId: { $in: [null, undefined] } })
    .sort({ createdAt: "desc" })
    .skip(skipAmount)
    .limit(pageSize)
    .populate({ path: "author", model: User })
    .populate({ path: "community", model: Community })
    .populate({
      path: "children",
      populate: {
        path: "author",
        model: User,
        select: "_id name parentId image",
      },
    });

  const totalPostsCount = await Post.countDocuments({
    parentId: { $in: [null, undefined] },
  });

  const posts = await postsQuery.exec();

  const isNext = totalPostsCount > skipAmount + posts.length;

  return { posts, isNext };
}


export async function fetchPostById(id: string) {
  connectToDatabase();

  try {
    const post = await Post.findById(id)
      .populate({ path: "author", model: User, select: "_id id name image" })
      .populate({
        path: "community",
        model: Community,
        select: "_id id name image",
      })
      .populate({
        path: "children",
        populate: [
          {
            path: "author",
            model: User,
            select: "_id id name parentId image",
          },
          {
            path: "children",
            model: Post,
            populate: {
              path: "author",
              model: User,
              select: "_id id name parentId image",
            },
          },
        ],
      })
      .exec();

    return post;
  } catch (error: any) {
    throw new Error(`Error fetching post: ${error.message}`);
  }
}

async function fetchAllChildPosts(postId: string): Promise<any[]> {
  const childPosts = await Post.find({ parentId: postId });

  const descendantPosts = [];
  for (const childPost of childPosts) {
    const descendants = await fetchAllChildPosts(childPost._id);
    descendantPosts.push(childPost, ...descendants);
  }

  return descendantPosts;
}

export async function deletePost(id: string, path: string): Promise<void> {
  try {
    connectToDatabase();

    // Find the post to be deleted (the main post)
    const mainPost = await Post.findById(id).populate("author community");

    if (!mainPost) {
      throw new Error("Post not found");
    }

    // Fetch all child posts and their descendants recursively
    const descendantPosts = await fetchAllChildPosts(id);

    // Get all descendant post IDs including the main post ID and child post IDs
    const descendantPostIds = [
      id,
      ...descendantPosts.map((post) => post._id),
    ];

    // Extract the authorIds and communityIds to update User and Community models respectively
    const uniqueAuthorIds = new Set(
      [
        ...descendantPosts.map((post) => post.author?._id?.toString()), // Use optional chaining to handle possible undefined values
        mainPost.author?._id?.toString(),
      ].filter((id) => id !== undefined)
    );

    const uniqueCommunityIds = new Set(
      [
        ...descendantPosts.map((post) => post.community?._id?.toString()), // Use optional chaining to handle possible undefined values
        mainPost.community?._id?.toString(),
      ].filter((id) => id !== undefined)
    );

    // Recursively delete child posts and their descendants
    await Post.deleteMany({ _id: { $in: descendantPostIds } });

    // Update User model
    await User.updateMany(
      { _id: { $in: Array.from(uniqueAuthorIds) } },
      { $pull: { posts: { $in: descendantPostIds } } }
    );

    // Update Community model
    await Community.updateMany(
      { _id: { $in: Array.from(uniqueCommunityIds) } },
      { $pull: { posts: { $in: descendantPostIds } } }
    );

    revalidatePath(path);
  } catch (error: any) {
    throw new Error(`Failed to delete post: ${error.message}`);
  }
}

export async function addCommentToPost(
  postId: string,
  commentText: string,
  userId: string,
  path: string
) {
  connectToDatabase();

  try {
    const origianlPost = await Post.findById(postId);

    if (!origianlPost) {
      throw new Error("Post not found");
    }

    const commentPost = new Post({
      text: commentText,
      author: userId,
      parentId: postId,
    });

    const savedCommentPost = await commentPost.save();

    origianlPost.children.push(savedCommentPost._id);

    await origianlPost.save();

    revalidatePath(path);
  } catch (error: any) {
    throw new Error(`Error adding comment to post: ${error.message}`);
  }
}
