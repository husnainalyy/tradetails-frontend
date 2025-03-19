'use client'

import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast"
import { PostCard } from './PostCard';
import { UserProfile } from './UserProfile';

const Posts = () => {
    const { user } = useUser();
    const { toast } = useToast();
    const [posts, setPosts] = useState([]);
    const [newPost, setNewPost] = useState({ title: '', description: '', images: [] });
    const [selectedUserId, setSelectedUserId] = useState(null);

    useEffect(() => {
        fetchPosts();
    }, [user]);

    const fetchPosts = async () => {
        if (!user) return;
        try {
            const response = await fetch('https://tradetails-backend-production.up.railway.app/api/posts', {
                headers: {
                    Authorization: `Clerk ${user.id}`,
                    'Content-Type': 'application/json',
                },
            });
            if (!response.ok) {
                throw new Error('Failed to fetch posts');
            }
            const data = await response.json();
            setPosts(data.posts);
        } catch (error) {
            console.error('Error fetching posts:', error);
            toast({
                title: "Error",
                description: "Failed to fetch posts. Please try again.",
                variant: "destructive",
            });
        }
    };

    const handleCreatePost = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('title', newPost.title);
            formData.append('description', newPost.description);
            newPost.images.forEach((image, index) => {
                formData.append(`images`, image);
            });

            const response = await fetch('https://tradetails-backend-production.up.railway.app/api/posts', {
                method: 'POST',
                headers: {
                    Authorization: `Clerk ${user.id}`,
                },
                body: formData,
            });

            if (response.ok) {
                toast({
                    title: "Success",
                    description: "Post created successfully!",
                });
                setNewPost({ title: '', description: '', images: [] });
                fetchPosts();
            } else {
                throw new Error('Failed to create post');
            }
        } catch (error) {
            console.error('Error creating post:', error);
            toast({
                title: "Error",
                description: "Failed to create post. Please try again.",
                variant: "destructive",
            });
        }
    };

    const handleLike = async (postId) => {
        try {
            const response = await fetch(`https://tradetails-backend-production.up.railway.app/api/posts/${postId}/like`, {
                method: 'POST',
                headers: {
                    Authorization: `Clerk ${user.id}`,
                    'Content-Type': 'application/json',
                },
            });
            if (response.ok) {
                fetchPosts();
            } else {
                throw new Error('Failed to like post');
            }
        } catch (error) {
            console.error('Error liking post:', error);
            toast({
                title: "Error",
                description: "Failed to like post. Please try again.",
                variant: "destructive",
            });
        }
    };

    const handleComment = async (postId, comment) => {
        try {
            const response = await fetch(`https://tradetails-backend-production.up.railway.app/api/posts/${postId}/comment`, {
                method: 'POST',
                headers: {
                    Authorization: `Clerk ${user.id}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ comment }),
            });
            if (response.ok) {
                fetchPosts();
            } else {
                throw new Error('Failed to add comment');
            }
        } catch (error) {
            console.error('Error commenting on post:', error);
            toast({
                title: "Error",
                description: "Failed to add comment. Please try again.",
                variant: "destructive",
            });
        }
    };

    const handleUserClick = (userId) => {
        setSelectedUserId(userId);
    };

    return (
        <div className="container mx-auto p-4">
            {selectedUserId ? (
                <>
                    <Button onClick={() => setSelectedUserId(null)} className="mb-4">Back to Posts</Button>
                    <UserProfile userId={selectedUserId} />
                </>
            ) : (
                <>
                    <Card className="mb-8 ">
                        <CardHeader>
                            <h2 className="text-2xl font-bold">Create a New Post</h2>
                        </CardHeader>
                        <CardContent>
                                <form onSubmit={handleCreatePost} className="space-y-4 text-black">
                                <Input
                                    placeholder="Title"
                                    value={newPost.title}
                                    onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                                    required
                                />
                                <Textarea
                                    placeholder="Description"
                                    value={newPost.description}
                                    onChange={(e) => setNewPost({ ...newPost, description: e.target.value })}
                                    required
                                />
                                <Input
                                    type="file"
                                        multiple
                                        className="text-white"
                                    onChange={(e) => setNewPost({ ...newPost, images: Array.from(e.target.files) })}
                                    accept="image/*"
                                />
                                <Button type="submit" className="border text-white">Create Post</Button>
                            </form>
                        </CardContent>
                    </Card>

                    <div className="space-y-8">
                        {posts.map((post) => (
                            <PostCard
                                key={post._id}
                                post={post}
                                onLike={handleLike}
                                onComment={(comment) => handleComment(post._id, comment)}
                                onUserClick={handleUserClick}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default Posts;
