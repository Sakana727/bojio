"use server"
import { revalidatePath } from "next/cache";
import Post from "../models/post.model";
import User from "../models/user.model";
import { connectToDatabase } from "../mongoose";
import path from "path";
import { model } from "mongoose";

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

export async function fetchPostById(id: string){
    connectToDatabase()

    try {
        const post = await Post.findById(id)
        .populate({ path: 'author', model: User, select: "_id id name image"})
        .populate({ 
            path: 'children', 
            populate: [
                {
                    path: 'author',
                    model: User,
                    select: "_id id name parentId image",
                },
                {
                    path: 'children',
                    model: Post,
                    populate: {
                        path: 'author',
                        model: User,
                        select: "_id id name parentId image"
                    }
    
                }
            ],
        }).exec();

        return post
    } catch (error: any) {
        throw new Error (`Error fetching post: ${error.message}`)
    }
}

export async function addCommentToPost( 
    postId: string, 
    commentText: string,
    userId: string,
    path: string,
){
    connectToDatabase()

    try {
        const origianlPost = await Post.findById(postId)

        if(!origianlPost){
            throw new Error("Post not found")
        }
        
        const commentPost = new Post({
            text: commentText,
            author: userId,
            parentId: postId,
        })

        const savedCommentPost = await commentPost.save()

        origianlPost.children.push(savedCommentPost._id)

        await origianlPost.save()

        revalidatePath(path)

    } catch (error: any) {
        throw new Error (`Error adding comment to post: ${error.message}`)
    }
}