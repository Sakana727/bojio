"use server"
import { revalidatePath } from "next/cache";
import Post from "../models/post.model";
import User from "../models/user.model";
import { connectToDatabase } from "../mongoose";

interface Params {
    text: string,
    author: string,
    communityId: string | null,
    path: string,
}
export async function createPost( 
    {
        text, author, communityId, path
    }:
    Params
){

    try {
          connectToDatabase()

    const createdPost = await Post.create({
        text, 
        author, 
        community: null,
    })

    await User.findByIdAndUpdate(author, {
        $push: { posts : createdPost._id}
    })

    revalidatePath(path)
    } catch (error: any) {
        throw new Error(`Error creating post: ${error.message}`)
    }

  
}

export async function fetchPosts(pageNumber = 1, pageSize = 20) {
    connectToDatabase()

    const skipAmount = (pageNumber -1) * pageSize

    const postsQuery = Post.find({ parentId: { $in: [null, undefined]}})
    .sort({ createdAt: 'desc'})
    .skip(skipAmount)
    .limit(pageSize)
    .populate({ path: 'author', model: User})
    .populate({ 
        path: 'children', 
        populate: 'author', 
        model: User,
        select: "_id name parent_id image"})
    

    const totalPostsCount = await Post.countDocuments({ parentId: { $in: [null, undefined]}})

    const posts = await postsQuery.exec()

    const isNext = totalPostsCount > skipAmount + posts.length

    return { posts, isNext}

}
